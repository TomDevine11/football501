#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────
// PRERENDER — turns the built SPA into one static HTML file per route.
//
// Runs after `vite build`. For every route in src/seo/seoConfig.js it writes
// dist/<path>/index.html with that route's unique <title>, meta, canonical,
// Open Graph/Twitter tags and JSON-LD structured data baked into <head>, plus
// real crawlable content (h1, how-to, FAQ, internal links) inside #root so
// crawlers — including non-JS social bots — see a complete page before any
// JavaScript runs. The SPA then boots and replaces #root with the live game.
//
// Also emits dist/sitemap.xml and dist/robots.txt from the same config.
// ─────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, mkdirSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import {
  ROUTES, SITE_URL, BRAND, absolute, metaTagsFor, jsonLdFor, indexableRoutes,
} from '../src/seo/seoConfig.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DIST = path.join(__dirname, '..', 'dist')
const template = readFileSync(path.join(DIST, 'index.html'), 'utf8')

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Remove any SEO tags the template ships with so we don't duplicate them.
function stripManaged(html) {
  return html
    .replace(/\n?\s*<meta\s+name="description"[^>]*>/gi, '')
    .replace(/\n?\s*<meta\s+name="keywords"[^>]*>/gi, '')
    .replace(/\n?\s*<meta\s+name="robots"[^>]*>/gi, '')
    .replace(/\n?\s*<meta\s+name="theme-color"[^>]*>/gi, '')
    .replace(/\n?\s*<meta\s+property="og:[^"]*"[^>]*>/gi, '')
    .replace(/\n?\s*<meta\s+name="twitter:[^"]*"[^>]*>/gi, '')
    .replace(/\n?\s*<link\s+rel="canonical"[^>]*>/gi, '')
}

function headFor(route) {
  const lines = [`<link rel="canonical" href="${absolute(route.path)}" data-seo>`]
  for (const t of metaTagsFor(route)) {
    const attr = t.name ? `name="${esc(t.name)}"` : `property="${esc(t.property)}"`
    lines.push(`<meta ${attr} content="${esc(t.content)}" data-seo>`)
  }
  for (const block of jsonLdFor(route)) {
    lines.push(`<script type="application/ld+json" data-seo>${JSON.stringify(block)}</script>`)
  }
  return lines.join('\n    ')
}

// Crawlable supporting content + internal links, mirroring what the app renders
// visibly (SeoContent / Hub). Kept visually hidden so it adds no visual flash,
// but it's present in the raw HTML for first-pass indexing, non-JS crawlers, and
// — importantly — link discovery, so Google can find every game page from the
// homepage's static HTML without having to render JavaScript first.
function crawlable(route) {
  const link = (p, name) => `<a href="${p}">${esc(name)}</a>`
  let h = ''
  if (route.about) h += `<p>${esc(route.about)}</p>`
  if (route.howTo?.length) {
    h += `<h2>How to play ${esc(route.name)}</h2><ol>`
    for (const s of route.howTo) h += `<li>${esc(s)}</li>`
    h += `</ol>`
  }
  if (route.faq?.length) {
    h += `<h2>Frequently asked questions</h2><dl>`
    for (const f of route.faq) h += `<dt>${esc(f.q)}</dt><dd>${esc(f.a)}</dd>`
    h += `</dl>`
  }
  const others = indexableRoutes().filter(o => o.path !== route.path)
  h += `<nav aria-label="Football trivia games"><h2>More football trivia games</h2><ul>`
  if (route.path !== '/') h += `<li>${link('/', 'Football Trivia Games')}</li>`
  for (const o of others.filter(o => o.path !== '/')) h += `<li>${link(o.path, o.name)}</li>`
  h += `</ul></nav>`
  return h
}

// The #root content shown before the SPA boots: a minimal, app-consistent
// loading screen (dark background, brand + tagline) — so there's no jarring
// flash when React replaces #root — PLUS a visually-hidden block with the full
// crawlable content and internal links. Both are inside #root and cleared on
// mount, so the visible UX is unchanged. Head also carries title/meta/canonical/
// Open Graph/JSON-LD, so crawlers get the complete picture from static HTML.
const SR_ONLY = 'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0'
function staticBody(route) {
  return `<div style="min-height:100vh;background:#0a0a0a;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:2rem;font-family:system-ui,-apple-system,sans-serif">`
    + `<h1 style="color:#fff;font-size:1.75rem;font-weight:800;margin:0">${esc(route.h1)}</h1>`
    + `<p style="color:#9ca3af;margin:.5rem 0 0;max-width:34rem">${esc(route.tagline)}</p>`
    + `<div style="${SR_ONLY}">${crawlable(route)}</div>`
    + `</div>`
}

function buildPage(route) {
  let html = stripManaged(template)
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${esc(route.title)}</title>`)
  html = html.replace(/<\/head>/i, `    ${headFor(route)}\n  </head>`)
  html = html.replace(/<div id="root">\s*<\/div>/i, `<div id="root">${staticBody(route)}</div>`)
  return html
}

function writeRoute(route) {
  const html = buildPage(route)
  if (route.path === '/') {
    writeFileSync(path.join(DIST, 'index.html'), html)
  } else {
    const dir = path.join(DIST, route.path.replace(/^\//, ''))
    mkdirSync(dir, { recursive: true })
    writeFileSync(path.join(dir, 'index.html'), html)
  }
  console.error(`  ✓ ${route.path}`)
}

function writeSitemap() {
  const today = new Date().toISOString().slice(0, 10)
  const urls = indexableRoutes().map(r =>
    `  <url>\n    <loc>${absolute(r.path)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${r.changefreq || 'weekly'}</changefreq>\n    <priority>${r.priority || '0.7'}</priority>\n  </url>`
  ).join('\n')
  writeFileSync(path.join(DIST, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`)
  console.error('  ✓ sitemap.xml')
}

function writeRobots() {
  writeFileSync(path.join(DIST, 'robots.txt'),
    `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`)
  console.error('  ✓ robots.txt')
}

console.error(`Prerendering ${BRAND} (${ROUTES.length} routes)…`)
for (const route of ROUTES) writeRoute(route)
writeSitemap()
writeRobots()
console.error('Done.')

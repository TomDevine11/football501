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

function staticBody(route) {
  const link = (p, name) => `<a href="${p}" style="color:#34d399;text-decoration:none">${esc(name)}</a>`
  let h = `<main style="min-height:100vh;background:#0a0a0a;max-width:40rem;margin:0 auto;padding:2.5rem 1.25rem;color:#e5e7eb;font-family:system-ui,-apple-system,sans-serif">`
  h += `<h1 style="font-size:1.9rem;font-weight:800;color:#fff;margin:0 0 .25rem">${esc(route.h1)}</h1>`
  h += `<p style="color:#9ca3af;margin:0 0 1rem">${esc(route.tagline)}</p>`
  if (route.path !== '/') h += `<p style="margin:0 0 1.5rem">${link(route.path, '▶ Play ' + route.name)}</p>`

  if (route.howTo?.length) {
    h += `<h2 style="color:#fff;font-size:1.15rem;margin:1.5rem 0 .5rem">How to play ${esc(route.name)}</h2><ol style="color:#9ca3af;line-height:1.6">`
    for (const s of route.howTo) h += `<li>${esc(s)}</li>`
    h += `</ol>`
  }
  if (route.faq?.length) {
    h += `<h2 style="color:#fff;font-size:1.15rem;margin:1.5rem 0 .5rem">Frequently asked questions</h2><dl>`
    for (const f of route.faq) h += `<dt style="color:#e5e7eb;font-weight:600;margin-top:.85rem">${esc(f.q)}</dt><dd style="color:#9ca3af;margin:.15rem 0 0">${esc(f.a)}</dd>`
    h += `</dl>`
  }

  const others = indexableRoutes().filter(o => o.path !== route.path && o.path !== '/')
  const navItems = route.path === '/'
    ? indexableRoutes().filter(o => o.path !== '/')
    : [{ path: '/', name: 'Football Trivia Games' }, ...others]
  h += `<nav aria-label="Football trivia games" style="margin-top:1.75rem"><h2 style="color:#fff;font-size:1.15rem;margin:0 0 .5rem">${route.path === '/' ? 'Our games' : 'More football trivia games'}</h2><ul style="line-height:1.9;padding-left:1.1rem">`
  for (const o of navItems) h += `<li>${link(o.path, o.name)}</li>`
  h += `</ul></nav></main>`
  return h
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

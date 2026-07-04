import { useEffect } from 'react'
import { routeByPath, metaTagsFor, jsonLdFor, absoluteFor, alternatesFor } from './seoConfig'
import { useI18n } from '../i18n'

// Manages the document <head> for the current route + locale on the client, so
// that SPA navigation updates the title, meta, canonical, hreflang and JSON-LD
// (the prerender bakes the same tags into the initial HTML for crawlers). All
// managed nodes are tagged data-seo so they can be replaced cleanly.
function clearManaged() {
  document.querySelectorAll('head [data-seo]').forEach(el => el.remove())
}

function addMeta({ name, property, content }) {
  const el = document.createElement('meta')
  if (name) el.setAttribute('name', name)
  if (property) el.setAttribute('property', property)
  el.setAttribute('content', content)
  el.setAttribute('data-seo', '')
  document.head.appendChild(el)
}

function addLink(rel, href, extra = {}) {
  const el = document.createElement('link')
  el.setAttribute('rel', rel)
  el.setAttribute('href', href)
  for (const [k, v] of Object.entries(extra)) el.setAttribute(k, v)
  el.setAttribute('data-seo', '')
  document.head.appendChild(el)
}

function addJsonLd(blocks) {
  for (const block of blocks) {
    const el = document.createElement('script')
    el.type = 'application/ld+json'
    el.setAttribute('data-seo', '')
    el.textContent = JSON.stringify(block)
    document.head.appendChild(el)
  }
}

export default function Seo({ path }) {
  const { locale } = useI18n()
  useEffect(() => {
    const route = routeByPath(path, locale)
    document.title = route.title
    document.documentElement.lang = locale
    clearManaged()
    addLink('canonical', absoluteFor(path, locale))
    if (!route.noindex) {
      for (const alt of alternatesFor(path)) addLink('alternate', alt.href, { hreflang: alt.hreflang })
    }
    metaTagsFor(route, locale).forEach(addMeta)
    addJsonLd(jsonLdFor(route, locale))
  }, [path, locale])
  return null
}

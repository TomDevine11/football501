import { useEffect } from 'react'
import { routeByPath, metaTagsFor, jsonLdFor, absolute } from './seoConfig'

// Manages the document <head> for the current route on the client, so that
// SPA navigation updates the title, meta, canonical and JSON-LD (the prerender
// bakes the same tags into the initial HTML for crawlers). All managed nodes
// are tagged data-seo so they can be replaced cleanly on each navigation.
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

function addCanonical(href) {
  const el = document.createElement('link')
  el.setAttribute('rel', 'canonical')
  el.setAttribute('href', href)
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
  useEffect(() => {
    const route = routeByPath(path)
    document.title = route.title
    clearManaged()
    addCanonical(absolute(route.path))
    metaTagsFor(route).forEach(addMeta)
    addJsonLd(jsonLdFor(route))
  }, [path])
  return null
}

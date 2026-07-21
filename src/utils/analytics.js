// ─────────────────────────────────────────────────────────────────────────
// ANALYTICS — config-driven, privacy-light, INERT unless an id is set.
//
// Set VITE_ANALYTICS_ID (a GA4 measurement id, "G-XXXXXXX") in your deploy env
// and rebuild to activate. With no id, every function below is a no-op — the
// GA script is never loaded, so there's zero effect on the build or on users.
//
// Tracked (from central points, so no per-game wiring):
//   • page_view    — on every route change (which games pull traffic)
//   • game_complete — once per completed daily game (engagement)
//   • share        — when a result is shared (virality)
// ─────────────────────────────────────────────────────────────────────────
const ID = import.meta.env.VITE_ANALYTICS_ID
let started = false

export function initAnalytics() {
  if (started || !ID || typeof window === 'undefined') return
  started = true
  const s = document.createElement('script')
  s.async = true
  s.src = `https://www.googletagmanager.com/gtag/js?id=${ID}`
  document.head.appendChild(s)
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() { window.dataLayer.push(arguments) }
  window.gtag('js', new Date())
  // SPA: suppress GA's automatic page_view; we send them on route change.
  window.gtag('config', ID, { send_page_view: false })
}

export function pageview(path) {
  if (!ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', 'page_view', { page_path: path, page_location: window.location.href, page_title: document.title })
}

export function track(event, params = {}) {
  if (!ID || typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', event, params)
}

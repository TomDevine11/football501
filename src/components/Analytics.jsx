import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { initAnalytics, pageview } from '../utils/analytics'

// Mounts once at the app root: initialises analytics (no-op without an id) and
// sends a page_view on every route change (SPA navigations GA can't see).
export default function Analytics() {
  const { pathname } = useLocation()
  useEffect(() => { initAnalytics() }, [])
  useEffect(() => { pageview(pathname) }, [pathname])
  return null
}

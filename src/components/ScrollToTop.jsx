import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

// On every route change, jump to the top BEFORE the browser paints — so a new
// gamemode always opens at the top, with no visible scroll animation (unlike a
// smooth scroll-to-top). useLayoutEffect runs synchronously after the DOM
// updates but before paint, so the page never flashes mid-scroll.
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

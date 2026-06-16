import { useEffect } from 'react'
import { ADS_ENABLED, ADSENSE_CLIENT, AD_SLOTS } from './adsConfig'

// A reserved ad placement. While ADS_ENABLED is false it renders nothing at all
// (no DOM, no scripts, no space) — so it's a true no-op drop-in. When enabled,
// it renders a responsive AdSense unit for the named slot.
export default function AdSlot({ name, className = '' }) {
  useEffect(() => {
    if (!ADS_ENABLED) return
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}) } catch { /* script not loaded */ }
  }, [])

  if (!ADS_ENABLED) return null

  return (
    <div className={`w-full max-w-3xl mx-auto my-8 ${className}`}>
      <div className="text-[10px] uppercase tracking-widest text-gray-700 text-center mb-1">Advertisement</div>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={AD_SLOTS[name]}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}

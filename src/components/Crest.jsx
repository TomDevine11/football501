import { useState } from 'react'
import { crestUrl } from '../data/crests'

// Tokens that aren't useful for a monogram (club-type words / articles).
const SKIP = new Set(['fc', 'afc', 'cf', 'ac', 'sc', 'ssc', 'as', 'bsc', 'cd', 'sd', 'ud', 'fk', 'sk', 'the', 'de', 'of'])

function initials(name) {
  const words = name.replace(/[.(),]/g, ' ').split(/\s+/).filter(w => w && !SKIP.has(w.toLowerCase()))
  const picked = words.slice(0, 2).map(w => w[0]).join('')
  return (picked || name.replace(/\s/g, '').slice(0, 2)).toUpperCase()
}

// Shows a club's badge, or a clean initials monogram when we have no crest (or
// the image fails to load) — so an unresolved club never looks broken.
export default function Crest({ name, size = 28, className = '' }) {
  const url = crestUrl(name)
  const [failed, setFailed] = useState(false)
  const box = { width: size, height: size }

  if (url && !failed) {
    return (
      <img
        src={url}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
        style={box}
        className={`object-contain shrink-0 ${className}`}
      />
    )
  }

  return (
    <span
      aria-hidden="true"
      style={box}
      className={`shrink-0 inline-flex items-center justify-center rounded-full bg-gray-800 border border-gray-700 text-gray-400 font-bold leading-none ${className}`}
    >
      <span style={{ fontSize: Math.max(9, Math.round(size * 0.36)) }}>{initials(name)}</span>
    </span>
  )
}

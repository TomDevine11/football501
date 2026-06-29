import { useState } from 'react'
import { categoryIcon } from '../data/categoryIcons'

const SKIP = new Set(['fc', 'afc', 'cf', 'ac', 'sc', 'ssc', 'as', 'bsc', 'cd', 'sd', 'ud', 'the', 'de', 'of'])
function initials(value) {
  const words = value.replace(/[.(),0-9]/g, ' ').split(/\s+/).filter(w => w && !SKIP.has(w.toLowerCase()))
  const picked = words.slice(0, 2).map(w => w[0]).join('')
  return (picked || value.replace(/\s/g, '').slice(0, 2)).toUpperCase()
}

// Icon for a TicTacToe/Connections category ({ type, value }). Shows a crest /
// league logo / flag / trophy emoji, or a clean monogram when there's no image.
export default function CategoryIcon({ category, size = 20, className = '' }) {
  const icon = categoryIcon(category)
  const [failed, setFailed] = useState(false)
  const box = { width: size, height: size }

  if (icon?.emoji) {
    return <span aria-hidden="true" className={`shrink-0 inline-flex items-center justify-center ${className}`} style={{ ...box, fontSize: Math.round(size * 0.92), lineHeight: 1 }}>{icon.emoji}</span>
  }
  if (icon?.img && !failed) {
    return <img src={icon.img} alt="" loading="lazy" onError={() => setFailed(true)} style={box} className={`object-contain shrink-0 ${className}`} />
  }
  return (
    <span aria-hidden="true" style={box} className={`shrink-0 inline-flex items-center justify-center rounded-full bg-gray-800 border border-gray-700 text-gray-400 font-bold leading-none ${className}`}>
      <span style={{ fontSize: Math.max(8, Math.round(size * 0.4)) }}>{initials(category.value)}</span>
    </span>
  )
}

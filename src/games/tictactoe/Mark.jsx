// Sleek X / O glyphs for the football tic-tac-toe board — replaces the
// ❌ / ⭕ emoji with minimal stroked SVG (X = red, O = blue) that matches the
// app's line-icon aesthetic. Colour can be overridden via className.
export default function Mark({ mark, size = 24, className = '' }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', 'aria-hidden': true }
  if (mark === 'O') {
    return (
      <svg {...common} className={`text-blue-400 ${className}`}>
        <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="2.6" />
      </svg>
    )
  }
  return (
    <svg {...common} className={`text-red-400 ${className}`}>
      <line x1="6.7" y1="6.7" x2="17.3" y2="17.3" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      <line x1="17.3" y1="6.7" x2="6.7" y2="17.3" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  )
}

// Triviverse brand mark — "bolt orbit": the quick-fire trivia bolt held in an
// orbit ring (the verse). Chosen in the 2026-07 rebrand design rounds.
// currentColor so context sets the colour (brand purple in chrome, white on tiles).
export default function BrandMark({ className = 'w-4 h-4' }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M13.4 3 7 13.2h3.8L9.6 21l6.9-10.6h-3.8z" fill="currentColor" />
      <ellipse
        cx="12" cy="12" rx="11" ry="4.6"
        fill="none" stroke="currentColor" strokeWidth="1.4"
        transform="rotate(-22 12 12)"
      />
    </svg>
  )
}

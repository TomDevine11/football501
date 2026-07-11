// Completion popup shown when a game ends — holds the result, stats, share,
// play-again and "try another game" so the post-game actions are front-and-centre
// instead of hidden below the board. Closable (X or backdrop) to review the board.
//
// Scroll structure: the fixed overlay scrolls, and an inner min-h-full flex
// wrapper centres the card when it fits but lets it grow and scroll from the top
// when the content is taller than the viewport (avoids the classic flex-centre
// top-clipping bug).
export default function ResultModal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-modal bg-black/70 backdrop-blur-sm overflow-y-auto result-modal-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="result-card relative w-full max-w-md bg-surface border border-border-strong rounded-2xl shadow-modal px-5 py-6 flex flex-col items-center"
          onClick={e => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-primary hover:bg-border transition-colors text-lg leading-none"
          >
            ✕
          </button>
          {children}
        </div>
      </div>
    </div>
  )
}

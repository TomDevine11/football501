// Completion screen shown when a game ends — holds the result, stats, share,
// play-again and "try another game" so the post-game actions are front-and-centre
// instead of hidden below the board.
//
// Two presentations from the same content:
//   • overlay (default) — a closable modal (X or backdrop), used for the daily
//     end screen and the locked "already played today" state.
//   • inline — an in-flow card under the board, used by Unlimited mode so replay
//     never gets interrupted by a popup.
//
// Scroll structure (overlay): the fixed overlay scrolls, and an inner min-h-full
// flex wrapper centres the card when it fits but lets it grow and scroll from the
// top when taller than the viewport (avoids the classic flex-centre top-clip bug).
export default function ResultModal({ open, onClose, inline = false, children }) {
  if (!open) return null
  if (inline) {
    return (
      <div className="result-card w-full max-w-md mt-5 bg-surface border border-border-strong rounded-2xl shadow-modal px-5 py-6 flex flex-col items-center">
        {children}
      </div>
    )
  }
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

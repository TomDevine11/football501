// Completion popup shown when a game ends — holds the result, stats, share,
// play-again and "try another game" so the post-game actions are front-and-centre
// instead of hidden below the board. Closable (X or backdrop) to review the board.
export default function ResultModal({ open, onClose, children }) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-start sm:items-center justify-center overflow-y-auto p-4 result-modal-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md bg-gray-950 border border-gray-800 rounded-2xl shadow-2xl px-5 py-6 my-6 flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-200 hover:bg-gray-800 transition-colors text-lg leading-none"
        >
          ✕
        </button>
        {children}
      </div>
    </div>
  )
}

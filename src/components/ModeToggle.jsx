// Daily ⇄ Unlimited switch shown at the top of every game.
//   • Daily     — one deterministic puzzle per day; records stats & streaks.
//   • Unlimited — random, replayable practice; never touches stats.
import { useI18n } from '../i18n'

export default function ModeToggle({ mode, onChange, className = '' }) {
  const { t } = useI18n()
  const MODES = [['daily', t('common.daily')], ['unlimited', t('common.unlimited')]]
  return (
    <div className={`inline-flex rounded-lg border border-gray-800 bg-gray-900 p-0.5 ${className}`}>
      {MODES.map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => mode !== id && onChange(id)}
          className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
            mode === id ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

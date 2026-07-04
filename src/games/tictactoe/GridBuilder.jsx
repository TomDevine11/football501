import { useState } from 'react'
import { CATEGORIES, categoryLabel, buildGrid } from '../../data/tictactoe'
import { useI18n } from '../../i18n'

const TYPES = [
  ['club', 'typeClubs'],
  ['league', 'typeLeagues'],
  ['nationality', 'typeNationalities'],
  ['trophy', 'typeTrophies'],
]
const sameCat = (a, b) => a.type === b.type && a.value === b.value

// Build-your-own grid setup for 1v1. Pick 3 row + 3 column categories; a live
// preview shows each square's number of valid players so empty pairings can be
// avoided before starting.
export default function GridBuilder({ onBuild, onCancel }) {
  const { t } = useI18n()
  const [rows, setRows] = useState([])
  const [cols, setCols] = useState([])

  const chosen = [...rows, ...cols]
  const used = (c) => chosen.some(x => sameCat(x, c))

  const add = (c) => {
    if (used(c)) return
    if (rows.length < 3) setRows(r => [...r, c])
    else if (cols.length < 3) setCols(cc => [...cc, c])
  }
  const removeRow = (i) => setRows(r => r.filter((_, j) => j !== i))
  const removeCol = (i) => setCols(c => c.filter((_, j) => j !== i))

  const ready = rows.length === 3 && cols.length === 3
  const preview = ready ? buildGrid(rows, cols) : null
  const counts = preview ? preview.candidates.map(c => c.length) : []
  const emptyCount = counts.filter(n => n === 0).length
  const allValid = ready && emptyCount === 0

  const Slot = ({ cat, onRemove, placeholder }) => (
    <button
      type="button"
      onClick={cat ? onRemove : undefined}
      className={`rounded-lg px-2 py-2 text-[11px] sm:text-xs font-medium leading-tight min-h-[44px] flex items-center justify-center text-center transition-colors ${
        cat ? 'border border-green-700 bg-green-900/30 text-green-200 hover:bg-red-900/30 hover:border-red-700' : 'border border-dashed border-gray-700 text-gray-600'
      }`}
    >
      {cat ? categoryLabel(cat, t) : placeholder}
    </button>
  )

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg flex items-center justify-between mb-5">
        <button onClick={onCancel} className="text-gray-600 hover:text-gray-400 text-sm transition-colors">{t('tictactoe.back')}</button>
        <div className="score-number text-xl text-gray-500 tracking-wider">BUILD GRID</div>
        <div className="w-12" />
      </div>

      <p className="w-full max-w-lg text-center text-gray-500 text-sm mb-5">
        {t('tictactoe.builderIntro')}
      </p>

      <div className="w-full max-w-lg space-y-3 mb-5">
        <div>
          <div className="text-yellow-400 text-xs font-bold uppercase tracking-wide mb-1.5">{t('tictactoe.rowsCount', { n: rows.length })}</div>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map(i => <Slot key={i} cat={rows[i]} onRemove={() => removeRow(i)} placeholder={t('tictactoe.empty')} />)}
          </div>
        </div>
        <div>
          <div className="text-blue-400 text-xs font-bold uppercase tracking-wide mb-1.5">{t('tictactoe.colsCount', { n: cols.length })}</div>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map(i => <Slot key={i} cat={cols[i]} onRemove={() => removeCol(i)} placeholder={t('tictactoe.empty')} />)}
          </div>
        </div>
      </div>

      {/* Live validity preview */}
      {ready && (
        <div className="w-full max-w-lg mb-5">
          <div className="text-xs text-gray-600 uppercase tracking-widest mb-2 font-medium px-1">{t('tictactoe.previewLabel')}</div>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'minmax(60px,1fr) repeat(3, 1fr)' }}>
            <div />
            {cols.map((c, i) => <div key={i} className="text-[9px] text-blue-400 text-center leading-tight px-0.5">{categoryLabel(c, t)}</div>)}
            {[0, 1, 2].map(r => (
              <Fragmentish key={r} row={r} rows={rows} counts={counts} t={t} />
            ))}
          </div>
          {!allValid && (
            <p className="text-red-400 text-xs text-center mt-2">
              {emptyCount === 1 ? t('tictactoe.emptyWarnOne', { n: emptyCount }) : t('tictactoe.emptyWarn', { n: emptyCount })}
            </p>
          )}
        </div>
      )}

      {/* Category palette */}
      <div className="w-full max-w-lg space-y-4 mb-6">
        {TYPES.map(([type, labelKey]) => (
          <div key={type}>
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1.5">{t(`tictactoe.${labelKey}`)}</div>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.filter(c => c.type === type).map(c => {
                const isUsed = used(c)
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => add(c)}
                    disabled={isUsed || chosen.length >= 6}
                    className={`text-xs rounded-lg px-2.5 py-1.5 border transition-colors ${
                      isUsed ? 'border-gray-800 bg-gray-900 text-gray-700' : 'border-gray-700 bg-gray-900 text-gray-300 hover:border-gray-500'
                    } disabled:cursor-not-allowed`}
                  >
                    {c.value}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onBuild(rows, cols)}
        disabled={!allValid}
        className="w-full max-w-lg bg-green-700 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3.5 transition-colors"
      >
        {ready
          ? (allValid ? t('tictactoe.startGame') : t('tictactoe.fixEmpty'))
          : (6 - chosen.length === 1 ? t('tictactoe.pickMoreOne', { n: 6 - chosen.length }) : t('tictactoe.pickMore', { n: 6 - chosen.length }))}
      </button>
    </div>
  )
}

// A preview row: row-header + 3 count cells.
function Fragmentish({ row, rows, counts, t }) {
  return (
    <>
      <div className="text-[9px] text-yellow-400 flex items-center leading-tight px-0.5">{categoryLabel(rows[row], t)}</div>
      {[0, 1, 2].map(c => {
        const n = counts[row * 3 + c]
        return (
          <div key={c} className={`aspect-square rounded flex items-center justify-center text-xs font-bold ${
            n === 0 ? 'bg-red-900/30 border border-red-800 text-red-400' : 'bg-gray-900 border border-gray-800 text-gray-400'
          }`}>
            {n === 0 ? '✗' : n}
          </div>
        )
      })}
    </>
  )
}

import { Fragment, useState } from 'react'
import { CATEGORIES, categoryLabel, buildGrid } from '../../data/tictactoe'
import CategoryIcon from '../../components/CategoryIcon'
import GameChrome from '../../components/GameChrome'
import { accentVars } from '../../design/accents'
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
      className={`rounded-lg px-2 py-2 text-[11px] sm:text-xs font-medium leading-tight min-h-[44px] flex items-center justify-center gap-1 text-center transition-colors ${
        cat ? 'border border-accent/60 bg-[color-mix(in_srgb,var(--accent)_12%,#16151f)] text-primary hover:border-danger/70 hover:bg-danger/10' : 'border border-dashed border-border-strong text-faint'
      }`}
    >
      {cat && <CategoryIcon category={cat} size={14} />}
      {cat ? categoryLabel(cat, t) : placeholder}
    </button>
  )

  return (
    <div className="tv-scene min-h-dvh text-primary" style={accentVars('tictactoe')}>
    <div className="flex flex-col items-center px-4 pb-8 max-w-4xl mx-auto">
      <div className="w-full"><GameChrome motifId="tictactoe" title={t('tictactoe.buildGrid')} right="1V1" /></div>

      <div className="relative w-full max-w-lg flex justify-center mt-1 mb-4 min-h-[1rem]">
        <button onClick={onCancel} className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-muted hover:text-secondary transition-colors">{t('tictactoe.back')}</button>
      </div>

      <p className="w-full max-w-lg text-center text-muted text-sm mb-5">
        {t('tictactoe.builderIntro')}
      </p>

      <div className="w-full max-w-lg space-y-3 mb-5">
        <div>
          <div className="text-secondary text-[0.6rem] font-black uppercase tracking-[0.14em] mb-1.5">{t('tictactoe.rowsCount', { n: rows.length })}</div>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map(i => <Slot key={i} cat={rows[i]} onRemove={() => removeRow(i)} placeholder={t('tictactoe.empty')} />)}
          </div>
        </div>
        <div>
          <div className="text-secondary text-[0.6rem] font-black uppercase tracking-[0.14em] mb-1.5">{t('tictactoe.colsCount', { n: cols.length })}</div>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map(i => <Slot key={i} cat={cols[i]} onRemove={() => removeCol(i)} placeholder={t('tictactoe.empty')} />)}
          </div>
        </div>
      </div>

      {/* Live validity preview */}
      {ready && (
        <div className="w-full max-w-lg mb-5">
          <div className="text-[0.56rem] text-faint uppercase tracking-[0.16em] mb-2 font-black px-1">{t('tictactoe.previewLabel')}</div>
          <div className="grid gap-1.5" style={{ gridTemplateColumns: 'minmax(60px,1fr) repeat(3, 1fr)' }}>
            <div />
            {cols.map((c, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5 text-[9px] text-secondary text-center leading-tight px-0.5">
                <CategoryIcon category={c} size={14} />
                <span>{categoryLabel(c, t)}</span>
              </div>
            ))}
            {[0, 1, 2].map(r => (
              <PreviewRow key={r} row={r} rows={rows} counts={counts} t={t} />
            ))}
          </div>
          {!allValid && (
            <p className="text-danger-bright text-xs text-center mt-2">
              {emptyCount === 1 ? t('tictactoe.emptyWarnOne', { n: emptyCount }) : t('tictactoe.emptyWarn', { n: emptyCount })}
            </p>
          )}
        </div>
      )}

      {/* Category palette */}
      <div className="w-full max-w-lg space-y-4 mb-6">
        {TYPES.map(([type, labelKey]) => (
          <div key={type}>
            <div className="text-muted text-[0.6rem] font-black uppercase tracking-[0.14em] mb-1.5">{t(`tictactoe.${labelKey}`)}</div>
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
                      isUsed ? 'border-border bg-surface text-faint' : 'border-border-strong bg-surface text-secondary hover:border-accent'
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
        className="w-full max-w-lg bg-brand hover:bg-brand-hover disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl py-3.5 transition-colors"
      >
        {ready
          ? (allValid ? t('tictactoe.startGame') : t('tictactoe.fixEmpty'))
          : (6 - chosen.length === 1 ? t('tictactoe.pickMoreOne', { n: 6 - chosen.length }) : t('tictactoe.pickMore', { n: 6 - chosen.length }))}
      </button>
    </div>
    </div>
  )
}

// A preview row: row-header + 3 count cells.
function PreviewRow({ row, rows, counts, t }) {
  return (
    <Fragment>
      <div className="flex items-center gap-1 text-[9px] text-secondary leading-tight px-0.5">
        <CategoryIcon category={rows[row]} size={14} />
        <span>{categoryLabel(rows[row], t)}</span>
      </div>
      {[0, 1, 2].map(c => {
        const n = counts[row * 3 + c]
        return (
          <div key={c} className={`aspect-square rounded flex items-center justify-center text-xs font-bold ${
            n === 0 ? 'bg-danger/10 border border-danger/50 text-danger-bright' : 'bg-board border border-border-strong text-secondary'
          }`}>
            {n === 0 ? '✗' : n}
          </div>
        )
      })}
    </Fragment>
  )
}

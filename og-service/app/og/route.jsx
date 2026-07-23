import { ImageResponse } from 'next/og'
import { decodeCard, loadFont, C, TILE, ACCENT } from '../../lib/card'

export const runtime = 'edge'

function Card({ card, accent }) {
  const gap = 8
  const rows = card.rows || []
  const nRows = rows.length
  const cols = rows.reduce((m, r) => Math.max(m, r.length), 1)
  const tileW = (1088 - (cols - 1) * gap) / cols
  const tileH = nRows ? (236 - (nRows - 1) * gap) / nRows : 0
  const tile = nRows ? Math.floor(Math.max(20, Math.min(56, tileW, tileH))) : 0

  return (
    <div style={{
      width: 1200, height: 630, display: 'flex', flexDirection: 'column', padding: 56,
      backgroundColor: C.canvas, color: C.primary, fontFamily: 'Inter',
      backgroundImage: `radial-gradient(circle at 85% 8%, ${accent}30 0%, transparent 45%), linear-gradient(155deg, ${C.canvasHigh}, ${C.canvas} 55%)`,
    }}>
      {/* header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <svg width="24" height="28" viewBox="0 0 24 28" style={{ marginRight: 14 }}>
            <polygon points="12.48,0 3.84,15.68 10.56,15.68 7.68,28 20.64,11.2 13.44,11.2 15.84,0" fill={accent} />
          </svg>
          <div style={{ display: 'flex', fontSize: 26, fontWeight: 800, letterSpacing: 3 }}>
            <div style={{ color: C.primary }}>TRIVIVERSE</div>
            <div style={{ color: accent, marginLeft: 9 }}>FOOTBALL</div>
          </div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: 3, color: C.faint }}>{`MATCHDAY ${card.matchday ?? ''}`}</div>
      </div>

      {/* accent rule */}
      <div style={{ height: 3, marginTop: 22, borderRadius: 2, backgroundImage: `linear-gradient(90deg, ${accent}, transparent 78%)` }} />

      {/* title */}
      <div style={{ fontFamily: 'Bebas Neue', fontSize: 96, lineHeight: 1, marginTop: 26, letterSpacing: 1 }}>{(card.title || '').toUpperCase()}</div>
      {card.challenge ? <div style={{ fontSize: 26, color: C.muted, marginTop: 10 }}>{card.challenge}</div> : null}

      {/* result + tiles (fills the middle) */}
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
        <div style={{ fontSize: 42, fontWeight: 800, color: C.secondary }}>{card.result}</div>
        {nRows ? (
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: 22 }}>
            {rows.map((row, ri) => (
              <div key={ri} style={{ display: 'flex', marginTop: ri ? gap : 0 }}>
                {row.map((ch, ci) => (
                  <div key={ci} style={{ width: tile, height: tile, marginLeft: ci ? gap : 0, borderRadius: Math.round(tile * 0.24), backgroundColor: TILE[ch] || TILE.m }} />
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </div>

      {/* footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: 56, paddingLeft: 22, paddingRight: 28, borderRadius: 30, backgroundColor: C.surface, border: `1px solid ${C.borderStrong}` }}>
          <div style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: accent, marginRight: 14 }} />
          <div style={{ fontSize: 28, fontWeight: 800 }}>triviverse.com</div>
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, letterSpacing: 2, color: C.faint }}>{"PLAY TODAY'S DAILY"}</div>
      </div>
    </div>
  )
}

export async function GET(request) {
  const card = decodeCard(new URL(request.url).searchParams.get('r'))
  if (!card) return new Response('bad request', { status: 400 })
  const accent = ACCENT[card.gameId] || C.brandBright

  const glyphs = `${card.title} ${card.result} ${card.challenge} TRIVIVERSE FOOTBALL MATCHDAY PLAY TODAY'S DAILY triviverse.com 0123456789`
  try {
    const [inter500, inter800, bebas] = await Promise.all([
      loadFont('Inter:wght@500', glyphs),
      loadFont('Inter:wght@800', glyphs),
      loadFont('Bebas+Neue', `${(card.title || '').toUpperCase()} 0123456789`),
    ])
    return new ImageResponse(<Card card={card} accent={accent} />, {
      width: 1200, height: 630,
      fonts: [
        { name: 'Inter', data: inter500, weight: 500, style: 'normal' },
        { name: 'Inter', data: inter800, weight: 800, style: 'normal' },
        { name: 'Bebas Neue', data: bebas, weight: 400, style: 'normal' },
      ],
      headers: { 'cache-control': 'public, immutable, max-age=31536000' },
    })
  } catch (e) {
    return new Response(`render error: ${e.message}`, { status: 500 })
  }
}

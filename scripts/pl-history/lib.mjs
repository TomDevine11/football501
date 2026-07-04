// PL-history scraper — shared fetch + parse helpers.
import { execFileSync } from 'node:child_process'
import * as cheerio from 'cheerio'
import { UA, RETRIES, BASE, COMPETITION } from './config.mjs'

// Fetch a URL via curl (works from a normal machine; node fetch/undici gets
// blocked by Transfermarkt more readily). Returns HTML string, with retries.
export function fetchHtml(url) {
  let lastErr
  for (let attempt = 1; attempt <= RETRIES; attempt++) {
    try {
      return execFileSync('curl', ['-s', '-L', '-m', '30', '-A', UA, url], { maxBuffer: 32 * 1024 * 1024, encoding: 'utf8' })
    } catch (e) { lastErr = e }
  }
  throw new Error(`fetch failed after ${RETRIES} tries: ${url}\n${lastErr?.message || ''}`)
}

// Enumerate the clubs in a competition-season → [{ id, slug }].
export function parseCompetitionClubs(html) {
  const $ = cheerio.load(html)
  const clubs = new Map()
  $('#yw1 table.items td.hauptlink a, #yw1 table.items td.zentriert a').each((i, a) => {
    const href = $(a).attr('href') || ''
    const m = href.match(/\/([^/]+)\/(?:startseite|spielplan|kader)\/verein\/(\d+)/)
    if (m) clubs.set(m[2], { id: m[2], slug: m[1] })
  })
  return [...clubs.values()]
}

// Competition-scoped club-season performance page URL.
export function clubSeasonUrl({ slug, id }, season) {
  return `${BASE}/${slug}/leistungsdaten/verein/${id}/reldata/${COMPETITION.id}%26${season}/plus/1`
}
export function competitionUrl(season) {
  return `${BASE}/${COMPETITION.slug}/startseite/wettbewerb/${COMPETITION.id}/saison_id/${season}`
}

const toInt = (t) => { const n = parseInt(String(t).replace(/[.,]/g, '').replace(/[^0-9]/g, ''), 10); return Number.isFinite(n) ? n : 0 }

// Parse a club-season performance page → per-player { id, name, nat, apps, goals }.
// Column map (validated): [0]# [1]player [2]age [3]nat [4]in-squad [5]apps [6]goals …
export function parseClubSeason(html) {
  const $ = cheerio.load(html)
  const out = []
  $('#yw1 table tbody').children('tr').each((i, tr) => {
    const $tr = $(tr)
    const tds = $tr.children('td')
    if (tds.length < 8) return // skip responsive/phantom rows
    const a = $tr.find('.hauptlink a').first()
    const href = a.attr('href') || ''
    const idm = href.match(/\/spieler\/(\d+)/)
    if (!idm) return
    const name = a.text().trim()
    const nat = $(tds[3]).find('img.flaggenrahmen').first().attr('title') || ''
    const apps = toInt($(tds[5]).text())
    const goals = toInt($(tds[6]).text())
    out.push({ id: idm[1], name, nat, apps, goals })
  })
  return out
}

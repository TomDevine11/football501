import { useState, useEffect, useMemo } from 'react'
import { players as localPlayers } from '../../data/players'
import { getFlagFromNationality } from '../../utils/flags'
import { normalizeName } from '../../data/tictactoe'
import { refineSuggestions, searchRegistry } from '../../data/canonical/resolve.js'

const TSDB = 'https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p='
const EXCLUDE_SPORTS = new Set(['basketball', 'american football', 'baseball', 'ice hockey', 'tennis', 'golf', 'cricket', 'rugby', 'swimming', 'athletics', 'motorsport', 'cycling', 'boxing', 'mma'])

// Searches the full player universe (TheSportsDB + local list), NOT the cell's
// valid answers — so the dropdown never gives the puzzle away. Returns up to 8
// ranked {name, flag} suggestions, excluding already-used players.
export function usePlayerSuggestions(input, active, usedNames) {
  const [apiPlayers, setApiPlayers] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (!active || normalizeName(input).length < 2) {
      setApiPlayers([]); setIsSearching(false); return
    }
    setIsSearching(true)
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(TSDB + encodeURIComponent(input), { signal: controller.signal })
        const data = await res.json()
        setApiPlayers((data.player || [])
          .filter(p => !EXCLUDE_SPORTS.has((p.strSport || '').toLowerCase()))
          .map(p => ({ name: p.strPlayer, flag: getFlagFromNationality(p.strNationality) })))
      } catch (err) {
        if (err.name !== 'AbortError') setApiPlayers([])
      } finally {
        setIsSearching(false)
      }
    }, 280)
    return () => { clearTimeout(timer); controller.abort() }
  }, [input, active])

  const suggestions = useMemo(() => {
    if (!active) return []
    const norm = normalizeName(input)
    if (norm.length < 2) return []

    const localMatches = localPlayers
      .filter(p => normalizeName(p.name).includes(norm))
      .map(p => ({ name: p.name, flag: p.flag }))

    // Sources: the external API, the local list, AND the whole registry (so any
    // valid player is findable by name or surname). Canonicalised + deduped.
    const merged = refineSuggestions([...apiPlayers, ...localMatches, ...searchRegistry(input)], usedNames)

    const rank = (name) => {
      const n = normalizeName(name)
      if (n === norm) return 0                                    // exact name / mononym
      if (n.startsWith(norm)) return 1
      if (n.split(' ').some(w => w.startsWith(norm))) return 2    // any word (incl. surname) prefix
      return 3
    }
    merged.sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name))
    return merged.slice(0, 10)
  }, [input, active, apiPlayers, usedNames])

  return { suggestions, isSearching }
}

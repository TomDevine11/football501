// Some Wikidata entities have no English rdfs:label (only non-Latin labels), so
// the `wikibase:label` service returns the bare QID (e.g. "Q119562"). This
// resolves any such bare-QID names to a real name via the enwiki sitelink title
// (falling back to any available label), so QIDs never leak into the data.
//
// Usage: const fixed = await resolveQidNames(['Q119562', ...]) → { Q119562: 'Sergio Agüero' }

const isQid = s => /^Q\d+$/.test(s)
export { isQid }

export async function resolveQidNames(qids) {
  const unique = [...new Set(qids.filter(isQid))]
  const out = {}
  for (let i = 0; i < unique.length; i += 50) { // wbgetentities caps at 50 ids
    const batch = unique.slice(i, i + 50)
    const url = new URL('https://www.wikidata.org/w/api.php')
    url.searchParams.set('action', 'wbgetentities')
    url.searchParams.set('ids', batch.join('|'))
    url.searchParams.set('props', 'labels|sitelinks')
    url.searchParams.set('sitefilter', 'enwiki')
    url.searchParams.set('format', 'json')
    const res = await fetch(url, { headers: { 'User-Agent': 'Football501Game/1.0 (educational)' } })
    if (!res.ok) continue
    const ents = (await res.json()).entities || {}
    for (const [qid, ent] of Object.entries(ents)) {
      const enLabel = ent.labels?.en?.value
      const enwiki = ent.sitelinks?.enwiki?.title?.replace(/\s*\([^)]*\)$/, '') // strip "(footballer)" etc.
      const anyLabel = ent.labels && Object.values(ent.labels)[0]?.value
      const name = enLabel || enwiki || anyLabel
      if (name) out[qid] = name
    }
    await new Promise(r => setTimeout(r, 300))
  }
  return out
}

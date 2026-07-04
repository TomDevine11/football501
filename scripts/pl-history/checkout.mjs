// ─────────────────────────────────────────────────────────────────────────
// CHECKOUT ENGINE (build-time validity)
//
// A 501 question is valid only if you can actually check out — land the running
// total in [−10, 0], i.e. a subset of distinct answer values summing to
// 501–511. Only throwable values (1–179) can be part of a finish; a ≥180 answer
// busts and can never complete a leg.
//
//   checkoutCombos  — # of distinct checkout subsets (capped) → "comfort"
//   maxDisjoint     — how many players can each find their own checkout from the
//                     shared pool → multiplayer capacity
// ─────────────────────────────────────────────────────────────────────────

const LO = 501, HI = 511
const throwable = (values) => values.filter(v => v >= 1 && v <= 179)

// Count distinct subsets of the values that sum into [501, 511] (0/1 knapsack
// counting DP, capped so broad questions don't overflow). A higher count means
// more ways to finish → more forgiving / findable.
export function checkoutCombos(values, cap = 1e9) {
  const dp = new Float64Array(HI + 1)
  dp[0] = 1
  for (const v of throwable(values)) {
    for (let s = HI; s >= v; s--) {
      if (dp[s - v]) dp[s] = Math.min(cap, dp[s] + dp[s - v])
    }
  }
  let c = 0
  for (let s = LO; s <= HI; s++) c += dp[s]
  return Math.min(cap, c)
}

// Greedily find ONE checkout subset (indices into `vals`), packing larger values
// first. Fast; for the rich rosters we keep it reliably finds a finish.
function greedyOne(vals) {
  const order = vals.map((v, i) => i).sort((a, b) => vals[b] - vals[a])
  let sum = 0
  const used = []
  for (const i of order) {
    if (sum >= LO) break
    if (sum + vals[i] <= HI) { sum += vals[i]; used.push(i) }
  }
  return sum >= LO && sum <= HI ? used : null
}

// How many players can each check out from the shared pool (answers used once
// across everyone). Peels off disjoint checkouts up to maxN.
export function maxDisjoint(values, maxN = 5) {
  let pool = throwable(values)
  let n = 0
  while (n < maxN) {
    const used = greedyOne(pool)
    if (!used) break
    const rm = new Set(used)
    pool = pool.filter((_, i) => !rm.has(i))
    n++
  }
  return n
}

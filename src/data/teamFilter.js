// Filters out non-senior / non-professional teams so Teammates and Career Path
// only surface a player's real senior clubs and senior national caps. Wikidata
// lists everything a player was ever registered with, which drags in youth
// national sides ("England national under-17…"), Olympic selections, national
// "B" teams and club reserve/'B'/'II' sides — clutter that gives poor clues.
//
// Senior national teams ("England national football team") are intentionally
// KEPT — they're good, fair clues.

const NON_SENIOR = [
  /\bunder-?\d/i,                              // "…national under-17…", "U-20"
  /\bu-?\d{2}\b/i,                             // "U21", "U-23"
  /\bolympic\b[^]*\b(football|soccer) team\b/i, // "Portugal Olympic football team" (not "Sydney Olympic")
  /national\b[^]*\bb\b[^]*\bteam\b/i,          // "England national association football B team"
  /national\b[^]*(youth|amateur)/i,           // national youth/amateur sides
  /\breserves?\b/i,                           // "… Reserves and Academy"
  /\bamateure?\b/i,                           // German "… Amateure"
  /^jong /i,                                  // Dutch reserve sides ("Jong PSV", "Jong AZ")
  / ii+$/i,                                   // club reserve teams ("FC Bayern Munich II")
  / b$/i,                                     // club B teams ("Athletic Bilbao B", "FC Porto B")
]

// Legit senior clubs that would otherwise trip a reserve-team pattern.
const KEEP = [/^willem\s+ii$/i]

export function isSeniorTeam(name) {
  if (!name) return false
  const n = name.trim()
  if (KEEP.some(re => re.test(n))) return true
  return !NON_SENIOR.some(re => re.test(n))
}

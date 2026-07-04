import { createContext, useContext } from 'react'
import { strings } from './strings'

// Supported locales. English is the default (served at the root); Spanish is
// served under an /es prefix. hreflang + prerendered pages tie the two together
// for SEO (a Spanish searcher gets the /es page, an English one the root page).
export const LOCALES = ['en', 'es']
export const DEFAULT_LOCALE = 'en'

// Derive the active locale from a pathname (…/es or /es/... → 'es').
export function localeFromPath(pathname) {
  return /^\/es(\/|$)/.test(pathname) ? 'es' : 'en'
}

// The path WITHOUT any locale prefix (so '/es/wordle' → '/wordle', '/es' → '/').
export function stripLocale(pathname) {
  const p = pathname.replace(/^\/es(?=\/|$)/, '')
  return p === '' ? '/' : p
}

// Add the locale prefix to a locale-free path ('/wordle', 'es' → '/es/wordle').
export function withLocale(path, locale) {
  if (locale === DEFAULT_LOCALE) return path
  return path === '/' ? '/es' : `/es${path}`
}

// Look up a dot-path key for a locale, falling back to English then the key.
export function translate(key, locale, vars) {
  const pick = (loc) => key.split('.').reduce((o, k) => (o == null ? undefined : o[k]), strings[loc])
  let s = pick(locale)
  if (s == null) s = pick(DEFAULT_LOCALE)
  if (s == null) return key
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, v)
  return s
}

export const LangContext = createContext(DEFAULT_LOCALE)

// Hook: current locale + a bound translator + a locale-aware link helper.
export function useI18n() {
  const locale = useContext(LangContext)
  const t = (key, vars) => translate(key, locale, vars)
  const lp = (path) => withLocale(path, locale) // "locale path" for <Link to>
  return { locale, t, lp }
}

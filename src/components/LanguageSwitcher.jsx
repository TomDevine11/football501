import { Link, useLocation } from 'react-router-dom'
import { useI18n, stripLocale, withLocale, LOCALES } from '../i18n'

// EN / ES toggle that links to the same page in the other locale (root ↔ /es).
export default function LanguageSwitcher({ className = '' }) {
  const { locale } = useI18n()
  const { pathname } = useLocation()
  const base = stripLocale(pathname)
  return (
    <div className={`inline-flex rounded-lg border border-gray-800 bg-gray-900 p-0.5 text-xs ${className}`}>
      {LOCALES.map(l => (
        <Link
          key={l}
          to={withLocale(base, l)}
          hrefLang={l}
          className={`px-2.5 py-1 rounded-md font-bold uppercase transition-colors ${locale === l ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300'}`}
        >
          {l}
        </Link>
      ))}
    </div>
  )
}

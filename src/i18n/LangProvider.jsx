import { useLocation } from 'react-router-dom'
import { LangContext, localeFromPath } from './index'

// Provides the active locale (derived from the URL) to the tree via context.
export default function LangProvider({ children }) {
  const { pathname } = useLocation()
  return <LangContext.Provider value={localeFromPath(pathname)}>{children}</LangContext.Provider>
}

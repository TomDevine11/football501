import { useState } from 'react'
import { SITE_URL } from '../utils/site'
import { useI18n } from '../i18n'

export const ICON_BTN = 'w-10 h-10 flex items-center justify-center rounded-full bg-gray-800 hover:bg-gray-700 text-white transition-colors'

export function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2C6.477 2 2 6.477 2 12c0 1.93.55 3.733 1.502 5.262L2 22l4.873-1.452A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm5.472 12.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
    </svg>
  )
}

export function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.828l-5.35-6.566L4.7 22H1.44l8.034-9.18L1 2h6.998l4.835 6.012L18.244 2zm-1.197 18h1.832L7.06 4H5.13l11.917 16z"/>
    </svg>
  )
}

export function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.128 22 16.991 22 12z"/>
    </svg>
  )
}

export function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  )
}

export function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
    </svg>
  )
}

export function ShareCard({ text }) {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState('')
  const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function'

  const flashToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const handleNativeShare = () => {
    navigator.share({ text, url: SITE_URL }).catch(() => {})
  }

  const handleInstagram = () => {
    navigator.clipboard.writeText(text).then(() => {
      flashToast(t('share.instagram'))
      window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer')
    })
  }

  const encodedText = encodeURIComponent(text)
  const encodedUrl = encodeURIComponent(SITE_URL)

  return (
    <div className="w-full max-w-md flex flex-col items-center gap-3 mb-2">
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button onClick={handleCopy} className="px-5 py-2.5 bg-green-700 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors">
          {copied ? t('share.copied') : t('share.copy')}
        </button>
        {canNativeShare && (
          <button onClick={handleNativeShare} className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <ShareIcon /> {t('share.share')}
          </button>
        )}
      </div>
      <div className="flex items-center justify-center gap-2.5">
        <a href={`https://wa.me/?text=${encodedText}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className={ICON_BTN}>
          <WhatsAppIcon />
        </a>
        <a href={`https://twitter.com/intent/tweet?text=${encodedText}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X" className={ICON_BTN}>
          <XIcon />
        </a>
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className={ICON_BTN}>
          <FacebookIcon />
        </a>
        <button onClick={handleInstagram} aria-label="Share on Instagram" className={ICON_BTN}>
          <InstagramIcon />
        </button>
      </div>
      {toast && <div className="text-xs text-gray-400 text-center">{toast}</div>}
    </div>
  )
}

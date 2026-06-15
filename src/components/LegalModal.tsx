import { useTranslation } from 'react-i18next'

type LegalType = 'terms' | 'privacy' | 'cookies'

interface Props {
  type: LegalType
  onClose: () => void
}

export default function LegalModal({ type, onClose }: Props) {
  const { t } = useTranslation()

  const titles: Record<LegalType, string> = {
    terms: t('legal.terms'),
    privacy: t('legal.privacy'),
    cookies: t('legal.cookies'),
  }

  const bodies: Record<LegalType, string> = {
    terms: t('legal.terms_body'),
    privacy: t('legal.privacy_body'),
    cookies: t('legal.cookies_body'),
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative max-w-lg w-full rounded-2xl p-6 text-white"
        style={{
          background: 'rgba(18,18,18,0.95)',
          border: '1px solid rgba(131,58,180,0.3)',
          boxShadow: '0 0 40px rgba(131,58,180,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">{titles[type]}</h2>
        <p className="text-sm text-white/70 leading-relaxed">{bodies[type]}</p>
        <button
          onClick={onClose}
          className="mt-6 px-5 py-2 rounded-xl text-sm font-medium text-white/60 hover:text-white transition-colors border border-white/10 hover:border-white/30"
        >
          Close
        </button>
      </div>
    </div>
  )
}

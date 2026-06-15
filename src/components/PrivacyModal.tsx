import { useTranslation } from 'react-i18next'

interface Props {
  onClose: () => void
}

export default function PrivacyModal({ onClose }: Props) {
  const { t } = useTranslation()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative max-w-md w-full rounded-2xl p-6 text-white"
        style={{
          background: 'rgba(18,18,18,0.95)',
          border: '1px solid rgba(131,58,180,0.3)',
          boxShadow: '0 0 40px rgba(131,58,180,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🔒</span>
          <h2 className="text-lg font-semibold">{t('privacy.title')}</h2>
        </div>
        <p className="text-sm text-white/70 leading-relaxed">{t('privacy.body')}</p>
        <button
          onClick={onClose}
          className="mt-6 w-full py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)',
          }}
        >
          {t('privacy.close')}
        </button>
      </div>
    </div>
  )
}

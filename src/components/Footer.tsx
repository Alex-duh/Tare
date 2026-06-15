import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import LegalModal from './LegalModal'

type LegalType = 'terms' | 'privacy' | 'cookies'

export default function Footer() {
  const { t } = useTranslation()
  const [modal, setModal] = useState<LegalType | null>(null)

  return (
    <>
      <footer className="relative z-10 mt-auto py-8 px-4">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-6 text-xs text-white/30">
            <button
              onClick={() => setModal('terms')}
              className="hover:text-white/60 transition-colors"
            >
              {t('legal.terms')}
            </button>
            <span>·</span>
            <button
              onClick={() => setModal('privacy')}
              className="hover:text-white/60 transition-colors"
            >
              {t('legal.privacy')}
            </button>
            <span>·</span>
            <button
              onClick={() => setModal('cookies')}
              className="hover:text-white/60 transition-colors"
            >
              {t('legal.cookies')}
            </button>
          </div>
          <p className="text-xs text-white/20">
            Not affiliated with Instagram or Meta.
          </p>
        </div>
      </footer>

      {modal && <LegalModal type={modal} onClose={() => setModal(null)} />}
    </>
  )
}

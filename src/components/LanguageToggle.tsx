import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: '🇺🇸 EN' },
  { code: 'es', label: '🇪🇸 ES' },
]

export default function LanguageToggle() {
  const { i18n } = useTranslation()
  const activeLang = i18n.language.split('-')[0]

  return (
    <div
      className="flex rounded-xl p-0.5"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {LANGUAGES.map((lang) => {
        const active = lang.code === activeLang
        return (
          <button
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className="px-3 py-1 rounded-lg text-sm font-medium transition-all select-none"
            style={{
              background: active ? 'rgba(131,58,180,0.35)' : 'transparent',
              color: active ? 'white' : 'rgba(255,255,255,0.4)',
              border: active ? '1px solid rgba(131,58,180,0.45)' : '1px solid transparent',
              cursor: 'pointer',
            }}
          >
            {lang.label}
          </button>
        )
      })}
    </div>
  )
}

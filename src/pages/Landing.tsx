import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import UploadZone from '../components/UploadZone'
import GradientText from '../components/GradientText'
import Footer from '../components/Footer'
import PrivacyModal from '../components/PrivacyModal'
import LanguageToggle from '../components/LanguageToggle'
import { parseZip, parseHTMLFiles, parseJSONFiles } from '../lib/parseInstagram'
import { saveSnapshot, getLatestSnapshot } from '../lib/db'
import { trackAnalysis } from '../lib/analytics'
import type { ParsedData } from '../types'

// Placeholder screenshot component — scales gracefully to any image size
function StepScreenshot({ src, alt }: { src: string; alt: string }) {
  return (
    <div
      className="rounded-xl overflow-hidden flex-shrink-0"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-auto object-contain max-h-64"
        onError={(e) => {
          // If screenshot not yet added, show a placeholder
          const target = e.currentTarget
          target.style.display = 'none'
          const parent = target.parentElement!
          parent.innerHTML = `<div style="height:160px;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.2);font-size:13px;">Screenshot coming soon</div>`
        }}
      />
    </div>
  )
}

const STEPS = [
  { key: '1', img: '/screenshots/step-1-account-center.png' },
  { key: '2', img: '/screenshots/step-2-download-info.png' },
  { key: '3', img: '/screenshots/step-3-select-type.png' },
  { key: '4', img: '/screenshots/step-4-select-data.png' },
  { key: '5', img: '/screenshots/step-5-format-json.png' },
]

export default function Landing() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPrivacy, setShowPrivacy] = useState(false)

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null)
      setLoading(true)
      try {
        const fileArr = Array.from(files)
        let parsed: ParsedData

        const zipFile = fileArr.find((f) => f.name.endsWith('.zip'))
        if (zipFile) {
          parsed = await parseZip(zipFile)
        } else {
          const jsonFollowerFiles = fileArr.filter((f) =>
            /followers.*\.json$/i.test(f.name)
          )
          const jsonFollowingFile = fileArr.find((f) => /following\.json$/i.test(f.name))

          if (jsonFollowerFiles.length > 0 && jsonFollowingFile) {
            parsed = await parseJSONFiles(jsonFollowerFiles, jsonFollowingFile)
          } else {
            const htmlFollowerFiles = fileArr.filter((f) =>
              /followers.*\.html$/i.test(f.name)
            )
            const htmlFollowingFile = fileArr.find((f) => /following\.html$/i.test(f.name))
            if (htmlFollowerFiles.length > 0 && htmlFollowingFile) {
              parsed = await parseHTMLFiles(htmlFollowerFiles, htmlFollowingFile)
            } else {
              throw new Error('no_valid_files')
            }
          }
        }

        // Save snapshot to IndexedDB
        const latest = await getLatestSnapshot()
        const followerUsernames = parsed.followers.map((u) => u.username)
        const followingUsernames = parsed.following.map((u) => u.username)
        await saveSnapshot({
          date: new Date().toISOString(),
          followerCount: parsed.followers.length,
          followingCount: parsed.following.length,
          followerUsernames,
          followingUsernames,
        })

        await trackAnalysis()

        navigate('/results', {
          state: {
            parsed,
            isFirstUpload: !latest,
          },
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'generic'
        const key = ['no_valid_files', 'invalid_json'].includes(msg) ? msg : 'generic'
        setError(t(`errors.${key}`))
      } finally {
        setLoading(false)
      }
    },
    [navigate, t]
  )

  return (
    <div className="min-h-screen flex flex-col text-white">
      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <GradientText className="text-xl font-bold tracking-tight">Tare</GradientText>
        </div>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <button
            onClick={() => setShowPrivacy(true)}
            className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span className="hidden sm:inline">{t('nav.about')}</span>
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 pt-12 pb-20">
        <div className="w-full max-w-xl text-center mb-10 animate-fade-up">
          <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-4 leading-tight">
            <GradientText>{t('landing.headline')}</GradientText>
          </h1>
          <p className="text-white/50 text-lg leading-relaxed max-w-md mx-auto">
            {t('landing.sub')}
          </p>
          <div
            className="inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full text-xs text-white/40"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse-slow" />
            {t('nav.privacy')}
          </div>
        </div>

        {/* Upload zone */}
        <div className="w-full max-w-xl">
          <UploadZone onFiles={handleFiles} loading={loading} error={error} />
        </div>

        {/* Scroll hint */}
        <div className="mt-16 flex flex-col items-center gap-2 text-white/20 text-sm">
          <span>{t('landing.how_title')} ↓</span>
        </div>
      </main>

      {/* Tutorial section */}
      <section className="relative z-10 px-4 pb-20 max-w-2xl mx-auto w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-white mb-2">{t('landing.how_title')}</h2>
          <p className="text-white/40 text-sm">{t('landing.how_sub')}</p>
        </div>

        <div className="flex flex-col gap-6">
          {STEPS.map((step, i) => (
            <div
              key={step.key}
              className="rounded-2xl overflow-hidden"
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <div className="flex items-start gap-4 p-5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #833ab4, #fd1d1d)',
                  }}
                >
                  {i + 1}
                </div>
                <p className="text-white/70 text-sm leading-relaxed">
                  {t(`landing.steps.${step.key}`)}
                  {i === 4 && (
                    <span className="ml-1 px-1.5 py-0.5 rounded text-xs font-semibold"
                      style={{ background: 'rgba(252,176,69,0.2)', color: '#fcb045' }}>
                      JSON — not HTML
                    </span>
                  )}
                </p>
              </div>
              <StepScreenshot src={step.img} alt={`Step ${i + 1}`} />
            </div>
          ))}
        </div>

        <p className="text-center text-white/30 text-xs mt-8">{t('landing.steps_note')}</p>
      </section>

      <Footer />

      {showPrivacy && <PrivacyModal onClose={() => setShowPrivacy(false)} />}
    </div>
  )
}

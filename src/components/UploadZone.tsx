import { useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  onFiles: (files: FileList | File[]) => void
  loading: boolean
  error: string | null
}

export default function UploadZone({ onFiles, loading, error }: Props) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [pending, setPending] = useState<File[] | null>(null)

  const stage = (files: FileList | File[]) => {
    const arr = Array.from(files)
    if (arr.length > 0) setPending(arr)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    stage(e.dataTransfer.files)
  }, [])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleAnalyze = () => {
    if (pending) onFiles(pending)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPending(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const fileLabel = pending
    ? pending.length === 1
      ? pending[0].name
      : `${pending.length} files selected`
    : null

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragging(false)}
        onClick={() => !loading && !pending && inputRef.current?.click()}
        className="relative select-none transition-all duration-300 rounded-2xl p-8 text-center group"
        style={{
          background: dragging
            ? 'rgba(131,58,180,0.15)'
            : pending
            ? 'rgba(131,58,180,0.08)'
            : 'rgba(255,255,255,0.03)',
          border: `2px dashed ${
            dragging
              ? 'rgba(131,58,180,0.9)'
              : pending
              ? 'rgba(131,58,180,0.5)'
              : 'rgba(255,255,255,0.12)'
          }`,
          boxShadow: dragging ? '0 0 40px rgba(131,58,180,0.25)' : 'none',
          cursor: pending || loading ? 'default' : 'pointer',
        }}
      >
        {/* Hover glow */}
        {!pending && !loading && (
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{ background: 'linear-gradient(135deg, rgba(131,58,180,0.08), rgba(253,29,29,0.08), rgba(252,176,69,0.08))' }}
          />
        )}

        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".zip,.json,.html"
          className="hidden"
          onChange={(e) => e.target.files && stage(e.target.files)}
        />

        {/* Loading sweep */}
        {loading && (
          <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
            <div
              className="absolute inset-y-0 w-1/2 animate-curtain-sweep"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(131,58,180,0.18), rgba(253,29,29,0.12), transparent)' }}
            />
            <div
              className="absolute left-0 right-0 h-px animate-scan-line"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(131,58,180,0.6), rgba(253,29,29,0.6), transparent)' }}
            />
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="relative w-14 h-14">
              <div
                className="absolute inset-0 rounded-full animate-spin"
                style={{ background: 'conic-gradient(from 0deg, #833ab4, #fd1d1d, #fcb045, transparent)' }}
              />
              <div className="absolute inset-1 rounded-full bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'linear-gradient(135deg, #833ab4, #fcb045)' }} />
              </div>
            </div>
            <p className="text-white/70 text-sm font-medium">{t('landing.analyzing')}</p>
            <p className="text-white/25 text-xs">Reading your data…</p>
          </div>
        ) : pending ? (
          /* Files staged — waiting for Analyze click */
          <div className="flex flex-col items-center gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(131,58,180,0.3), rgba(253,29,29,0.2))',
                border: '1px solid rgba(131,58,180,0.4)',
              }}
            >
              ✅
            </div>
            <div>
              <p className="text-white font-medium text-sm">{fileLabel}</p>
              <p className="text-white/40 text-xs mt-0.5">Ready to analyze</p>
            </div>
            <button
              onClick={handleClear}
              className="text-xs text-white/25 hover:text-white/50 transition-colors"
            >
              Remove file
            </button>
          </div>
        ) : (
          /* Idle state */
          <div className="flex flex-col items-center gap-4">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(131,58,180,0.2), rgba(253,29,29,0.2))',
                border: '1px solid rgba(131,58,180,0.3)',
              }}
            >
              📂
            </div>
            <div>
              <p className="text-white font-medium mb-1">{t('landing.upload_title')}</p>
              <p className="text-white/40 text-sm">{t('landing.upload_sub')}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
              style={{ background: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' }}
            >
              {t('landing.upload_cta')}
            </button>
            <p className="text-white/30 text-xs">{t('landing.upload_html_note')}</p>
          </div>
        )}

        {error && (
          <div
            className="mt-4 p-3 rounded-xl text-sm text-red-300"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            {error}
          </div>
        )}
      </div>

      {/* Analyze button — only shown when files are staged */}
      {pending && !loading && (
        <button
          onClick={handleAnalyze}
          className="relative w-full py-4 rounded-2xl text-base font-bold text-white overflow-hidden transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, #833ab4 0%, #e1306c 40%, #fd1d1d 65%, #fcb045 100%)',
            boxShadow: '0 0 32px rgba(131,58,180,0.5), 0 0 64px rgba(225,48,108,0.25), 0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          {/* Shimmer sweep */}
          <span
            className="absolute inset-0 animate-shimmer pointer-events-none"
            style={{
              background: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.25) 50%, transparent 70%)',
            }}
          />
          {/* Pulsing outer ring */}
          <span
            className="absolute inset-0 rounded-2xl animate-pulse-ring pointer-events-none"
            style={{ boxShadow: '0 0 0 0 rgba(131,58,180,0.6)' }}
          />
          <span className="relative flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Analyze
          </span>
        </button>
      )}
    </div>
  )
}

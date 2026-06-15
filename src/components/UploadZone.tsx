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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragging(false)
      if (e.dataTransfer.files.length > 0) onFiles(e.dataTransfer.files)
    },
    [onFiles]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(true)
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragging(false)}
      onClick={() => !loading && inputRef.current?.click()}
      className="relative cursor-pointer select-none transition-all duration-300 rounded-2xl p-8 text-center group"
      style={{
        background: dragging
          ? 'rgba(131,58,180,0.15)'
          : 'rgba(255,255,255,0.03)',
        border: `2px dashed ${dragging ? 'rgba(131,58,180,0.8)' : 'rgba(255,255,255,0.12)'}`,
        boxShadow: dragging ? '0 0 40px rgba(131,58,180,0.2)' : 'none',
      }}
    >
      {/* Gradient border glow on hover */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(131,58,180,0.1), rgba(253,29,29,0.1), rgba(252,176,69,0.1))',
        }}
      />

      <input
        ref={inputRef}
        type="file"
        multiple
        accept=".zip,.json,.html"
        className="hidden"
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />

      {loading ? (
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 rounded-full animate-spin"
            style={{
              background: 'conic-gradient(from 0deg, #833ab4, #fd1d1d, #fcb045, transparent)',
            }}
          />
          <p className="text-white/60 text-sm">{t('landing.analyzing')}</p>
        </div>
      ) : (
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
  )
}

import { useRef, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { usePostHog } from '@posthog/react'

interface Props {
  followers: number
  following: number
  notFollowingBack: number
  mutuals: number
  dayOnesLeft: number
  hasTimestamps: boolean
  onClose: () => void
}

interface Severity {
  label: string
  emojis: string
  blob1: string
  blob2: string
  blob3: string
  gradStart: string
  gradEnd: string
}

function getSeverity(nfbRatio: number): Severity {
  if (nfbRatio > 70) {
    return {
      label: 'ur cooked',
      emojis: '💀😭',
      blob1: '#7f0000',
      blob2: '#b91c1c',
      blob3: '#450a0a',
      gradStart: '#b91c1c',
      gradEnd: '#7f1d1d',
    }
  }
  if (nfbRatio > 50) {
    return {
      label: 'yikes...',
      emojis: '😱😭',
      blob1: '#9a3412',
      blob2: '#ea580c',
      blob3: '#7c2d12',
      gradStart: '#ea580c',
      gradEnd: '#dc2626',
    }
  }
  if (nfbRatio > 30) {
    return {
      label: 'could be worse',
      emojis: '😬🤷',
      blob1: '#833ab4',
      blob2: '#fd1d1d',
      blob3: '#fcb045',
      gradStart: '#833ab4',
      gradEnd: '#fcb045',
    }
  }
  return {
    label: 'Not bad',
    emojis: '😼🔥',
    blob1: '#14532d',
    blob2: '#4ade80',
    blob3: '#833ab4',
    gradStart: '#15803d',
    gradEnd: '#4ade80',
  }
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export default function ShareCard({
  followers,
  following,
  notFollowingBack,
  mutuals,
  dayOnesLeft,
  hasTimestamps,
  onClose,
}: Props) {
  const posthog = usePostHog()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')

  const nfbRatio = following > 0 ? (notFollowingBack / following) * 100 : 0
  const severity = getSeverity(nfbRatio)

  const renderCanvas = (): string => {
    const canvas = canvasRef.current
    if (!canvas) return ''
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    const W = 1080
    const H = 1080
    canvas.width = W
    canvas.height = H

    // Background
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, W, H)

    // Dynamic blobs based on severity
    const addBlob = (x: number, y: number, r: number, color: string, alpha: number) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, hexToRgba(color, alpha))
      grad.addColorStop(1, hexToRgba(color, 0))
      ctx.fillStyle = grad
      ctx.fillRect(x - r, y - r, r * 2, r * 2)
    }
    addBlob(180, 200, 580, severity.blob1, 0.4)
    addBlob(900, 820, 540, severity.blob2, 0.35)
    addBlob(540, 480, 420, severity.blob3, 0.2)

    // Gradient top bar
    const bar = ctx.createLinearGradient(0, 0, W, 0)
    bar.addColorStop(0, severity.gradStart)
    bar.addColorStop(1, severity.gradEnd)
    ctx.fillStyle = bar
    ctx.fillRect(0, 0, W, 10)

    // TARE logo — big gradient text
    ctx.font = 'bold 88px Inter, system-ui, sans-serif'
    const logoGrad = ctx.createLinearGradient(60, 0, 420, 0)
    logoGrad.addColorStop(0, '#833ab4')
    logoGrad.addColorStop(0.5, '#e1306c')
    logoGrad.addColorStop(1, '#fcb045')
    ctx.fillStyle = logoGrad
    ctx.fillText('Tare', 60, 122)

    // Severity emojis — top right
    ctx.font = '68px system-ui, sans-serif'
    ctx.textAlign = 'right'
    ctx.fillStyle = 'white'
    ctx.fillText(severity.emojis, W - 60, 118)
    ctx.textAlign = 'left'

    // Divider
    ctx.strokeStyle = 'rgba(255,255,255,0.07)'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(60, 148)
    ctx.lineTo(W - 60, 148)
    ctx.stroke()

    // Big number
    ctx.font = 'bold 168px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'white'
    ctx.fillText(notFollowingBack.toLocaleString(), 60, 340)

    // Subtitle
    ctx.font = '42px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.48)'
    ctx.fillText("don't follow me back", 60, 400)

    // Severity pill
    ctx.font = 'bold 26px Inter, system-ui, sans-serif'
    const pillText = `${severity.emojis}  ${severity.label}`
    const pillMetrics = ctx.measureText(pillText)
    const pillW = pillMetrics.width + 52
    const pillH = 50
    const pillX = 60
    const pillY = 440

    const pillBg = ctx.createLinearGradient(pillX, 0, pillX + pillW, 0)
    pillBg.addColorStop(0, hexToRgba(severity.gradStart, 0.3))
    pillBg.addColorStop(1, hexToRgba(severity.gradEnd, 0.3))
    ctx.fillStyle = pillBg
    ctx.beginPath()
    ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2)
    ctx.fill()

    ctx.strokeStyle = hexToRgba(severity.gradStart, 0.6)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.roundRect(pillX, pillY, pillW, pillH, pillH / 2)
    ctx.stroke()

    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText(pillText, pillX + 26, pillY + 34)

    // Stat grid (2×2)
    const stats = [
      { label: 'Followers', value: followers.toLocaleString() },
      { label: 'Following', value: following.toLocaleString() },
      { label: 'Not following back', value: `${nfbRatio.toFixed(0)}%` },
      {
        label: hasTimestamps ? 'Day Ones who left' : 'Mutuals',
        value: hasTimestamps
          ? dayOnesLeft.toLocaleString()
          : mutuals.toLocaleString(),
      },
    ]

    const cardW = 462
    const cardH = 158
    const gap = 32
    const startX = 60
    const startY = 540

    stats.forEach((stat, i) => {
      const col = i % 2
      const row = Math.floor(i / 2)
      const x = startX + col * (cardW + gap)
      const y = startY + row * (cardH + gap)

      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.beginPath()
      ctx.roundRect(x, y, cardW, cardH, 18)
      ctx.fill()

      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.roundRect(x, y, cardW, cardH, 18)
      ctx.stroke()

      ctx.font = 'bold 60px Inter, system-ui, sans-serif'
      ctx.fillStyle = 'white'
      ctx.fillText(stat.value, x + 28, y + 82)

      ctx.font = '26px Inter, system-ui, sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.fillText(stat.label, x + 28, y + 124)
    })

    // Domain — bottom center, large
    ctx.font = 'bold 34px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.22)'
    ctx.textAlign = 'center'
    ctx.fillText('usetare.vercel.app', W / 2, H - 48)
    ctx.textAlign = 'left'

    return canvas.toDataURL('image/png')
  }

  useEffect(() => {
    document.fonts.ready.then(() => {
      const url = renderCanvas()
      if (url) setPreviewUrl(url)
    })
  }, [])

  const downloadCard = () => {
    const url = renderCanvas()
    if (!url) return
    posthog?.capture('share_card_downloaded', {
      severity_label: severity.label,
      not_following_back_count: notFollowingBack,
      follower_count: followers,
      following_count: following,
    })
    const link = document.createElement('a')
    link.download = 'tare-stats.png'
    link.href = url
    link.click()
  }

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative max-w-sm w-full rounded-2xl p-6 text-white"
        style={{
          background: 'rgba(12,12,12,0.98)',
          border: '1px solid rgba(131,58,180,0.3)',
          boxShadow: '0 0 48px rgba(131,58,180,0.12)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-1">Share your results</h2>
        <p className="text-sm text-white/40 mb-4">Downloads a 1080×1080 PNG.</p>

        <div className="rounded-xl overflow-hidden mb-5" style={{ border: '1px solid rgba(255,255,255,0.07)' }}>
          {previewUrl ? (
            <img src={previewUrl} alt="Card preview" className="w-full block" />
          ) : (
            <div
              className="flex items-center justify-center"
              style={{ height: '160px', background: 'rgba(255,255,255,0.03)' }}
            >
              <p className="text-white/20 text-sm">Rendering…</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={downloadCard}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95"
            style={{ background: `linear-gradient(135deg, ${severity.gradStart}, ${severity.gradEnd})` }}
          >
            Download image
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Cancel
          </button>
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>,
    document.body
  )
}

import { useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { IGUser } from '../types'

interface DataPoint {
  month: string
  label: string
  count: number
}

type TimeSpan = '6m' | '1y' | '3y' | 'all'
type DataType = 'followers' | 'following'

function buildCumulative(users: IGUser[]): DataPoint[] {
  const withTs = users.filter((u) => u.timestamp !== null)
  if (withTs.length === 0) return []

  const sorted = [...withTs].sort((a, b) => a.timestamp! - b.timestamp!)
  const monthMap = new Map<string, number>()

  sorted.forEach((u) => {
    const d = new Date(u.timestamp! * 1000)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    monthMap.set(key, (monthMap.get(key) ?? 0) + 1)
  })

  const points: DataPoint[] = []
  let cumulative = 0
  monthMap.forEach((count, month) => {
    cumulative += count
    const [yr, mo] = month.split('-')
    const d = new Date(+yr, +mo - 1)
    points.push({
      month,
      label: d.toLocaleDateString('en', { year: 'numeric', month: 'short' }),
      count: cumulative,
    })
  })

  return points
}

function filterBySpan(points: DataPoint[], span: TimeSpan): DataPoint[] {
  if (span === 'all' || points.length === 0) return points
  const n = span === '6m' ? 6 : span === '1y' ? 12 : 36
  const last = points[points.length - 1].month
  const [ly, lm] = last.split('-').map(Number)
  const cutoff = new Date(ly, lm - 1)
  cutoff.setMonth(cutoff.getMonth() - n)
  const cutoffKey = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, '0')}`
  return points.filter((p) => p.month >= cutoffKey)
}

const VB_W = 820
const VB_H = 280
const PAD = { top: 24, right: 24, bottom: 44, left: 64 }
const PLOT_W = VB_W - PAD.left - PAD.right
const PLOT_H = VB_H - PAD.top - PAD.bottom

interface Props {
  followers: IGUser[]
  following: IGUser[]
}

export default function GrowthGraph({ followers, following }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const exportCanvasRef = useRef<HTMLCanvasElement>(null)
  const [timeSpan, setTimeSpan] = useState<TimeSpan>('all')
  const [dataType, setDataType] = useState<DataType>('followers')
  const [hoverIdx, setHoverIdx] = useState<number | null>(null)
  const [showExport, setShowExport] = useState(false)
  const [exportUrl, setExportUrl] = useState<string>('')

  const allFollowerPts = useMemo(() => buildCumulative(followers), [followers])
  const allFollowingPts = useMemo(() => buildCumulative(following), [following])

  const points = useMemo(() => {
    const base = dataType === 'followers' ? allFollowerPts : allFollowingPts
    return filterBySpan(base, timeSpan)
  }, [dataType, timeSpan, allFollowerPts, allFollowingPts])

  const maxCount = Math.max(...points.map((p) => p.count), 1)

  const toX = (i: number) =>
    PAD.left + (points.length > 1 ? (i / (points.length - 1)) * PLOT_W : PLOT_W / 2)
  const toY = (count: number) =>
    PAD.top + PLOT_H - (count / maxCount) * PLOT_H

  const linePath =
    points.length > 1
      ? points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(i).toFixed(1)},${toY(p.count).toFixed(1)}`).join(' ')
      : ''

  const areaPath =
    points.length > 1
      ? `${linePath} L ${toX(points.length - 1).toFixed(1)},${(PAD.top + PLOT_H).toFixed(1)} L ${toX(0).toFixed(1)},${(PAD.top + PLOT_H).toFixed(1)} Z`
      : ''

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((r) => ({
    value: Math.round(maxCount * r),
    y: toY(Math.round(maxCount * r)),
  }))

  const xStep = points.length > 24 ? 6 : points.length > 12 ? 3 : 1
  const xLabels = points
    .map((p, i) => ({ ...p, i }))
    .filter((_, i) => i % xStep === 0 || i === points.length - 1)

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg || points.length < 2) return
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    const svgPt = pt.matrixTransform(svg.getScreenCTM()!.inverse())
    const raw = ((svgPt.x - PAD.left) / PLOT_W) * (points.length - 1)
    setHoverIdx(Math.max(0, Math.min(points.length - 1, Math.round(raw))))
  }

  const renderExportCanvas = async (): Promise<string> => {
    await document.fonts.ready

    const svg = svgRef.current
    const canvas = exportCanvasRef.current
    if (!svg || !canvas) return ''
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''

    const W = 1200
    const H = 560
    canvas.width = W
    canvas.height = H

    // Background
    ctx.fillStyle = '#0a0a0a'
    ctx.fillRect(0, 0, W, H)

    // Subtle blobs
    const addBlob = (x: number, y: number, r: number, color: string, alpha: number) => {
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, color + Math.round(alpha * 255).toString(16).padStart(2, '0'))
      grad.addColorStop(1, color + '00')
      ctx.fillStyle = grad
      ctx.fillRect(x - r, y - r, r * 2, r * 2)
    }
    addBlob(200, 160, 400, '#833ab4', 0.25)
    addBlob(1000, 400, 350, '#fd1d1d', 0.2)

    // Gradient top bar
    const bar = ctx.createLinearGradient(0, 0, W, 0)
    bar.addColorStop(0, '#833ab4')
    bar.addColorStop(0.5, '#e1306c')
    bar.addColorStop(1, '#fcb045')
    ctx.fillStyle = bar
    ctx.fillRect(0, 0, W, 8)

    // Tare logo
    ctx.font = 'bold 64px Inter, system-ui, sans-serif'
    const logoGrad = ctx.createLinearGradient(40, 0, 320, 0)
    logoGrad.addColorStop(0, '#833ab4')
    logoGrad.addColorStop(0.5, '#e1306c')
    logoGrad.addColorStop(1, '#fcb045')
    ctx.fillStyle = logoGrad
    ctx.fillText('Tare', 40, 80)

    // Title
    const spanLabel = timeSpan === 'all' ? 'All time' : timeSpan === '6m' ? 'Last 6 months' : timeSpan === '1y' ? 'Last year' : 'Last 3 years'
    ctx.font = '22px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.45)'
    ctx.fillText(
      `${dataType === 'followers' ? 'Follower Growth' : 'Following History'} · ${spanLabel}`,
      40,
      112
    )

    // Domain
    ctx.font = 'bold 20px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.textAlign = 'center'
    ctx.fillText('usetare.vercel.app', W / 2, H - 18)
    ctx.textAlign = 'left'

    // Serialize SVG and draw it
    return new Promise((resolve) => {
      const serializer = new XMLSerializer()
      let src = serializer.serializeToString(svg)
      if (!src.includes('xmlns=')) {
        src = src.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
      }
      const blob = new Blob([src], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 140, W, H - 178)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => resolve('')
      img.src = url
    })
  }

  const handleExportClick = async () => {
    setShowExport(true)
    setExportUrl('')
    const url = await renderExportCanvas()
    setExportUrl(url)
  }

  const downloadExport = () => {
    if (!exportUrl) return
    const link = document.createElement('a')
    link.download = `tare-${dataType}-growth.png`
    link.href = exportUrl
    link.click()
  }

  const hasData = points.length > 1

  const spanBtnStyle = (s: TimeSpan) => ({
    padding: '4px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 500 as const,
    cursor: 'pointer' as const,
    background: timeSpan === s ? 'rgba(131,58,180,0.25)' : 'rgba(255,255,255,0.05)',
    border: timeSpan === s ? '1px solid rgba(131,58,180,0.45)' : '1px solid rgba(255,255,255,0.08)',
    color: timeSpan === s ? 'white' : 'rgba(255,255,255,0.4)',
  })

  const typeBtnStyle = (t: DataType) => ({
    padding: '4px 12px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 500 as const,
    cursor: 'pointer' as const,
    background: dataType === t ? 'rgba(131,58,180,0.25)' : 'rgba(255,255,255,0.05)',
    border: dataType === t ? '1px solid rgba(131,58,180,0.45)' : '1px solid rgba(255,255,255,0.08)',
    color: dataType === t ? 'white' : 'rgba(255,255,255,0.4)',
  })

  const tipX = hoverIdx !== null ? Math.min(toX(hoverIdx) + 12, VB_W - 148) : 0
  const tipY = hoverIdx !== null ? Math.max(toY(points[hoverIdx]?.count ?? 0) - 44, PAD.top) : 0

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-white font-semibold text-sm">Growth Over Time</h3>
          <p className="text-white/30 text-xs mt-0.5">
            {dataType === 'followers'
              ? 'Cumulative follower count by when they started following you'
              : 'Cumulative count of who you started following over time'}
          </p>
        </div>

        <button
          onClick={handleExportClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-white/40 hover:text-white/70 transition-colors"
          style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export PNG
        </button>
      </div>

      {/* Toggles */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1">
          <button style={typeBtnStyle('followers')} onClick={() => setDataType('followers')}>Followers</button>
          <button style={typeBtnStyle('following')} onClick={() => setDataType('following')}>Following</button>
        </div>
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
        <div className="flex gap-1">
          {(['6m', '1y', '3y', 'all'] as TimeSpan[]).map((s) => (
            <button key={s} style={spanBtnStyle(s)} onClick={() => setTimeSpan(s)}>
              {s === 'all' ? 'All' : s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        {!hasData ? (
          <div className="flex items-center justify-center" style={{ height: '180px' }}>
            <p className="text-white/20 text-sm">Not enough data for this time range</p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VB_W} ${VB_H}`}
            width="100%"
            style={{ display: 'block', cursor: 'crosshair' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoverIdx(null)}
          >
            <defs>
              <linearGradient id="tare-line-grad" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="#833ab4" />
                <stop offset="50%" stopColor="#e1306c" />
                <stop offset="100%" stopColor="#fcb045" />
              </linearGradient>
              <linearGradient id="tare-area-grad" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#833ab4" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#833ab4" stopOpacity="0" />
              </linearGradient>
            </defs>

            {yTicks.map((tick) => (
              <line key={tick.value} x1={PAD.left} y1={tick.y} x2={VB_W - PAD.right} y2={tick.y}
                stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
            ))}
            {yTicks.map((tick) => (
              <text key={tick.value} x={PAD.left - 10} y={tick.y + 4} textAnchor="end"
                fill="rgba(255,255,255,0.25)" fontSize={11} fontFamily="system-ui, sans-serif">
                {tick.value >= 1000 ? `${(tick.value / 1000).toFixed(1)}k` : tick.value}
              </text>
            ))}
            {xLabels.map(({ label, i }) => (
              <text key={i} x={toX(i)} y={VB_H - 8} textAnchor="middle"
                fill="rgba(255,255,255,0.25)" fontSize={10} fontFamily="system-ui, sans-serif">
                {label}
              </text>
            ))}

            <path d={areaPath} fill="url(#tare-area-grad)" />
            <path d={linePath} fill="none" stroke="url(#tare-line-grad)" strokeWidth={2.5}
              strokeLinecap="round" strokeLinejoin="round" />

            {hoverIdx !== null && points[hoverIdx] && (
              <>
                <line x1={toX(hoverIdx)} y1={PAD.top} x2={toX(hoverIdx)} y2={PAD.top + PLOT_H}
                  stroke="rgba(255,255,255,0.15)" strokeWidth={1} strokeDasharray="4 3" />
                <circle cx={toX(hoverIdx)} cy={toY(points[hoverIdx].count)} r={5}
                  fill="#e1306c" stroke="white" strokeWidth={2} />
                <rect x={tipX} y={tipY} width={136} height={44} rx={8}
                  fill="rgba(14,14,14,0.96)" stroke="rgba(131,58,180,0.35)" strokeWidth={1} />
                <text x={tipX + 12} y={tipY + 18} fill="white" fontSize={13} fontWeight="bold"
                  fontFamily="system-ui, sans-serif">
                  {points[hoverIdx].count.toLocaleString()}
                </text>
                <text x={tipX + 12} y={tipY + 34} fill="rgba(255,255,255,0.4)" fontSize={11}
                  fontFamily="system-ui, sans-serif">
                  {points[hoverIdx].label}
                </text>
              </>
            )}
          </svg>
        )}
      </div>

      {/* Hidden canvas for export */}
      <canvas ref={exportCanvasRef} className="hidden" />

      {showExport && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={() => setShowExport(false)}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative max-w-md w-full rounded-2xl p-6 text-white"
            style={{
              background: 'rgba(12,12,12,0.98)',
              border: '1px solid rgba(131,58,180,0.3)',
              boxShadow: '0 0 48px rgba(131,58,180,0.12)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold mb-1">Export chart</h2>
            <p className="text-sm text-white/40 mb-4">Downloads a PNG with your growth data.</p>

            <div
              className="rounded-xl overflow-hidden mb-5"
              style={{ border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {exportUrl ? (
                <img src={exportUrl} alt="Chart preview" className="w-full block" />
              ) : (
                <div
                  className="flex items-center justify-center gap-2"
                  style={{ height: '140px', background: 'rgba(255,255,255,0.03)' }}
                >
                  <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white/60 animate-spin" />
                  <p className="text-white/25 text-sm">Rendering…</p>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={downloadExport}
                disabled={!exportUrl}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                style={{ background: 'linear-gradient(135deg, #833ab4, #e1306c, #fcb045)' }}
              >
                {exportUrl ? 'Download PNG' : 'Rendering…'}
              </button>
              <button
                onClick={() => setShowExport(false)}
                className="px-4 py-2.5 rounded-xl text-sm text-white/50 hover:text-white transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}

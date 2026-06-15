import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const blobRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    let raf: number
    let mx = 0
    let my = 0

    const onMouseMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2
      my = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    const PARALLAX = [8, -10, 6, -7]

    const tick = () => {
      blobRefs.current.forEach((el, i) => {
        if (!el) return
        const p = PARALLAX[i]
        el.style.transform = `translate(${mx * p}px, ${my * p}px)`
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0a0a0a]">
      <div
        ref={(el) => { blobRefs.current[0] = el }}
        className="absolute -top-48 -left-48 w-[700px] h-[700px] rounded-full opacity-[0.18] animate-blob-1 transition-transform duration-700 ease-out"
        style={{ background: 'radial-gradient(circle, #833ab4 0%, transparent 70%)', filter: 'blur(72px)', willChange: 'transform' }}
      />
      <div
        ref={(el) => { blobRefs.current[1] = el }}
        className="absolute -bottom-48 -right-48 w-[800px] h-[800px] rounded-full opacity-[0.16] animate-blob-2 transition-transform duration-700 ease-out"
        style={{ background: 'radial-gradient(circle, #fd1d1d 0%, transparent 70%)', filter: 'blur(80px)', willChange: 'transform' }}
      />
      <div
        ref={(el) => { blobRefs.current[2] = el }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.12] animate-blob-3 transition-transform duration-700 ease-out"
        style={{ background: 'radial-gradient(circle, #fcb045 0%, transparent 70%)', filter: 'blur(90px)', willChange: 'transform' }}
      />
      <div
        ref={(el) => { blobRefs.current[3] = el }}
        className="absolute top-1/4 right-1/3 w-[450px] h-[450px] rounded-full opacity-[0.10] animate-blob-4 transition-transform duration-700 ease-out"
        style={{ background: 'radial-gradient(circle, #e1306c 0%, transparent 70%)', filter: 'blur(60px)', willChange: 'transform' }}
      />

      {/* Noise texture overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />
    </div>
  )
}

import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const blobRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    let raf: number
    let tx = 0, ty = 0
    let cx = 0, cy = 0

    const onMouseMove = (e: MouseEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2
      ty = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove, { passive: true })

    const PARALLAX = [18, -24, 14, -16, 20]

    const tick = () => {
      cx += (tx - cx) * 0.04
      cy += (ty - cy) * 0.04
      blobRefs.current.forEach((el, i) => {
        if (!el) return
        const p = PARALLAX[i]
        el.style.transform = `translate(${cx * p}px, ${cy * p}px)`
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
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#070709]">
      {/* Blob 1 — purple, top-left */}
      <div
        ref={(el) => { blobRefs.current[0] = el }}
        className="absolute -top-64 -left-64 w-[900px] h-[900px] rounded-full animate-blob-1"
        style={{
          background: 'radial-gradient(circle at 40% 40%, #833ab4 0%, #5b2d8e 40%, transparent 70%)',
          filter: 'blur(60px)',
          opacity: 0.55,
          mixBlendMode: 'screen',
        }}
      />

      {/* Blob 2 — red/pink, bottom-right */}
      <div
        ref={(el) => { blobRefs.current[1] = el }}
        className="absolute -bottom-64 -right-64 w-[1000px] h-[1000px] rounded-full animate-blob-2"
        style={{
          background: 'radial-gradient(circle at 60% 60%, #fd1d1d 0%, #e1306c 45%, transparent 70%)',
          filter: 'blur(70px)',
          opacity: 0.45,
          mixBlendMode: 'screen',
        }}
      />

      {/* Blob 3 — gold, center */}
      <div
        ref={(el) => { blobRefs.current[2] = el }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full animate-blob-3"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #fcb045 0%, #f77737 50%, transparent 70%)',
          filter: 'blur(90px)',
          opacity: 0.25,
          mixBlendMode: 'screen',
        }}
      />

      {/* Blob 4 — deep pink, top-right */}
      <div
        ref={(el) => { blobRefs.current[3] = el }}
        className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full animate-blob-4"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #e1306c 0%, #833ab4 55%, transparent 70%)',
          filter: 'blur(65px)',
          opacity: 0.4,
          mixBlendMode: 'screen',
        }}
      />

      {/* Blob 5 — indigo accent, bottom-left */}
      <div
        ref={(el) => { blobRefs.current[4] = el }}
        className="absolute -bottom-32 -left-32 w-[550px] h-[550px] rounded-full animate-blob-2"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #4f46e5 0%, #833ab4 50%, transparent 70%)',
          filter: 'blur(75px)',
          opacity: 0.35,
          mixBlendMode: 'screen',
          animationDelay: '-8s',
        }}
      />

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Vignette — keeps edges dark */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 50%, transparent 40%, #070709 100%)',
        }}
      />
    </div>
  )
}

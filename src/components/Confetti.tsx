import { useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function Confetti() {
  useEffect(() => {
    const colors = ['#833ab4', '#e1306c', '#fd1d1d', '#f77737', '#fcb045', '#ffffff']

    const fire = (opts: confetti.Options) =>
      confetti({ colors, disableForReducedMotion: true, ...opts })

    // Left cannon
    fire({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0, y: 0.65 }, startVelocity: 60, scalar: 1.3 })
    // Right cannon
    fire({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.65 }, startVelocity: 60, scalar: 1.3 })

    // Center burst after short delay
    setTimeout(() => {
      fire({ particleCount: 120, spread: 160, origin: { y: 0.5 }, startVelocity: 45, scalar: 1.1, decay: 0.92 })
    }, 200)

    // Trailing shower
    setTimeout(() => {
      fire({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.6 }, startVelocity: 50 })
      fire({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.6 }, startVelocity: 50 })
    }, 400)
  }, [])

  return null
}

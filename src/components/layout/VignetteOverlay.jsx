import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * VignetteOverlay
 *
 * A radial gradient overlay that darkens the screen edges as the
 * user scrolls deeper. Intensifies from 0.35 → 0.88 opacity.
 * Focuses the eye on the centered diver.
 */
export default function VignetteOverlay({ proxyRef }) {
  const vignetteRef = useRef(null)

  useEffect(() => {
    if (!proxyRef?.current || !vignetteRef.current) return

    const trigger = ScrollTrigger.create({
      trigger: proxyRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        if (vignetteRef.current) {
          // 0.35 at surface → 0.88 in the abyss
          vignetteRef.current.style.opacity =
            0.35 + self.progress * 0.53
        }
      },
    })

    return () => trigger.kill()
  }, [proxyRef])

  return <div className="vignette-overlay" ref={vignetteRef} />
}

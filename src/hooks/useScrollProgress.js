import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Returns a ref that always holds the latest scroll progress (0–1).
 * Uses ScrollTrigger's onUpdate — no React state, zero re-renders.
 * Safe to read every frame in R3F's useFrame.
 */
export function useScrollProgress(proxyRef) {
  const progressRef = useRef(0)
  const velocityRef = useRef(0)

  useEffect(() => {
    if (!proxyRef?.current) return

    const trigger = ScrollTrigger.create({
      trigger: proxyRef.current,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress
        velocityRef.current = self.getVelocity() / 1000
      },
    })

    return () => trigger.kill()
  }, [proxyRef])

  return { progressRef, velocityRef }
}

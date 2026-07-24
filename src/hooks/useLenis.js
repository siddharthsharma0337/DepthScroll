import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import useStore from '../store/useStore'

/**
 * Initialises Lenis smooth scroll and wires it into
 * the GSAP ticker for frame-perfect scrubbing.
 *
 * Returns the Lenis instance ref.
 */
export function useLenis() {
  const lenisRef = useRef(null)
  const setLenisRef = useStore((s) => s.setLenisRef)

  useEffect(() => {
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    const lenis = new Lenis({
      duration: prefersReduced ? 0 : 1.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: !prefersReduced,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
    })

    lenisRef.current = lenis
    setLenisRef(lenis)

    // Tie Lenis tick to GSAP ticker for sync
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000)
    })
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove((time) => lenis.raf(time * 1000))
      lenis.destroy()
      lenisRef.current = null
    }
  }, [setLenisRef])

  return lenisRef
}

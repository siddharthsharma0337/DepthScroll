import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { useProgress } from '@react-three/drei'
import useStore from '../../store/useStore'

export default function Loader() {
  const isLoaded  = useStore((s) => s.isLoaded)
  const { progress } = useProgress()
  const loaderRef = useRef(null)
  const fillRef   = useRef(null)
  const dotsRef   = useRef([])

  const isFullyLoaded = isLoaded && progress >= 100

  // 1. Animate gauge and dots while loading
  useEffect(() => {
    if (!fillRef.current) return
    
    // Fill gauge to an arbitrary "almost done" point
    gsap.to(fillRef.current, {
      height: '72%',
      duration: 2.4,
      ease: 'power1.inOut',
    })

    // Stagger dots in
    gsap.to(dotsRef.current, {
      opacity: 0.25,
      duration: 0.5,
      stagger: 0.15,
      delay: 0.4,
      ease: 'power2.inOut',
    })

    // Hint pulse text
    gsap.to('.loader__hint', {
      opacity: 0.4,
      duration: 1.0,
      delay: 0.6,
      ease: 'power2.inOut',
    })
  }, [])

  // 2. Complete animation and exit when fully loaded
  useEffect(() => {
    if (!isFullyLoaded) return

    const tl = gsap.timeline()

    // Light up the first dot immediately as a sign of readiness
    const activeDot = dotsRef.current[0]
    if (activeDot) {
      gsap.to(activeDot, { opacity: 1, scale: 1.4, duration: 0.3, ease: 'power2.out' })
    }

    // Complete gauge fill to 100%
    tl.to(fillRef.current, {
      height: '100%',
      duration: 0.5,
      ease: 'power2.inOut',
    })

    // Stagger remaining dots to full opacity and scale
    tl.to(dotsRef.current, {
      opacity: 1,
      scale: 1.2,
      duration: 0.25,
      stagger: 0.06,
      ease: 'power2.out',
    }, '-=0.2')

    // Fade and slide the entire loader out, then hide it
    tl.to(loaderRef.current, {
      opacity: 0,
      y: -30,
      duration: 1.2,
      delay: 0.5,
      ease: 'power2.inOut',
      onComplete: () => {
        if (loaderRef.current) loaderRef.current.style.display = 'none'
      },
    })
  }, [isFullyLoaded])

  return (
    <div className="loader" ref={loaderRef}>
      <p className="loader__subtitle">D E P T H S C R O L L</p>
      <h1 className="loader__title">Descend.</h1>

      <div className="loader__gauge">
        <div className="loader__gauge-fill" ref={fillRef} />
      </div>

      {/* 8 dots representing loading progress items */}
      <div className="loader__dots">
        {Array.from({ length: 8 }, (_, i) => (
          <span
            key={i}
            ref={(el) => (dotsRef.current[i] = el)}
            className="loader__dot"
            style={{ opacity: 0, transform: 'scale(1)' }}
          />
        ))}
      </div>

      <p className="loader__hint" style={{ opacity: 0 }}>
        Preparing your descent
      </p>
    </div>
  )
}

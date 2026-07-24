import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { useProgress } from '@react-three/drei'
import useStore from '../../store/useStore'

gsap.registerPlugin(SplitText)

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
    
    // Title SplitText
    const splitTitle = new SplitText('.loader__title', { type: 'chars' })
    gsap.fromTo(splitTitle.chars, 
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 1, stagger: 0.05, ease: 'expo.out', delay: 0.2 }
    )

    // Fill gauge to an arbitrary "almost done" point
    gsap.to(fillRef.current, {
      height: '72%',
      duration: 2.4,
      ease: 'expo.inOut',
    })

    // Stagger dots in
    gsap.to(dotsRef.current, {
      opacity: 0.25,
      duration: 0.5,
      stagger: 0.15,
      delay: 0.4,
      ease: 'expo.out',
    })

    // Hint pulse text
    gsap.to('.loader__hint', {
      opacity: 0.4,
      duration: 1.0,
      delay: 0.6,
      ease: 'power2.inOut',
    })
    
    return () => splitTitle.revert()
  }, [])

  // 2. Complete animation and exit when fully loaded
  useEffect(() => {
    if (!isFullyLoaded) return

    const tl = gsap.timeline()

    // Light up the first dot immediately as a sign of readiness
    const activeDot = dotsRef.current[0]
    if (activeDot) {
      gsap.to(activeDot, { opacity: 1, scale: 1.4, duration: 0.3, ease: 'expo.out' })
    }

    // Complete gauge fill to 100%
    tl.to(fillRef.current, {
      height: '100%',
      duration: 0.5,
      ease: 'expo.inOut',
    })

    // Stagger remaining dots to full opacity and scale
    tl.to(dotsRef.current, {
      opacity: 1,
      scale: 1.2,
      duration: 0.25,
      stagger: 0.06,
      ease: 'expo.out',
    }, '-=0.2')

    // Fade out inner elements quickly
    tl.to('.loader__title, .loader__subtitle, .loader__gauge, .loader__dots, .loader__hint', {
      opacity: 0,
      y: -20,
      duration: 0.6,
      ease: 'expo.inOut'
    })

    // Slide up curtain
    tl.to(loaderRef.current, {
      yPercent: -100,
      duration: 1.2,
      ease: 'expo.inOut',
      onComplete: () => {
        if (loaderRef.current) loaderRef.current.style.display = 'none'
      },
    }, '-=0.4')
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

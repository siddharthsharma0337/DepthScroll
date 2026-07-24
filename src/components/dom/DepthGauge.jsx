import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './DepthGauge.css'

gsap.registerPlugin(ScrollTrigger)

export default function DepthGauge({ proxyRef }) {
  const thumbRef = useRef(null)
  const wrapperRef = useRef(null)
  const [depth, setDepth] = useState(0)

  useEffect(() => {
    // Slide in animation on load
    gsap.fromTo(wrapperRef.current,
      { x: 100, opacity: 0 },
      { x: 0, opacity: 1, duration: 1.5, ease: 'expo.out', delay: 2.2 }
    )

    // Determine the scroll element: use the proxy if available, or the document body
    const scrollTarget = proxyRef && proxyRef.current ? proxyRef.current : document.body

    const trigger = ScrollTrigger.create({
      trigger: scrollTarget,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        if (thumbRef.current) {
          thumbRef.current.style.top = `${self.progress * 100}%`
        }
        // Marianas Trench max depth is ~10994 meters
        setDepth(Math.floor(self.progress * 10994))
      }
    })

    return () => trigger.kill()
  }, [proxyRef])

  return (
    <div className="depth-gauge-wrapper" ref={wrapperRef}>
      <div className="depth-gauge-text">{depth}M</div>
      <div className="depth-gauge-track">
        <div className="depth-gauge-thumb" ref={thumbRef}>
          <div className="depth-gauge-glow" />
        </div>
      </div>
    </div>
  )
}

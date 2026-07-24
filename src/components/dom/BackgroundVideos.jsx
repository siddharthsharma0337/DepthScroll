import { useRef, useEffect } from 'react'
import useStore from '../../store/useStore'

/**
 * BackgroundVideos
 *
 * Renders 4 stacked, continuously looping <video> elements.
 * ALL 4 play from mount. Opacity crossfades are driven externally
 * by SceneManager via GSAP ScrollTrigger — NOT by this component.
 *
 * Exposes videoRefs upward via the onRefsReady callback.
 */
export default function BackgroundVideos({ onRefsReady }) {
  const v1 = useRef(null)
  const v2 = useRef(null)
  const v3 = useRef(null)
  const v4 = useRef(null)
  const setLoaded = useStore((s) => s.setLoaded)

  const scenes = [
    { ref: v1, src: '/videos/scene%201.mp4', initial: 1 },
    { ref: v2, src: '/videos/scene%202.mp4', initial: 0 },
    { ref: v3, src: '/videos/scene%203.mp4', initial: 0 },
    { ref: v4, src: '/videos/scene%204.mp4', initial: 0 },
  ]

  useEffect(() => {
    // Expose refs to parent (SceneManager) for GSAP targeting
    if (onRefsReady) onRefsReady([v1, v2, v3, v4])

    // Track how many videos are ready
    let readyCount = 0
    const total = scenes.length

    const handleReady = () => {
      readyCount++
      // Mark loaded once ALL videos can play
      if (readyCount >= total) setLoaded(true)
    }

    scenes.forEach(({ ref, initial }) => {
      const el = ref.current
      if (!el) return
      if (el.readyState >= 3) {
        handleReady()
      } else {
        el.addEventListener('canplaythrough', handleReady, { once: true })
      }
      // Force play (some browsers need explicit call after autoplay attr)
      if (initial > 0) {
        el.play().catch(() => {})
      } else {
        el.pause()
      }
    })

    // Safety fallback: dismiss loader after 8s no matter what
    const safetyTimer = setTimeout(() => setLoaded(true), 8000)

    return () => {
      clearTimeout(safetyTimer)
      scenes.forEach(({ ref }) => {
        ref.current?.removeEventListener('canplaythrough', handleReady)
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="video-layer">
      {scenes.map(({ ref, src, initial }, i) => (
        <video
          key={i}
          ref={ref}
          src={src}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          style={{ opacity: initial, willChange: 'opacity' }}
        />
      ))}
    </div>
  )
}

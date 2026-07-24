import { useRef, useEffect, useState } from 'react'
import useStore from '../../store/useStore'

/**
 * BackgroundVideos
 *
 * Renders 4 stacked, continuously looping <video> elements.
 * First video loads immediately to dismiss loader. 
 * Remaining videos lazy-load in the background to save initial bandwidth.
 *
 * Exposes videoRefs upward via the onRefsReady callback.
 */
export default function BackgroundVideos({ onRefsReady }) {
  const v1 = useRef(null)
  const v2 = useRef(null)
  const v3 = useRef(null)
  const v4 = useRef(null)
  const setLoaded = useStore((s) => s.setLoaded)
  const [loadOthers, setLoadOthers] = useState(false)

  const scenes = [
    { ref: v1, src: '/videos/scene%201.mp4', initial: 1 },
    { ref: v2, src: loadOthers ? '/videos/scene%202.mp4' : '', initial: 0 },
    { ref: v3, src: loadOthers ? '/videos/scene%203.mp4' : '', initial: 0 },
    { ref: v4, src: loadOthers ? '/videos/scene%204.mp4' : '', initial: 0 },
  ]

  useEffect(() => {
    // Expose refs to parent (SceneManager) for GSAP targeting
    if (onRefsReady) onRefsReady([v1, v2, v3, v4])

    const el = v1.current
    if (!el) return

    const handleReady = () => {
      setLoaded(true)
      setLoadOthers(true)
    }

    if (el.readyState >= 3) {
      handleReady()
    } else {
      el.addEventListener('canplaythrough', handleReady, { once: true })
    }

    // Force play first video
    el.play().catch(() => {})

    // Safety fallback: dismiss loader after 8s no matter what
    const safetyTimer = setTimeout(() => {
      setLoaded(true)
      setLoadOthers(true)
    }, 8000)

    return () => {
      clearTimeout(safetyTimer)
      el.removeEventListener('canplaythrough', handleReady)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When subsequent videos are loaded, make sure they are paused
  useEffect(() => {
    if (loadOthers) {
      v2.current?.pause()
      v3.current?.pause()
      v4.current?.pause()
    }
  }, [loadOthers])

  return (
    <div className="video-layer">
      {scenes.map(({ ref, src, initial }, i) => (
        <video
          key={i}
          ref={ref}
          src={src || undefined}
          muted
          loop
          playsInline
          autoPlay={initial > 0}
          preload={src ? "auto" : "none"}
          style={{ opacity: initial, willChange: 'opacity' }}
        />
      ))}
    </div>
  )
}

import { useRef, useCallback, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import BackgroundVideos from '../dom/BackgroundVideos'
import Canvas3D from '../canvas/Canvas3D'
import OverlayUI from '../dom/OverlayUI'
import VignetteOverlay from './VignetteOverlay'
import DepthGauge from '../dom/DepthGauge'
import TopNav from '../dom/TopNav'
import { useScrollProgress } from '../../hooks/useScrollProgress'
import useStore from '../../store/useStore'

gsap.registerPlugin(ScrollTrigger)

export default function SceneManager() {
  const proxyRef = useRef(null)
  const videoRefsRef = useRef([])
  const { progressRef, velocityRef } = useScrollProgress(proxyRef)
  const setCurrentScene = useStore((s) => s.setCurrentScene)

  const cleanupRef = useRef(null)

  // Receive video element refs from BackgroundVideos
  const handleVideoRefs = useCallback((refs) => {
    videoRefsRef.current = refs
    if (cleanupRef.current) cleanupRef.current()
    cleanupRef.current = setupVideoTimeline(refs, proxyRef, setCurrentScene)
  }, [setCurrentScene])

  useEffect(() => {
    return () => {
      if (cleanupRef.current) cleanupRef.current()
    }
  }, [])

  return (
    <>
      {/* Tall invisible scroll proxy — provides the scroll distance */}
      <div className="scroll-proxy" ref={proxyRef} />

      {/* Fixed viewport — the entire cinematic experience lives here */}
      <div className="fixed-viewport">
        {/* Top Navbar */}
        <TopNav />

        {/* Layer 0: Background videos */}
        <BackgroundVideos onRefsReady={handleVideoRefs} />

        {/* Layer 1: Vignette darkening */}
        <VignetteOverlay proxyRef={proxyRef} />

        {/* Layer 2: Three.js canvas — diver + lights + particles */}
        <Canvas3D
          progressRef={progressRef}
          velocityRef={velocityRef}
        />

        {/* Layer 3: Narrative text + UI */}
        <OverlayUI proxyRef={proxyRef} />

        {/* Layer 3.5: Depth Gauge (Custom Scrollbar) */}
        <DepthGauge proxyRef={proxyRef} />

        {/* Layer 4: Filmic grain */}
        <div className="grain-overlay" aria-hidden="true" />
      </div>
    </>
  )
}

/**
 * setupVideoTimeline
 *
 * Creates GSAP ScrollTrigger instances to crossfade the 4 video
 * elements. Called once when BackgroundVideos exposes its refs.
 *
 * Uses individual scrubbed triggers per crossfade window for
 * precise, independent control.
 */
function setupVideoTimeline(videoRefs, proxyRef, setCurrentScene) {
  if (!proxyRef.current || videoRefs.length < 4) return

  const [v1, v2, v3, v4] = videoRefs.map((r) => r.current)
  if (!v1 || !v2 || !v3 || !v4) return

  // Helper: convert progress ratio to ScrollTrigger start/end string
  const pct = (ratio) => `${ratio * 100}% top`

  const triggers = []

  // ── Scene 1 → 2 crossfade (0.22 → 0.34) ──
  triggers.push(
    ScrollTrigger.create({
      trigger: proxyRef.current,
      start: pct(0.22),
      end: pct(0.38),
      scrub: 1.2,
      onUpdate: (self) => {
        v1.style.opacity = 1 - self.progress
        v2.style.opacity = self.progress
      },
      onEnter: () => {
        v2.play().catch(() => {})
        setCurrentScene(2)
      },
      onLeave: () => {
        v1.pause()
        setCurrentScene(2)
      },
      onEnterBack: () => {
        v1.play().catch(() => {})
        setCurrentScene(1)
      },
      onLeaveBack: () => {
        v2.pause()
        setCurrentScene(1)
      },
    })
  )

  // ── Scene 2 → 3 crossfade (0.47 → 0.59) ──
  triggers.push(
    ScrollTrigger.create({
      trigger: proxyRef.current,
      start: pct(0.47),
      end: pct(0.59),
      scrub: 1.2,
      onUpdate: (self) => {
        v2.style.opacity = 1 - self.progress
        v3.style.opacity = self.progress
      },
      onEnter: () => {
        v3.play().catch(() => {})
        setCurrentScene(3)
      },
      onLeave: () => {
        v2.pause()
        setCurrentScene(3)
      },
      onEnterBack: () => {
        v2.play().catch(() => {})
        setCurrentScene(2)
      },
      onLeaveBack: () => {
        v3.pause()
        setCurrentScene(2)
      },
    })
  )

  // ── Scene 3 → 4 crossfade (0.72 → 0.84) ──
  triggers.push(
    ScrollTrigger.create({
      trigger: proxyRef.current,
      start: pct(0.72),
      end: pct(0.84),
      scrub: 1.2,
      onUpdate: (self) => {
        v3.style.opacity = 1 - self.progress
        v4.style.opacity = self.progress
      },
      onEnter: () => {
        v4.play().catch(() => {})
        setCurrentScene(4)
      },
      onLeave: () => {
        v3.pause()
        setCurrentScene(4)
      },
      onEnterBack: () => {
        v3.play().catch(() => {})
        setCurrentScene(3)
      },
      onLeaveBack: () => {
        v4.pause()
        setCurrentScene(3)
      },
    })
  )

  // ── Global Scroll Snapping ──
  // Snaps to the optimal viewing point of each scene (0%, 43%, 73%, 100%)
  triggers.push(
    ScrollTrigger.create({
      trigger: proxyRef.current,
      start: 'top top',
      end: 'bottom bottom',
      snap: {
        snapTo: [0, 0.43, 0.73, 1],
        duration: { min: 0.4, max: 1 },
        delay: 0.1, // wait 100ms after scrolling stops
        ease: 'power2.inOut',
      },
    })
  )

  return () => triggers.forEach((t) => t.kill())
}

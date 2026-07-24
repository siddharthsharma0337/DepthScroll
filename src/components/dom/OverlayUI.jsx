import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import useStore from '../../store/useStore'
import './OverlayUI.css'

gsap.registerPlugin(ScrollTrigger, SplitText)

export default function OverlayUI({ proxyRef }) {
  const scrollHintRef = useRef(null)

  // Scene Refs
  const scene1Ref = useRef(null)
  const scene2Ref = useRef(null)
  const scene3Ref = useRef(null)
  const scene4Ref = useRef(null)

  // Fine-grained element refs
  const heroTitleRef = useRef(null)
  const heroTaglineRef = useRef(null)
  const heroTitleWrapRef = useRef(null)
  const heroTaglineWrapRef = useRef(null)
  const card2Ref = useRef(null)
  const card2H2Ref = useRef(null)
  const card2PRef = useRef(null)
  const card2StatsRef = useRef(null)
  const card3Ref = useRef(null)
  const card3H2Ref = useRef(null)
  const card3PRef = useRef(null)
  const card3StatsRef = useRef(null)
  const finalSubRef = useRef(null)
  const finalPillsRef = useRef(null)
  const finalTitleRef = useRef(null)
  const finalCtaRef = useRef(null)
  const finalLabelRef = useRef(null)

  const lenis = useStore((s) => s.lenisRef)

  const handleBeginDescent = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight
    const currentY = window.scrollY
    const remaining = totalHeight - currentY
    const SPEED_PX_PER_SEC = 280
    const duration = remaining / SPEED_PX_PER_SEC

    if (lenis && remaining > 0) {
      lenis.scrollTo(totalHeight, {
        duration,
        easing: (t) => t,
      })
    } else if (remaining > 0) {
      window.scrollTo({ top: totalHeight, behavior: 'smooth' })
    }
  }

  const handleReturnToTop = () => {
    const currentY = window.scrollY
    const SPEED_PX_PER_SEC = 280
    const duration = currentY / SPEED_PX_PER_SEC

    if (lenis && currentY > 0) {
      lenis.scrollTo(0, {
        duration,
        easing: (t) => t, // linear — no ease-in/out, keeps speed constant
      })
    } else if (currentY > 0) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    if (!proxyRef?.current) return
    const triggers = []

    // ─────────────────────────────────────────────
    // SCENE 1 — Hero entrance (on load) + scroll-out
    // ─────────────────────────────────────────────

    // Entrance: fade + rise the whole hero block (synced with the loader sliding up)
    gsap.fromTo(heroTitleRef.current,
      { opacity: 0, y: 60 },
      { opacity: 1, y: 0, duration: 1.4, ease: 'expo.out', delay: 1.6 }
    )
    gsap.fromTo(heroTaglineRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'expo.out', delay: 1.8 }
    )

    // Scroll-out: whole scene fades and rises away
    const t1 = gsap.timeline({
      scrollTrigger: {
        trigger: proxyRef.current,
        start: '3% top',
        end: '22% top',
        scrub: 1.5,
      },
    })
    t1
      .to(heroTitleWrapRef.current, { opacity: 0, y: -80, ease: 'expo.in', duration: 1 })
      .to(heroTaglineWrapRef.current, { opacity: 0, y: -60, ease: 'expo.in', duration: 1 }, '<')
      .to(scene1Ref.current, { opacity: 0, duration: 0.15 }, 0.85)
    triggers.push(t1.scrollTrigger)

    // ─────────────────────────────────────────────
    // SCENE 2 — Twilight card (right)
    // ─────────────────────────────────────────────
    gsap.set(scene2Ref.current, { opacity: 0 })
    gsap.set(card2Ref.current, { x: 80, opacity: 0 })

    // split the h2 into lines for stagger
    const split2 = new SplitText(card2H2Ref.current, { type: 'lines' })
    const split2P = new SplitText(card2PRef.current, { type: 'lines' })
    gsap.set(split2.lines, { yPercent: 100, opacity: 0 })
    gsap.set(split2P.lines, { yPercent: 100, opacity: 0 })
    const stats2 = card2StatsRef.current.querySelectorAll('.stat')
    gsap.set(stats2, { opacity: 0, y: 20 })

    const t2 = gsap.timeline({
      scrollTrigger: {
        trigger: proxyRef.current,
        start: '25% top',
        end: '47% top',
        scrub: 1.5,
      },
    })
    t2
      .to(scene2Ref.current, { opacity: 1, duration: 0.05 })
      .to(card2Ref.current, { x: 0, opacity: 1, ease: 'expo.out', duration: 0.3 }, '<')
      .to(split2.lines, { yPercent: 0, opacity: 1, stagger: 0.04, ease: 'expo.out', duration: 0.25 }, 0.15)
      .to(split2P.lines, { yPercent: 0, opacity: 1, stagger: 0.02, ease: 'expo.out', duration: 0.25 }, 0.2)
      .to(stats2, { opacity: 1, y: 0, stagger: 0.04, ease: 'expo.out', duration: 0.25 }, 0.25)
      // -- Fully visible plateau between 0.6s and 1.0s --
      .to(card2Ref.current, { x: -80, opacity: 0, ease: 'expo.in', duration: 0.3 }, 1.0)
      .to(scene2Ref.current, { opacity: 0, duration: 0.1 }, 1.25)
    triggers.push(t2.scrollTrigger)

    // ─────────────────────────────────────────────
    // SCENE 3 — Midnight card (left)
    // ─────────────────────────────────────────────
    gsap.set(scene3Ref.current, { opacity: 0 })
    gsap.set(card3Ref.current, { x: -80, opacity: 0 })

    const split3 = new SplitText(card3H2Ref.current, { type: 'lines' })
    const split3P = new SplitText(card3PRef.current, { type: 'lines' })
    gsap.set(split3.lines, { yPercent: 100, opacity: 0 })
    gsap.set(split3P.lines, { yPercent: 100, opacity: 0 })
    const stats3 = card3StatsRef.current.querySelectorAll('.stat')
    gsap.set(stats3, { opacity: 0, y: 20 })

    const t3 = gsap.timeline({
      scrollTrigger: {
        trigger: proxyRef.current,
        start: '52% top',
        end: '74% top',
        scrub: 1.5,
      },
    })
    t3
      .to(scene3Ref.current, { opacity: 1, duration: 0.05 })
      .to(card3Ref.current, { x: 0, opacity: 1, ease: 'expo.out', duration: 0.3 }, '<')
      .to(split3.lines, { yPercent: 0, opacity: 1, stagger: 0.04, ease: 'expo.out', duration: 0.25 }, 0.15)
      .to(split3P.lines, { yPercent: 0, opacity: 1, stagger: 0.02, ease: 'expo.out', duration: 0.25 }, 0.2)
      .to(stats3, { opacity: 1, y: 0, stagger: 0.04, ease: 'expo.out', duration: 0.25 }, 0.25)
      // -- Fully visible plateau between 0.6s and 1.0s --
      .to(card3Ref.current, { x: 80, opacity: 0, ease: 'expo.in', duration: 0.3 }, 1.0)
      .to(scene3Ref.current, { opacity: 0, duration: 0.1 }, 1.25)
    triggers.push(t3.scrollTrigger)

    // ─────────────────────────────────────────────
    // SCENE 4 — Abyss finale (Premium Redesign)
    // ─────────────────────────────────────────────
    gsap.set(scene4Ref.current, { opacity: 0 })
    gsap.set(finalTitleRef.current, { opacity: 0, y: 60 })
    gsap.set(finalCtaRef.current, { opacity: 0, scale: 0.88 })
    gsap.set(finalSubRef.current, { opacity: 0, x: -40 })
    gsap.set(finalPillsRef.current, { opacity: 0, x: 40 })

    const t4 = gsap.timeline({
      scrollTrigger: {
        trigger: proxyRef.current,
        start: '78% top',
        end: 'bottom bottom',
        scrub: 1.5,
      },
    })
    t4
      .to(scene4Ref.current, { opacity: 1, ease: 'power4.out', duration: 0.2 })
      .to(finalTitleRef.current, { opacity: 1, y: 0, ease: 'expo.out', duration: 0.45 })
      .to(finalCtaRef.current, { opacity: 1, scale: 1, ease: 'back.out(2)', duration: 0.3 }, '-=0.2')
      .to(finalSubRef.current, { opacity: 1, x: 0, ease: 'expo.out', duration: 0.4 }, '-=0.2')
      .to(finalPillsRef.current, { opacity: 1, x: 0, ease: 'expo.out', duration: 0.4 }, '<')
    triggers.push(t4.scrollTrigger)

    // ─────────────────────────────────────────────
    // SCROLL HINT (0–5%)
    // ─────────────────────────────────────────────
    gsap.to(scrollHintRef.current, { opacity: 1, duration: 1.5, delay: 0.8, ease: 'expo.inOut' })

    const tHint = gsap.timeline({
      scrollTrigger: {
        trigger: proxyRef.current,
        start: 'top top',
        end: '5% top',
        scrub: true,
      }
    })
    tHint.to(scrollHintRef.current, { autoAlpha: 0 })
    triggers.push(tHint.scrollTrigger)

    // ─────────────────────────────────────────────
    // MAGNETIC BUTTON PHYSICS
    // ─────────────────────────────────────────────
    const magneticElements = document.querySelectorAll('.magnetic')
    const handleMagneticMove = (e) => {
      const el = e.currentTarget
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2
      gsap.to(el, { x: x * 0.4, y: y * 0.4, duration: 0.3, ease: 'power4.out', overwrite: 'auto' })
    }
    const handleMagneticLeave = (e) => {
      const el = e.currentTarget
      gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1.2, 0.4)', overwrite: 'auto' })
    }
    
    magneticElements.forEach(el => {
      el.addEventListener('mousemove', handleMagneticMove)
      el.addEventListener('mouseleave', handleMagneticLeave)
    })

    return () => {
      triggers.forEach((t) => t?.kill())
      split2.revert()
      split2P.revert()
      split3.revert()
      split3P.revert()
      magneticElements.forEach(el => {
        el.removeEventListener('mousemove', handleMagneticMove)
        el.removeEventListener('mouseleave', handleMagneticLeave)
      })
    }
  }, [proxyRef])

  return (
    <>
      <div className="overlay-container">

        {/* ── SCENE 1: The Surface ── */}
        <div className="scene-section scene-1" ref={scene1Ref}>
          <div className="scene1-content">
            <div ref={heroTitleWrapRef}>
              <h1 className="hero-title" ref={heroTitleRef}>
                The Ocean<br />
                <i>Is Calling.</i>
              </h1>
            </div>
            <div ref={heroTaglineWrapRef}>
              <p className="hero-tagline" ref={heroTaglineRef}>
                200,000 species. One descent. Infinite wonder.
              </p>
            </div>
          </div>
        </div>

        {/* ── SCENE 2: Twilight (card right) ── */}
        <div className="scene-section scene-2" ref={scene2Ref}>
          <div className="glass-card scene2-card" ref={card2Ref}>
            <h2 ref={card2H2Ref}>
              The Light Fades.<br />
              <i>The Pressure Builds.</i>
            </h2>
            <p ref={card2PRef}>
              As you leave the surface behind, vibrant blues surrender to the twilight.
              Here, the ocean guards its secrets in silence. Only the brave venture deeper.
            </p>
            <div className="card-stats" ref={card2StatsRef}>
              <div className="stat"><span className="stat-num">4727 m</span><span className="stat-lbl">Depth</span></div>
              <div className="stat"><span className="stat-num">1°C</span><span className="stat-lbl">Temperature</span></div>
              <div className="stat"><span className="stat-num">20×</span><span className="stat-lbl">Pressure</span></div>
            </div>
          </div>
        </div>

        {/* ── SCENE 3: Midnight (card left) ── */}
        <div className="scene-section scene-3" ref={scene3Ref}>
          <div className="glass-card scene3-card" ref={card3Ref}>
            <h2 ref={card3H2Ref}>
              Beyond The Sun.<br />
              <i>The Abyss Remains.</i>
            </h2>
            <p ref={card3PRef}>
              In the midnight zone, no sunlight penetrates. Only bioluminescence guides
              the way through this silent, crushing expanse of living darkness.
            </p>
            <div className="card-stats" ref={card3StatsRef}>
              <div className="stat"><span className="stat-num">8026 m</span><span className="stat-lbl">Depth</span></div>
              <div className="stat"><span className="stat-num">-2°C</span><span className="stat-lbl">Temperature</span></div>
              <div className="stat"><span className="stat-num">100×</span><span className="stat-lbl">Pressure</span></div>
            </div>
          </div>
        </div>

        {/* ── SCENE 4: The Abyss (Premium Redesign) ── */}
        <div className="scene-section scene-4" ref={scene4Ref}>
          <div className="finale-content">

            {/* Center: Title and Button */}
            <div className="finale-center">
              <div className="final-cta-title" ref={finalTitleRef}>
                <div className="finale-eyebrow">YOU HAVE REACHED</div>
                <h2 className="finale-headline"><i>The Edge</i><br/>Of The World.</h2>
              </div>
              <div className="finale-btn-wrapper" ref={finalCtaRef}>
                <button className="finale-btn magnetic" onClick={handleReturnToTop}>
                  <span className="btn-text">Return To Surface ↑</span>
                </button>
              </div>
            </div>

            {/* Bottom Left HUD: Descriptor */}
            <div className="finale-hud-left" ref={finalSubRef}>
              <p className="finale-descriptor">
                Only 12 humans have stood here. In total darkness, under 1,100 atmospheres
                of pressure — where life finds a way against all odds.
              </p>
            </div>

            {/* Bottom Right HUD: Data Telemetry */}
            <div className="finale-hud-right" ref={finalPillsRef}>
              <div className="telemetry-list">
                <div className="telemetry-item"><span className="tel-val">10,994 m</span><span className="tel-lbl">Depth</span></div>
                <div className="telemetry-item"><span className="tel-val">1°C</span><span className="tel-lbl">Water Temp</span></div>
                <div className="telemetry-item"><span className="tel-val">1,100 atm</span><span className="tel-lbl">Pressure</span></div>
                <div className="telemetry-item"><span className="tel-val">Zero</span><span className="tel-lbl">Sunlight</span></div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ── Scroll Hint / Begin Descent ── */}
      <button className="scroll-hint magnetic" ref={scrollHintRef} style={{ opacity: 0 }} onClick={handleBeginDescent}>
        <span className="scroll-hint__label">Begin Descent <span className="arrow-down">↓</span></span>
      </button>
    </>
  )
}

# Cinematic Loader Implementation Guide

This guide details how to implement the cinematic loader screen found in this project. It features a sleek, dark aesthetic, a vertical gauge, a series of staggered loading dots, and GSAP-powered animations for entry and exit.

## Prerequisites

- **React**: For building the component.
- **GSAP**: For complex, timeline-based animations.
- **Global State Management**: A state manager like Zustand (or React Context) to manage the global `isLoaded` boolean state, which triggers the exit animation.

Install GSAP if you haven't already:
```bash
npm install gsap
```

## 1. The React Component (`Loader.jsx`)

The loader component is broken down into a few visual elements:
- **Title and Subtitle**: Sets the mood and context.
- **Vertical Gauge**: A 1px wide line that fills up from the bottom.
- **Loading Dots**: 8 dots that stagger in opacity to represent loading progress.
- **Hint Text**: A pulsing text indicating the loading state.

It uses two `useEffect` hooks:
1. One for the **initial loading animation** (bringing the gauge up to 72% and staggering the dots).
2. Another that reacts to the `isLoaded` state, finishing the gauge fill (to 100%) and animating the loader completely off-screen.

```jsx
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
// Replace with your actual state management hook
import useStore from '../../store/useStore'

export default function Loader() {
  const isLoaded  = useStore((s) => s.isLoaded)
  const loaderRef = useRef(null)
  const fillRef   = useRef(null)
  const dotsRef   = useRef([])

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
    if (!isLoaded) return

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
  }, [isLoaded])

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
```

## 2. CSS Styling (`index.css`)

The loader relies on dark, cinematic styling, utilizing absolute positioning to cover the screen.

```css
/* Loader Container */
.loader {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: #020508;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  will-change: opacity, transform;
}

/* Typography */
.loader__title {
  font-family: 'Playfair Display', Georgia, serif;
  font-style: italic;
  font-size: clamp(2rem, 5.5vw, 4rem);
  font-weight: 300;
  letter-spacing: 0.18em;
  color: rgba(168, 216, 240, 0.9);
}

.loader__subtitle {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.6rem;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.22);
  margin-top: -1rem;
}

/* Vertical Gauge */
.loader__gauge {
  width: 1px;
  height: 80px;
  background: rgba(255, 255, 255, 0.06);
  position: relative;
  overflow: hidden;
}

.loader__gauge-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0%;
  background: linear-gradient(to bottom, rgba(168,216,240,0.8), rgba(26,74,122,0.6));
}

/* Dots */
.loader__dots {
  display: flex;
  gap: 0.65rem;
  align-items: center;
}

.loader__dot {
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  will-change: opacity, transform;
}

/* Hint Text with pure CSS pulsing animation */
.loader__hint {
  font-family: 'Inter', system-ui, sans-serif;
  font-size: 0.55rem;
  letter-spacing: 0.4em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.18);
  animation: hint-pulse 2.2s ease-in-out infinite;
}

@keyframes hint-pulse {
  0%, 100% { opacity: 0.18; }
  50%       { opacity: 0.5; }
}

/* Reduced Motion Consideration */
@media (prefers-reduced-motion: reduce) {
  .loader__hint {
    animation: none;
    opacity: 0.4;
  }
}
```

## 3. Global Texture (Optional)

To achieve the cinematic filmic grain over the entire screen (including the loader), an SVG noise filter is applied globally via a `.grain-overlay` class:

```css
.grain-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  pointer-events: none;
  opacity: 0.045;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
  mix-blend-mode: overlay;
}
```

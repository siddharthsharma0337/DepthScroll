import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import './CustomCursor.css'

/**
 * CustomCursor
 * 
 * An ocean-themed custom cursor featuring a solid inner dot 
 * and a larger, glowing, delayed bubble outline.
 */
export default function CustomCursor() {
  const cursorDotRef = useRef(null)
  const cursorOutlineRef = useRef(null)

  useEffect(() => {
    // Hide default cursor initially
    document.body.style.cursor = 'none'

    const onMouseMove = (e) => {
      const { clientX, clientY } = e

      // Instant inner dot movement
      gsap.to(cursorDotRef.current, {
        x: clientX,
        y: clientY,
        duration: 0,
      })

      // Delayed fluid outline movement
      gsap.to(cursorOutlineRef.current, {
        x: clientX,
        y: clientY,
        duration: 0.8,
        ease: 'power3.out',
      })
    }

    // Set initial position
    gsap.set(cursorDotRef.current, { xPercent: -50, yPercent: -50 })
    gsap.set(cursorOutlineRef.current, { xPercent: -50, yPercent: -50 })

    window.addEventListener('mousemove', onMouseMove)
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      document.body.style.cursor = 'auto'
    }
  }, [])

  return (
    <>
      <div ref={cursorDotRef} className="custom-cursor-dot" />
      <div ref={cursorOutlineRef} className="custom-cursor-outline" />
    </>
  )
}

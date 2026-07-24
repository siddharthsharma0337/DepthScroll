import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import './CustomCursor.css'

/**
 * CustomCursor
 * 
 * Premium ocean cursor with interactive hover states.
 */
export default function CustomCursor() {
  const cursorDotRef = useRef(null)
  const cursorOutlineRef = useRef(null)

  useEffect(() => {
    document.body.style.cursor = 'none'

    let isHovering = false

    const onMouseMove = (e) => {
      const { clientX, clientY } = e
      const target = e.target.closest('button:not(.no-magnetic), a:not(.no-magnetic), .magnetic')
      
      if (target) {
        if (!isHovering) {
          isHovering = true
          gsap.to(cursorDotRef.current, { scale: 0, opacity: 0, duration: 0.3, ease: 'power4.out' })
          gsap.to(cursorOutlineRef.current, { 
            scale: 2, 
            backgroundColor: 'rgba(255, 255, 255, 0)', 
            borderColor: 'rgba(255, 255, 255, 0.6)', 
            duration: 0.4, 
            ease: 'expo.out' 
          })
        }
      } else {
        if (isHovering) {
          isHovering = false
          gsap.to(cursorDotRef.current, { scale: 1, opacity: 1, duration: 0.3, ease: 'power4.out' })
          gsap.to(cursorOutlineRef.current, { 
            scale: 1, 
            backgroundColor: 'rgba(0, 200, 255, 0)', 
            borderColor: 'rgba(0, 255, 255, 0.6)', 
            duration: 0.4, 
            ease: 'expo.out' 
          })
        }
      }

      gsap.to(cursorDotRef.current, {
        x: clientX,
        y: clientY,
        duration: 0,
      })

      gsap.to(cursorOutlineRef.current, {
        x: clientX,
        y: clientY,
        duration: isHovering ? 0.15 : 0.8,
        ease: isHovering ? 'power2.out' : 'power3.out',
      })
    }

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

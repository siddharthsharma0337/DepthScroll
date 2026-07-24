import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function useMagnetic(options = {}) {
  const { 
    strength = 0.5,    // How far it moves
    pullRadius = 100,  // Distance at which magnetic effect starts
    ease = "power4.out",
    duration = 0.8
  } = options

  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Since the main canvas takes over pointer events in some areas,
    // we attach the listener to the window but check distance to element bounds
    const handleMouseMove = (e) => {
      const rect = el.getBoundingClientRect()
      
      // Calculate center of element
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      // Calculate distance from mouse to center
      const distX = e.clientX - centerX
      const distY = e.clientY - centerY
      const dist = Math.sqrt(distX * distX + distY * distY)

      if (dist < pullRadius) {
        // Apply magnetic pull
        gsap.to(el, {
          x: distX * strength,
          y: distY * strength,
          duration: duration,
          ease: ease
        })
      } else {
        // Reset position
        gsap.to(el, {
          x: 0,
          y: 0,
          duration: duration,
          ease: "elastic.out(1, 0.3)"
        })
      }
    }

    const handleMouseLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: duration,
        ease: "elastic.out(1, 0.3)"
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    // On mouse leave the window entirely
    window.addEventListener('mouseout', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseout', handleMouseLeave)
      // Kill tweens on unmount
      gsap.killTweensOf(el)
    }
  }, [strength, pullRadius, ease, duration])

  return ref
}

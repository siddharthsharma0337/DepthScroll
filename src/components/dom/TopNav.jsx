import { useEffect } from 'react'
import { gsap } from 'gsap'
import useStore from '../../store/useStore'
import './TopNav.css'

export default function TopNav() {
  const currentScene = useStore((s) => s.currentScene)
  const lenisRef = useStore((s) => s.lenisRef)

  const handleNavClick = (e, progress) => {
    e.preventDefault()
    if (lenisRef) {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      lenisRef.scrollTo(maxScroll * progress, { duration: 1.5 })
    }
  }

  useEffect(() => {
    gsap.fromTo('.topnav-brand, .topnav-links a, .topnav-cta', 
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: 'expo.out', delay: 2.2 }
    )
  }, [])

  return (
    <>
      <div className={`topnav-center ${currentScene > 1 ? 'dark-theme' : ''}`}>
        <div className="topnav-brand magnetic">
          <svg 
            className="topnav-logo-icon" 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <circle cx="12" cy="5" r="3"></circle>
            <line x1="12" y1="22" x2="12" y2="8"></line>
            <path d="M5 12H2a10 10 0 0 0 20 0h-3"></path>
          </svg>
          DEPTHSCROLL
        </div>
        <div className="topnav-links">
          <a href="#scene1" onClick={(e) => handleNavClick(e, 0)} className="magnetic">SURFACE</a>
          <a href="#scene2" onClick={(e) => handleNavClick(e, 0.43)} className="magnetic">TWILIGHT</a>
          <a href="#scene3" onClick={(e) => handleNavClick(e, 0.73)} className="magnetic">MIDNIGHT</a>
          <a href="#scene4" onClick={(e) => handleNavClick(e, 1)} className="magnetic">ABYSS</a>
        </div>
        <button className="topnav-cta magnetic" onClick={() => window.location.href = 'mailto:siddharthsharma0337@gmail.com'}>BOOK EXPEDITION</button>
      </div>
    </>
  )
}

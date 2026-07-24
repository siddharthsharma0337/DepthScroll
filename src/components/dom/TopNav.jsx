import { useEffect } from 'react'
import { gsap } from 'gsap'
import useStore from '../../store/useStore'
import './TopNav.css'

export default function TopNav() {
  const currentScene = useStore((s) => s.currentScene)

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
          <a href="#expeditions" className="magnetic">EXPEDITIONS</a>
          <a href="#membership" className="magnetic">MEMBERSHIP</a>
          <a href="#research" className="magnetic">RESEARCH</a>
          <a href="#logbook" className="magnetic">LOGBOOK</a>
        </div>
        <button className="topnav-cta magnetic">BOOK EXPEDITION</button>
      </div>
    </>
  )
}

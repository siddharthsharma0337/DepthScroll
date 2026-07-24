import useStore from '../../store/useStore'
import './TopNav.css'

export default function TopNav() {
  const currentScene = useStore((s) => s.currentScene)

  return (
    <>
      <div className={`topnav-center ${currentScene > 1 ? 'dark-theme' : ''}`}>
        <div className="topnav-brand">
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
          <a href="#expeditions">EXPEDITIONS</a>
          <a href="#membership">MEMBERSHIP</a>
          <a href="#research">RESEARCH</a>
          <a href="#logbook">LOGBOOK</a>
        </div>
        <button className="topnav-cta">BOOK EXPEDITION</button>
      </div>
    </>
  )
}

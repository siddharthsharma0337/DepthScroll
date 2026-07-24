import { useEffect, useState } from 'react'
import { useLenis } from './hooks/useLenis'
import SceneManager from './components/layout/SceneManager'
import Loader from './components/dom/Loader'
import CustomCursor from './components/dom/CustomCursor'
import RippleTrail from './components/dom/RippleTrail'
import StaggeredMenu from './components/StaggeredMenu'

/**
 * App
 *
 * Root component. Initialises Lenis smooth scroll
 * and renders the two top-level layers:
 *  1. Loader overlay (fades out once assets are ready)
 *  2. SceneManager (the full cinematic experience)
 */
export default function App() {
  useLenis()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Prevent default scroll restoration on refresh
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }
    // Always start at the top
    window.scrollTo(0, 0)
  }, [])

  return (
    <>
      <CustomCursor />
      <RippleTrail />
      <Loader />
      <SceneManager />
      <StaggeredMenu isOpen={isMenuOpen} onToggle={() => setIsMenuOpen(!isMenuOpen)} />
    </>
  )
}

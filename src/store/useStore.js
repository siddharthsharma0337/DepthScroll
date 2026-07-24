import { create } from 'zustand'

/**
 * Global store for DEPTHSCROLL.
 *
 * CRITICAL: scrollProgress is stored here only for initial reads.
 * Hot-path updates (per-frame) are done via refs, NOT by calling
 * setScrollProgress, to avoid React re-render cascades.
 */
const useStore = create((set) => ({
  // Loading
  isLoaded: false,
  setLoaded: (val) => set({ isLoaded: val }),

  // Scroll (written once by SceneManager, read by Canvas via ref)
  scrollProgress: 0,
  setScrollProgress: (val) => set({ scrollProgress: val }),

  // Current scene (integer 1–4), used for targeted UI updates
  currentScene: 1,
  setCurrentScene: (val) => set({ currentScene: val }),

  // Lenis instance reference
  lenisRef: null,
  setLenisRef: (ref) => set({ lenisRef: ref }),
}))

export default useStore

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * OceanLights
 *
 * All lights respond to scrollProgress per-frame via useFrame.
 * No React state involved — purely imperative Three.js mutations.
 *
 * Scene 1 (0.00–0.25): Strong directional sunlight, blueish-white
 * Scene 2 (0.25–0.50): Sunlight fades, ambient drops, subtle point light
 * Scene 3 (0.50–0.75): Only bioluminescent point lights, deep blue
 * Scene 4 (0.75–1.00): Near black, single eerie rim spotlight
 */
export default function OceanLights({ progressRef }) {
  const dirLightRef  = useRef(null)
  const ambientRef   = useRef(null)
  const pointRef     = useRef(null)
  const rimRef       = useRef(null)

  // Colour objects (reused each frame — no allocations)
  const sunColor  = new THREE.Color('#a8d8f0')
  const midColor  = new THREE.Color('#1a4a7a')
  const deepColor = new THREE.Color('#0d2a52')
  const rimColor  = new THREE.Color('#0a1a40')
  const tmpColor  = new THREE.Color()

  useFrame(() => {
    const p = progressRef?.current ?? 0

    /* ---- Directional (Sun) ---- */
    if (dirLightRef.current) {
      // Intensity: 3.0 at surface → 0.0 by scene 2 midpoint
      const dirIntensity = THREE.MathUtils.clamp(
        THREE.MathUtils.mapLinear(p, 0, 0.45, 3.0, 0.0),
        0, 3
      )
      dirLightRef.current.intensity = THREE.MathUtils.lerp(dirLightRef.current.intensity, dirIntensity, 0.05)
      tmpColor.lerpColors(sunColor, midColor, Math.min(p / 0.45, 1))
      dirLightRef.current.color.lerp(tmpColor, 0.05)
    }

    /* ---- Ambient ---- */
    if (ambientRef.current) {
      // 0.55 → 0.04
      const ambIntensity = THREE.MathUtils.clamp(
        THREE.MathUtils.mapLinear(p, 0, 1, 0.55, 0.04),
        0.04, 0.55
      )
      ambientRef.current.intensity = THREE.MathUtils.lerp(ambientRef.current.intensity, ambIntensity, 0.05)
    }

    /* ---- Bioluminescent Point ---- */
    if (pointRef.current) {
      // Fades in scene 2, peaks scene 3, fades in scene 4
      let ptIntensity = 0
      if (p > 0.25 && p < 0.85) {
        ptIntensity = THREE.MathUtils.clamp(
          THREE.MathUtils.mapLinear(p, 0.25, 0.45, 0, 1.2),
          0, 1.2
        )
        if (p > 0.7) {
          ptIntensity = THREE.MathUtils.mapLinear(p, 0.7, 0.85, 1.2, 0)
        }
      }
      pointRef.current.intensity = THREE.MathUtils.lerp(pointRef.current.intensity, ptIntensity, 0.05)
      tmpColor.lerpColors(midColor, deepColor, Math.max(0, (p - 0.25) / 0.5))
      pointRef.current.color.lerp(tmpColor, 0.05)
    }

    /* ---- Rim Spotlight (Abyss) ---- */
    if (rimRef.current) {
      const rmIntensity = THREE.MathUtils.clamp(
        THREE.MathUtils.mapLinear(p, 0.72, 0.88, 0, 0.45),
        0, 0.45
      )
      rimRef.current.intensity = THREE.MathUtils.lerp(rimRef.current.intensity, rmIntensity, 0.05)
    }
  })

  return (
    <>
      {/* Sunlight from above */}
      <directionalLight
        ref={dirLightRef}
        position={[2, 10, 5]}
        intensity={3.0}
        color="#a8d8f0"
        castShadow={false}
      />

      {/* Global fill */}
      <ambientLight ref={ambientRef} intensity={0.55} />

      {/* Bioluminescent side fill */}
      <pointLight
        ref={pointRef}
        position={[3, 1, 2]}
        intensity={0}
        color="#1a4a7a"
        distance={12}
        decay={2}
      />

      {/* Eerie rim light for abyss silhouette */}
      <spotLight
        ref={rimRef}
        position={[-4, 0, -3]}
        target-position={[0, 0, 0]}
        intensity={0}
        color="#0a1a40"
        angle={0.5}
        penumbra={0.8}
        distance={14}
        decay={2}
      />
    </>
  )
}

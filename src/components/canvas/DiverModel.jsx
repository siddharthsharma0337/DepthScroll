import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import useStore from '../../store/useStore'

// Preload the model
useGLTF.preload('/models/animated_model.glb')

/**
 * DiverModel
 *
 * Loads animated_model.glb, plays the first animation clip on loop,
 * and applies a continuous sine-wave drift simulating ocean current.
 *
 * Scroll progress subtly increases Z-tilt for a deeper descent feel.
 */
export default function DiverModel({ progressRef }) {
  const groupRef = useRef(null)
  const { scene, animations } = useGLTF('/models/animated_model.glb')
  const { actions, names } = useAnimations(animations, groupRef)
  const currentScene = useStore((s) => s.currentScene)

  // Start the first available animation on mount
  useEffect(() => {
    if (names.length > 0) {
      const action = actions[names[0]]
      if (action) {
        action.reset().fadeIn(0.5).play()
        action.setLoop(THREE.LoopRepeat, Infinity)
        action.clampWhenFinished = false
      }
    }
  }, [actions, names])

  useFrame(({ clock, pointer }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    const p = progressRef?.current ?? 0

    // Ambient drift — slow sine float simulating water current
    const baseY = Math.sin(t * 0.5) * 0.06
    const baseRotY = Math.sin(t * 0.28) * 0.07
    const baseRotZ = Math.sin(t * 0.19) * 0.025

    // Calculate scene offset smoothly based on scroll progress
    // This perfectly matches the video crossfade points in SceneManager
    let sceneOffsetX = 0
    if (p < 0.22) {
      sceneOffsetX = 1.7
    } else if (p < 0.34) {
      sceneOffsetX = THREE.MathUtils.mapLinear(p, 0.22, 0.34, 1.7, -1.7)
    } else if (p < 0.47) {
      sceneOffsetX = -1.7
    } else if (p < 0.59) {
      sceneOffsetX = THREE.MathUtils.mapLinear(p, 0.47, 0.59, -1.7, 1.7)
    } else if (p < 0.72) {
      sceneOffsetX = 1.7
    } else if (p < 0.84) {
      sceneOffsetX = THREE.MathUtils.mapLinear(p, 0.72, 0.84, 1.7, -1.7)
    } else {
      sceneOffsetX = -1.7
    }

    // Make model look at mouse based on where model is (relative tracking)
    const relativePointerX = pointer.x - (sceneOffsetX * 0.3)

    // Pointer interaction targets
    const targetPosX = sceneOffsetX + pointer.x * 0.5
    const targetPosY = baseY + pointer.y * 0.5 - 0.3 //ofet to move the model lower
    const targetRotY = baseRotY + relativePointerX * 0.8
    const targetRotZ = baseRotZ - relativePointerX * 0.3

    // Apply smoothed position and rotation via lerp
    groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, targetPosX, 0.05)
    groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetPosY, 0.05)
    
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05)
    groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetRotZ, 0.05)

    // Scroll-driven: slight forward tilt as depth increases, combined with pointer tilt
    const targetTiltX = THREE.MathUtils.mapLinear(p, 0, 1, 0, -0.12)
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetTiltX - pointer.y * 0.3,
      0.05
    )
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <primitive object={scene} />
    </group>
  )
}

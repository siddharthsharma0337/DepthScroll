import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

useGLTF.preload('/models/shark.glb')

export default function SharkModel({ progressRef }) {
  const groupRef = useRef(null)
  const { scene, animations } = useGLTF('/models/shark.glb')
  const { actions, names } = useAnimations(animations, groupRef)

  useEffect(() => {
    if (names.length > 0) {
      const action = actions[names[0]]
      if (action) {
        action.reset().fadeIn(0.5).play()
        action.setLoop(THREE.LoopRepeat, Infinity)
      }
    }
  }, [actions, names])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const p = progressRef?.current ?? 0
    const t = clock.elapsedTime * 0.15
    
    // Deep figure-8 swimming pattern to emphasize towards/away movement, but drifted to be unpredictable!
    const speed = t * 1.2
    const x = Math.sin(speed) * 4 + Math.sin(speed * 1.37) * 1.5
    const z = Math.sin(speed * 1.93) * 8 - 10
    
    // Dynamic scale naturally linked to Z position (-18 to -2 maps to 0.1 to 0.5)
    const depthScale = 0.5 + (z + 2) * 0.025

    const start = 0.25
    const end = 0.5
    
    let targetY = 0
    let targetScale = depthScale
    let isVisible = true

    if (p < start) {
      targetY = -20 // Below screen
      targetScale = 0
      if (groupRef.current.userData.baseY < -19) isVisible = false
    } else if (p > end) {
      targetY = 20 // Above screen
      targetScale = 0
      if (groupRef.current.userData.baseY > 19) isVisible = false
    }

    if (groupRef.current.userData.baseY === undefined) groupRef.current.userData.baseY = -20
    groupRef.current.userData.baseY = THREE.MathUtils.lerp(groupRef.current.userData.baseY, targetY, 0.05)
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.05))
    groupRef.current.visible = isVisible

    // Very slight up/down bobbing
    const y = groupRef.current.userData.baseY + Math.sin(t * 2.3) * 0.05

    groupRef.current.position.set(x, y, z)
    
    // Calculate precise derivative for perfectly synced rotation
    const dx = (Math.cos(speed) * 4 + Math.cos(speed * 1.37) * 1.37 * 1.5) * 1.2
    const dz = (Math.cos(speed * 1.93) * 1.93 * 8) * 1.2
    
    // Shifted by opposite 90 degrees (from PI to 0) to fix backwards swimming!
    const targetAngle = Math.atan2(dx, dz)
    
    // Smoothly rotate without 360-degree spins
    let diff = targetAngle - groupRef.current.rotation.y
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    groupRef.current.rotation.y += diff * 0.1
  })

  return (
    <group ref={groupRef} position={[0, -15, -8]} scale={0}>
      <primitive object={scene} />
    </group>
  )
}

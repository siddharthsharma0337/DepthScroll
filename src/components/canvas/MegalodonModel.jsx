import { useGLTF, useAnimations } from '@react-three/drei'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function MegalodonModel({ progressRef }) {
  const groupRef = useRef()
  const { scene, animations } = useGLTF('/models/megalodon.glb')
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
    const t = clock.elapsedTime * 0.05 // Very slow speed!
    
    // Massive, slow, sweeping figure-8
    const speed = t * 0.8
    const x = Math.sin(speed) * 8 + Math.sin(speed * 1.2) * 2
    const z = Math.sin(speed * 1.5) * 15 - 15
    
    // HUGE scale (megalodon)
    const depthScale = 1.0 + (z + 5) * 0.05

    const start = 0.5
    const end = 1.0
    
    let targetY = -3
    let targetScale = depthScale
    let isVisible = true

    if (p < start) {
      targetY = -30
      targetScale = 0
      if (groupRef.current.userData.baseY < -29) isVisible = false
    } else if (p > end) {
      targetY = 30
      targetScale = 0
      if (groupRef.current.userData.baseY > 29) isVisible = false
    }

    if (groupRef.current.userData.baseY === undefined) groupRef.current.userData.baseY = -30
    groupRef.current.userData.baseY = THREE.MathUtils.lerp(groupRef.current.userData.baseY, targetY, 0.05)
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.05))
    groupRef.current.visible = isVisible

    const y = groupRef.current.userData.baseY + Math.sin(t * 1.2) * 0.2

    groupRef.current.position.set(x, y, z)
    
    const dx = (Math.cos(speed) * 8 + Math.cos(speed * 1.2) * 1.2 * 2) * 0.8
    const dz = (Math.cos(speed * 1.5) * 1.5 * 15) * 0.8
    
    const targetAngle = Math.atan2(dx, dz)
    
    let diff = targetAngle - groupRef.current.rotation.y
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    groupRef.current.rotation.y += diff * 0.05
  })

  return (
    <group ref={groupRef} position={[0, -30, -15]} scale={0}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload('/models/megalodon.glb')

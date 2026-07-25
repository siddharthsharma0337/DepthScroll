import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'

useGLTF.preload('/models/crabsquid.glb')

export default function CrabsquidModel({ progressRef }) {
  const groupRef = useRef(null)
  const { scene, animations } = useGLTF('/models/crabsquid.glb')
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
    const t = clock.elapsedTime * 0.3
    
    const start = 0.75
    const end = 1.0
    
    let targetY = -3
    let targetScale = 2
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
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.02))
    groupRef.current.visible = isVisible

    // Looming movement
    const x = Math.sin(t) * 1.5
    const z = -12 + Math.sin(t * 0.8) * 2 // far away
    
    const y = groupRef.current.userData.baseY + Math.cos(t * 1.5) * 0.5

    groupRef.current.position.set(x, y, z)
    
    // Slowly faces the diver
    const targetAngle = Math.sin(t * 0.2) * 0.3
    groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetAngle, 0.05)
    
    // Creepy leg tilt
    groupRef.current.rotation.x = Math.sin(t * 0.5) * 0.1
  })

  return (
    <group ref={groupRef} position={[0, -25, -12]} scale={0}>
      <primitive object={scene} />
    </group>
  )
}

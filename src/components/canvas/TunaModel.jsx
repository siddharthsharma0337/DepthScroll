import { useGLTF, useAnimations } from '@react-three/drei'
import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

export default function TunaModel({ progressRef, timeOffset = 0, xOffset = 0, zOffset = 0, speedMultiplier = 1 }) {
  const groupRef = useRef()
  const { scene, animations } = useGLTF('/models/tuna.glb')
  
  const clonedScene = useMemo(() => SkeletonUtils.clone(scene), [scene])
  const { actions, names } = useAnimations(animations, clonedScene)

  useEffect(() => {
    if (names.length > 0) {
      const action = actions[names[0]]
      if (action) {
        action.reset()
        const duration = action.getClip().duration
        if (duration > 0) {
          action.time = timeOffset % duration
        }
        action.fadeIn(0.5).play()
        action.setLoop(THREE.LoopRepeat, Infinity)
      }
    }
  }, [actions, names, timeOffset])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const p = progressRef?.current ?? 0
    const t = (clock.elapsedTime + timeOffset) * 0.2
    
    // Quick circular movement
    const speed = t * 1.5 * speedMultiplier
    const x = Math.sin(speed) * 5 + Math.sin(speed * 1.3) * 2 + xOffset
    const z = Math.cos(speed * 1.2) * 5 - 5 + zOffset
    
    const depthScale = 0.6 + (z + 2) * 0.05

    const start = 0.0
    const end = 0.25
    
    let targetY = -2
    let targetScale = depthScale
    let isVisible = true

    if (p < start) {
      targetY = -20 // This will never happen since p >= 0, but good for consistency
      targetScale = 0
      if (groupRef.current.userData.baseY < -19) isVisible = false
    } else if (p > end) {
      targetY = 20
      targetScale = 0
      if (groupRef.current.userData.baseY > 19) isVisible = false
    }

    if (groupRef.current.userData.baseY === undefined) groupRef.current.userData.baseY = -2
    groupRef.current.userData.baseY = THREE.MathUtils.lerp(groupRef.current.userData.baseY, targetY, 0.05)
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.05))
    groupRef.current.visible = isVisible

    const y = groupRef.current.userData.baseY + Math.cos(t * 3) * 0.1

    groupRef.current.position.set(x, y, z)
    
    const dx = (Math.cos(speed) * 5 + Math.cos(speed * 1.3) * 1.3 * 2) * 1.5
    const dz = (-Math.sin(speed * 1.2) * 1.2 * 5) * 1.5
    
    const targetAngle = Math.atan2(dx, dz)
    
    let diff = targetAngle - groupRef.current.rotation.y
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    groupRef.current.rotation.y += diff * 0.15
  })

  return (
    <group ref={groupRef} position={[-3 + xOffset, 10, -5 + zOffset]} scale={0}>
      <primitive object={clonedScene} />
    </group>
  )
}

useGLTF.preload('/models/tuna.glb')

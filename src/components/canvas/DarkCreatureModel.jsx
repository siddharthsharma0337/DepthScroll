import { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF, useAnimations } from '@react-three/drei'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

useGLTF.preload('/models/dark_creature.glb')

export default function DarkCreatureModel({ progressRef, timeOffset = 0, xOffset = 0, zOffset = 0, speedMultiplier = 1, pathType = 'deep' }) {
  const groupRef = useRef(null)
  const { scene, animations } = useGLTF('/models/dark_creature.glb')
  
  // Clone scene so we can have multiple creatures safely
  const clonedScene = useMemo(() => {
    const clone = SkeletonUtils.clone(scene)
    // Fix transparency bug: imported models sometimes have transparent=true unnecessarily
    // which causes depth sorting issues in Three.js, making them look see-through or black
    clone.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.transparent = false
        child.material.depthWrite = true
        child.material.alphaTest = 0.5 // In case it has cutout textures (like fins/teeth)
        child.material.needsUpdate = true
      }
    })
    return clone
  }, [scene])
  
  // Bind animations directly to the cloned scene! This guarantees the mixer finds the cloned bones.
  const { actions, names } = useAnimations(animations, clonedScene)

  useEffect(() => {
    if (names.length > 0) {
      const action = actions[names[0]]
      if (action) {
        action.reset()
        // Set time offset before playing to avoid freezing
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
    const t = (clock.elapsedTime + timeOffset) * 0.05 // Moves very slowly (creepy)
    
    const speed = t * 0.8 * speedMultiplier
    let x, z, dx, dz
    
    if (pathType === 'leftRight') {
      // Swims predominantly left and right with less Z depth
      x = Math.sin(speed) * 8 + Math.sin(speed * 1.3) * 2 + xOffset
      z = Math.cos(speed * 2) * 2 - 8 + zOffset
      dx = (Math.cos(speed) * 8 + Math.cos(speed * 1.3) * 1.3 * 2)
      dz = (-Math.sin(speed * 2) * 2 * 2)
    } else {
      // Deep figure-8 hovering pattern
      x = Math.sin(speed) * 3 + Math.sin(speed * 1.41) * 1.2 + xOffset
      z = Math.cos(speed * 2.11) * 6 - 8 + zOffset
      dx = (Math.cos(speed) * 3 + Math.cos(speed * 1.41) * 1.41 * 1.2)
      dz = (-Math.sin(speed * 2.11) * 2.11 * 6)
    }
    
    // Dynamic scale naturally linked to Z position
    const depthScale = 0.4 + (z + 2) * 0.025

    const start = 0.5
    const end = 0.75
    
    let targetY = 0
    let targetScale = depthScale
    let isVisible = true

    if (p < start) {
      targetY = -20
      targetScale = 0
      if (groupRef.current.userData.baseY < -19) isVisible = false
    } else if (p > end) {
      targetY = 20
      targetScale = 0
      if (groupRef.current.userData.baseY > 19) isVisible = false
    }

    if (groupRef.current.userData.baseY === undefined) groupRef.current.userData.baseY = -20
    groupRef.current.userData.baseY = THREE.MathUtils.lerp(groupRef.current.userData.baseY, targetY, 0.05)
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.05))
    groupRef.current.visible = isVisible

    // Hovering 
    const y = groupRef.current.userData.baseY + Math.sin(t * 3.3) * 0.03

    groupRef.current.position.set(x, y, z)
    
    // Shifted by 180 degrees (from -PI/2 to +PI/2) as requested!
    const targetAngle = Math.atan2(dx, dz) + Math.PI / 2
    
    // Smoothly rotate without 360-degree spins
    let diff = targetAngle - groupRef.current.rotation.y
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    groupRef.current.rotation.y += diff * 0.05
    
    groupRef.current.rotation.z = Math.sin(t * 1.2) * 0.1
  })

  return (
    <group ref={groupRef} position={[xOffset, -20, -10 + zOffset]} scale={0}>
      <primitive object={clonedScene} />
    </group>
  )
}

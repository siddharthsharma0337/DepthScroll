import { useGLTF, useAnimations } from '@react-three/drei'
import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'

export default function GoldfishModel({ progressRef, timeOffset = 0, yOffset = 0, xOffset = 0 }) {
  const groupRef = useRef()
  // Load model
  const { scene, animations } = useGLTF('/models/goldfish.glb')
  
  // Clone scene so we can have multiple goldfish safely
  const clone = useRef(SkeletonUtils.clone(scene))
  // Bind animations directly to the cloned scene to guarantee the mixer finds its bones!
  const { actions, names } = useAnimations(animations, clone.current)

  useEffect(() => {
    if (names.length > 0) {
      const action = actions[names[0]]
      if (action) {
        action.reset()
        // Offset animation time if multiple exist (modulo to avoid freezing)
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
    const t = clock.elapsedTime * 0.25 + timeOffset
    
    // Quick, small unpredictable figure-8 for goldfish
    const speed = t * 1.5
    const x = Math.sin(speed) * 3 + Math.sin(speed * 1.51) * 1 + xOffset
    const z = Math.sin(speed * 2.1) * 4 - 5
    
    const depthScale = 0.4 + (z + 2) * 0.05

    const start = 0.0
    const end = 0.25
    
    let targetY = yOffset
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

    if (groupRef.current.userData.baseY === undefined) groupRef.current.userData.baseY = yOffset
    groupRef.current.userData.baseY = THREE.MathUtils.lerp(groupRef.current.userData.baseY, targetY, 0.05)
    groupRef.current.scale.setScalar(THREE.MathUtils.lerp(groupRef.current.scale.x, targetScale, 0.05))
    groupRef.current.visible = isVisible

    const y = groupRef.current.userData.baseY + Math.sin(t * 3.5) * 0.1

    groupRef.current.position.set(x, y, z)
    
    // Velocity derivative for rotation
    const dx = (Math.cos(speed) * 3 + Math.cos(speed * 1.51) * 1.51 * 1) * 1.5
    const dz = (Math.cos(speed * 2.1) * 2.1 * 4) * 1.5
    
    // Guess native orientation (+Z -> 0, if sideways, it will be + PI/2)
    const targetAngle = Math.atan2(dx, dz)
    
    let diff = targetAngle - groupRef.current.rotation.y
    diff = Math.atan2(Math.sin(diff), Math.cos(diff))
    groupRef.current.rotation.y += diff * 0.15
  })

  return (
    <group ref={groupRef} position={[xOffset, 10, -5]} scale={0}>
      <primitive object={clone.current} />
    </group>
  )
}

useGLTF.preload('/models/goldfish.glb')

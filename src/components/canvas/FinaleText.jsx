import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

/**
 * FinaleText
 *
 * Renders the "Edge Of The World" text as true 3D WebGL geometry.
 * Because the DiverModel moves and tilts in Z-space, placing this text
 * at Z=0 means the fish will physically intersect and weave through it,
 * creating an immersive depth illusion.
 *
 * MUST be wrapped in <Suspense> in parent because Text loads fonts async.
 */
export default function FinaleText({ progressRef }) {
  const group1Ref = useRef()
  const group2Ref = useRef()
  const mat1Ref = useRef()
  const mat2Ref = useRef()

  useFrame(() => {
    const p = progressRef?.current ?? 0

    // Scene 4 starts around p = 0.84. Fade in smoothly.
    const targetOpacity = THREE.MathUtils.clamp(
      THREE.MathUtils.mapLinear(p, 0.82, 0.91, 0, 1),
      0, 1
    )

    if (mat1Ref.current) {
      mat1Ref.current.opacity = THREE.MathUtils.lerp(mat1Ref.current.opacity, targetOpacity, 0.05)
    }
    if (mat2Ref.current) {
      mat2Ref.current.opacity = THREE.MathUtils.lerp(mat2Ref.current.opacity, targetOpacity, 0.05)
    }

    // Parallax float upward as text appears
    const yOffset = (1 - targetOpacity) * -0.5
    if (group1Ref.current) group1Ref.current.position.y = 0.55 + yOffset
    if (group2Ref.current) group2Ref.current.position.y = -0.05 + yOffset
  })

  return (
    <group position={[0, 0.2, 0]}>

      {/* Line 1 — "You Have Reached" */}
      <group ref={group1Ref} position={[0, 0.7, -0.2]}>
        <Text
          fontFamily='serif'
          fontSize={0.36}
          fontWeight="bold"
          anchorX="center"
          anchorY="middle"
          textAlign="center"
          letterSpacing={0.05}
          fontStyle="italic"
        >
          You Have Reached
          <meshBasicMaterial
            ref={mat1Ref}
            color="#ffffff"
            transparent
            opacity={0}
          />
        </Text>
      </group>

      {/* Line 2 — "The Edge Of The World." — single wide line */}
      <group ref={group2Ref} position={[0, -0.1, 0]}>
        <Text
          fontSize={0.48}
          fontWeight="bold"
          anchorX="center"
          anchorY="middle"
          textAlign="center"
          letterSpacing={0.05}
          fontStyle="italic"
        >
          The Edge Of The World.
          <meshBasicMaterial
            ref={mat2Ref}
            color="#ffffff"
            transparent
            opacity={0}
          />
        </Text>
      </group>

    </group>
  )
}

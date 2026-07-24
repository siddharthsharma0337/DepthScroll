import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const PARTICLE_COUNT = 1500

/**
 * Marine snow particle system (GPU Optimized).
 * 
 * Particles drift upward at a rate influenced by the current scroll velocity.
 * In the abyss (scene 4), density/opacity fades out to simulate the barren deep.
 * All calculation is offloaded to the vertex shader.
 */
export default function MarineParticles({ progressRef, velocityRef }) {
  const materialRef = useRef(null)

  // Build static initial positions and attributes
  const { positions, aSpeeds, aSizes } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3)
    const aSpeeds = new Float32Array(PARTICLE_COUNT)
    const aSizes = new Float32Array(PARTICLE_COUNT)

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 14  // X spread
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10  // Y spread
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8   // Z depth
      aSpeeds[i] = 0.003 + Math.random() * 0.007
      aSizes[i] = 0.5 + Math.random() * 2.0
    }

    return { positions, aSpeeds, aSizes }
  }, [])

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uVelocity: { value: 0 },
    uOpacity: { value: 1 },
    uColor: { value: new THREE.Color("#a8d8f0") }
  }), [])

  useFrame(({ clock }) => {
    if (!materialRef.current) return

    const progress = progressRef?.current ?? 0
    const velocity = Math.abs(velocityRef?.current ?? 0)

    // Scene 4 fade: particles become sparse in the abyss
    const abyssProgress = Math.max(0, (progress - 0.75) / 0.25)
    const targetOpacity = 1 - abyssProgress * 0.82
    
    // Smoothly update uniforms
    materialRef.current.uniforms.uOpacity.value = THREE.MathUtils.lerp(
      materialRef.current.uniforms.uOpacity.value,
      targetOpacity,
      0.05
    )
    materialRef.current.uniforms.uTime.value = clock.elapsedTime
    materialRef.current.uniforms.uVelocity.value = velocity
  })

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-aSpeed"
          args={[aSpeeds, 1]}
        />
        <bufferAttribute
          attach="attributes-aSize"
          args={[aSizes, 1]}
        />
      </bufferGeometry>
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          uniform float uVelocity;
          attribute float aSpeed;
          attribute float aSize;

          void main() {
            vec3 pos = position;
            
            // Drift upward based on absolute time
            float speedMult = 1.0 + uVelocity * 4.0;
            float yMovement = aSpeed * speedMult * uTime * 60.0;
            pos.y += yMovement;

            // Wrap around: keep y between -5.0 and 5.0
            pos.y = mod(pos.y + 5.0, 10.0) - 5.0;

            // Slight horizontal drift
            pos.x += sin(pos.y * 0.3 + aSize) * 0.1;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            
            // Size attenuation based on distance
            gl_PointSize = aSize * (15.0 / -mvPosition.z);
          }
        `}
        fragmentShader={`
          uniform vec3 uColor;
          uniform float uOpacity;

          void main() {
            // Soft circle shape
            float dist = distance(gl_PointCoord, vec2(0.5));
            
            // Smooth edges for underwater feel
            // If dist > 0.5, smoothstep returns 0, making it fully transparent without needing 'discard'
            float alpha = smoothstep(0.5, 0.1, dist) * uOpacity;
            gl_FragColor = vec4(uColor, alpha);
          }
        `}
      />
    </points>
  )
}

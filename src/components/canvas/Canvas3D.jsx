import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import DiverModel from './DiverModel'
import OceanLights from './OceanLights'
import MarineParticles from './MarineParticles'

/**
 * Canvas3D
 *
 * The React Three Fiber scene. Alpha background so the video
 * layer beneath shows through. No shadows — performance critical.
 */
export default function Canvas3D({ progressRef, velocityRef }) {
  return (
    <div className="canvas-layer">
      <Canvas
        eventSource={document.getElementById('root')}
        eventPrefix="client"
        camera={{ fov: 45, position: [0, 0, 5], near: 0.1, far: 100 }}
        gl={{
          alpha: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
        shadows={false}
      >
        <Suspense fallback={null}>
          <DiverModel progressRef={progressRef} />
        </Suspense>

        <OceanLights progressRef={progressRef} />

        <MarineParticles
          progressRef={progressRef}
          velocityRef={velocityRef}
        />
      </Canvas>
    </div>
  )
}

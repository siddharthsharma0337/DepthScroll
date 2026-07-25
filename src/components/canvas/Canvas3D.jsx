import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import DiverModel from './DiverModel'
import OceanLights from './OceanLights'
import MarineParticles from './MarineParticles'
import SharkModel from './SharkModel'
import DarkCreatureModel from './DarkCreatureModel'
import CrabsquidModel from './CrabsquidModel'
import GoldfishModel from './GoldfishModel'
import MegalodonModel from './MegalodonModel'
import TroutModel from './TroutModel'
import TunaModel from './TunaModel'

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
          <SharkModel progressRef={progressRef} />
          <DarkCreatureModel progressRef={progressRef} timeOffset={0} xOffset={0} zOffset={0} speedMultiplier={1} pathType="deep" />
          <DarkCreatureModel progressRef={progressRef} timeOffset={15} xOffset={4} zOffset={-2} speedMultiplier={1.2} pathType="deep" />
          <DarkCreatureModel progressRef={progressRef} timeOffset={35} xOffset={-5} zOffset={2} speedMultiplier={0.9} pathType="leftRight" />
          <DarkCreatureModel progressRef={progressRef} timeOffset={22} xOffset={2} zOffset={-1} speedMultiplier={1.5} pathType="leftRight" />
          <DarkCreatureModel progressRef={progressRef} timeOffset={47} xOffset={-3} zOffset={1} speedMultiplier={0.8} pathType="leftRight" />
          <CrabsquidModel progressRef={progressRef} />
          <GoldfishModel progressRef={progressRef} timeOffset={0} xOffset={-2} yOffset={0} />
          <GoldfishModel progressRef={progressRef} timeOffset={1.5} xOffset={0.5} yOffset={0.5} />
          <GoldfishModel progressRef={progressRef} timeOffset={2.5} xOffset={3} yOffset={-0.5} />
          
          <TroutModel progressRef={progressRef} timeOffset={0} xOffset={0} zOffset={0} speedMultiplier={1} />
          <TroutModel progressRef={progressRef} timeOffset={5} xOffset={2} zOffset={-2} speedMultiplier={1.1} />
          <TroutModel progressRef={progressRef} timeOffset={12} xOffset={-3} zOffset={1} speedMultiplier={0.9} />
          
          <TunaModel progressRef={progressRef} timeOffset={0} xOffset={0} zOffset={0} speedMultiplier={1} />
          <TunaModel progressRef={progressRef} timeOffset={4} xOffset={3} zOffset={1} speedMultiplier={1.05} />
          <TunaModel progressRef={progressRef} timeOffset={8} xOffset={-2} zOffset={-1} speedMultiplier={0.95} />
          
          <MegalodonModel progressRef={progressRef} />
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

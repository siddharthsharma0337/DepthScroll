import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`

const fragmentShader = `
  uniform float uTime;
  uniform float uProgress;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1,0)), f.x),
      mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
      f.y
    );
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * 0.35;

    // 1. Caustics - strong near surface, fade into deep
    float causticStrength = (1.0 - smoothstep(0.0, 0.55, uProgress)) * 0.012;
    float warpX = noise(uv * 3.5 + vec2(t, 0.0)) - 0.5;
    float warpY = noise(uv * 3.5 + vec2(0.0, t * 0.8)) - 0.5;
    vec2 warpedUv = uv + vec2(warpX, warpY) * causticStrength;
    float caustic = noise(warpedUv * 6.0 + t * 0.6);
    caustic = pow(caustic, 2.8) * causticStrength * 80.0;
    vec3 causticColor = vec3(caustic * 0.4, caustic * 0.85, caustic * 1.1);

    // 2. Depth stratification fog bands
    float fogBand = sin(uv.y * 18.0 + uTime * 0.15) * 0.5 + 0.5;
    float fogAlpha = fogBand * 0.018 * smoothstep(0.1, 0.6, uProgress);
    vec3 fogColor = vec3(0.04, 0.14, 0.34) * fogAlpha;

    // 3. Depth vignette darkening
    vec2 vigUv = uv - 0.5;
    float vignette = 1.0 - dot(vigUv, vigUv) * (1.4 + uProgress * 1.2);
    vignette = clamp(vignette, 0.0, 1.0);
    float vignetteAlpha = (1.0 - vignette) * (0.30 + uProgress * 0.35);

    // Composite
    vec3 color = causticColor + fogColor;
    color = mix(color, vec3(0.0), vignetteAlpha);
    float alpha = clamp(length(causticColor) + length(fogColor) + vignetteAlpha, 0.0, 0.85);

    gl_FragColor = vec4(color, alpha);
  }
`

export default function UnderwaterEffect({ progressRef }) {
  const matRef = useRef(null)

  const uniforms = useMemo(() => ({
    uTime:     { value: 0 },
    uProgress: { value: 0 },
  }), [])

  useFrame(({ clock }) => {
    if (!matRef.current) return
    matRef.current.uniforms.uTime.value = clock.elapsedTime
    matRef.current.uniforms.uProgress.value = progressRef?.current ?? 0
  })

  return (
    <mesh renderOrder={10}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}

import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'
import Controls from './Controls.jsx'
import MarineLife from './MarineLife.jsx'
import { InteractionProvider } from './Interactables.jsx'
import { useSettings } from './Settings.jsx'

const QUALITY = {
  low: { bubbleCount: 25, sparkleCount: 40, dpr: [1, 1], shadows: false },
  medium: { bubbleCount: 70, sparkleCount: 140, dpr: [1, 1.5], shadows: true },
  high: { bubbleCount: 110, sparkleCount: 220, dpr: [1, 2], shadows: true }
}

function OceanFloor({ color }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -60, 0]} receiveShadow>
      <planeGeometry args={[400, 400, 1, 1]} />
      <meshStandardMaterial color={color} roughness={1} />
    </mesh>
  )
}

// Every 3D object below is built from plain Three.js geometry rather than
// loaded models, per the brief's fallback-geometry requirement — nothing
// here depends on an external asset that could fail to load.

function ProceduralRock({ position, scale = 1, color }) {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color={color} roughness={0.85} flatShading />
    </mesh>
  )
}

function Coral({ position, color }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.4, 0]} castShadow>
        <coneGeometry args={[0.6, 1.2, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      <mesh position={[0.4, 0.3, 0.2]} castShadow>
        <coneGeometry args={[0.35, 0.8, 6]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
    </group>
  )
}

// Kelp is rooted near the floor but grown tall enough to reach toward the
// surface. Real kelp forests span the sunlit zone's full water column, so
// this fixes the empty view honestly rather than just aiming the camera
// at the floor. Only rendered in reef zones — see hasReef below.
function Seaweed({ position, height }) {
  const ref = useRef()
  const sway = useMemo(() => 0.4 + Math.random() * 0.4, [])
  const { settings } = useSettings()
  useFrame((state) => {
    if (ref.current) {
      const amount = settings.motionEffects ? 0.1 : 0.02
      ref.current.rotation.z = Math.sin(state.clock.elapsedTime * sway + position[0]) * amount
    }
  })
  return (
    <group position={position}>
      <mesh ref={ref} position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.06, 0.16, height, 6]} />
        <meshStandardMaterial color="#1f6b4a" />
      </mesh>
    </group>
  )
}

function Bubbles({ color, count }) {
  const meshRef = useRef()
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const data = useMemo(
    () =>
      new Array(count).fill().map(() => ({
        x: THREE.MathUtils.randFloatSpread(140),
        z: THREE.MathUtils.randFloatSpread(140),
        y: THREE.MathUtils.randFloat(-58, -1),
        speed: THREE.MathUtils.randFloat(0.4, 1.2),
        scale: THREE.MathUtils.randFloat(0.08, 0.32)
      })),
    [count]
  )

  useFrame((_, delta) => {
    if (!meshRef.current) return
    data.forEach((b, i) => {
      b.y += b.speed * delta * 4
      if (b.y > -1) b.y = -58
      dummy.position.set(b.x, b.y, b.z)
      dummy.scale.setScalar(b.scale)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    })
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[null, null, count]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color={color} transparent opacity={0.45} roughness={0.1} />
    </instancedMesh>
  )
}

// Reef zones (sunlit/twilight) get rocks + coral + kelp. Non-reef zones
// (midnight/abyssal/hadal) get only bare rock formations — there's no
// light for coral or kelp to grow on down there, and it matches the
// brief's own zone descriptions ("large rock formations", "extreme
// darkness") better than reusing a reef in the dark.
function SceneDecor({ hasReef, rockColor }) {
  const rocks = useMemo(
    () =>
      new Array(hasReef ? 14 : 22).fill().map(() => ({
        position: [THREE.MathUtils.randFloatSpread(140), -59, THREE.MathUtils.randFloatSpread(140)],
        scale: THREE.MathUtils.randFloat(1, hasReef ? 3.2 : 5)
      })),
    [hasReef]
  )
  const corals = useMemo(
    () =>
      hasReef
        ? new Array(10).fill().map(() => ({
            position: [THREE.MathUtils.randFloatSpread(100), -59.5, THREE.MathUtils.randFloatSpread(100)],
            color: ['#d9556b', '#e8a33d', '#4dd6c0'][Math.floor(Math.random() * 3)]
          }))
        : [],
    [hasReef]
  )
  const seaweeds = useMemo(
    () =>
      hasReef
        ? new Array(26).fill().map(() => ({
            position: [
              THREE.MathUtils.randFloatSpread(150),
              -58 + Math.random() * 2,
              THREE.MathUtils.randFloatSpread(150)
            ],
            height: THREE.MathUtils.randFloat(22, 48)
          }))
        : [],
    [hasReef]
  )

  return (
    <>
      {rocks.map((r, i) => (
        <ProceduralRock key={`rock-${i}`} color={rockColor} {...r} />
      ))}
      {corals.map((c, i) => (
        <Coral key={`coral-${i}`} {...c} />
      ))}
      {seaweeds.map((s, i) => (
        <Seaweed key={`sw-${i}`} {...s} />
      ))}
    </>
  )
}

export default function OceanScene({
  zone,
  zoneId,
  spawnPosition,
  onDepthChange,
  onActivate,
  isTouch,
  touchInput,
  activateSignal,
  onTargetChange,
  onScanProgress,
  sonarSignal,
  onSonarResult,
  navigationTargetId,
  onNavigationUpdate,
  onMinimapUpdate
}) {
  const { settings } = useSettings()
  const quality = QUALITY[settings.graphicsQuality] || QUALITY.medium

  return (
    <Canvas
      shadows={quality.shadows}
      dpr={quality.dpr}
      camera={{ position: spawnPosition, fov: 65, near: 0.1, far: 500 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={[zone.fogColor]} />
      <fog attach="fog" args={[zone.fogColor, zone.fogNear, zone.fogFar]} />
      <hemisphereLight args={[zone.skyColor, zone.groundColor, zone.ambientIntensity]} />
      <directionalLight
        position={[20, 40, 10]}
        intensity={zone.directionalIntensity}
        castShadow={quality.shadows}
      />
      <InteractionProvider
        onActivate={onActivate}
        activateSignal={activateSignal}
        onTargetChange={onTargetChange}
        onScanProgress={onScanProgress}
        sonarSignal={sonarSignal}
        onSonarResult={onSonarResult}
        navigationTargetId={navigationTargetId}
        onNavigationUpdate={onNavigationUpdate}
        onMinimapUpdate={onMinimapUpdate}
      >
        <Suspense fallback={null}>
          <OceanFloor color={zone.floorColor} />
          <SceneDecor hasReef={zone.hasReef} rockColor={zone.rockColor} />
          <Bubbles color={zone.particleColor} count={quality.bubbleCount} />
          <MarineLife zoneId={zoneId} />
          <Sparkles
            position={[0, -14, 0]}
            count={quality.sparkleCount}
            scale={[110, 45, 110]}
            size={2}
            speed={0.25}
            color={zone.particleColor}
            opacity={0.6}
          />
        </Suspense>
      </InteractionProvider>
      <Controls onDepthChange={onDepthChange} isTouch={isTouch} touchInput={touchInput} />
    </Canvas>
  )
}

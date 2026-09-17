import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { marineLife, worldObjects } from './data.js'
import { useRegisterInteractable, useIsTargeted } from './Interactables.jsx'
import { useSettings } from './Settings.jsx'

function highlightProps(highlighted) {
  return highlighted
    ? { emissive: '#4dd8c8', emissiveIntensity: 0.7 }
    : { emissive: '#000000', emissiveIntensity: 0 }
}

// Wraps any archetype shape with registration, idle motion, and the
// floating name tag shown while targeted. Archetypes only need to worry
// about their own geometry.
function Interactable({ data, children }) {
  const ref = useRegisterInteractable(data.id, data)
  const highlighted = useIsTargeted(data.id)
  const { settings } = useSettings()
  const phase = useMemo(() => Math.random() * Math.PI * 2, [])
  const basePos = data.position

  useFrame((state) => {
    if (!ref.current || data.static || !settings.motionEffects) return
    const t = state.clock.elapsedTime
    ref.current.position.y = basePos[1] + Math.sin(t * 0.6 + phase) * 0.6
    ref.current.rotation.y = Math.sin(t * 0.2 + phase) * 0.3
  })

  const showTooltip = settings.learningMode || (settings.creatureLabels && highlighted)

  return (
    <group ref={ref} position={basePos} scale={data.scale}>
      {children(highlighted)}
      {showTooltip && (
        <Html position={[0, 1.8, 0]} center distanceFactor={12}>
          <div className="creature-tooltip">{data.name}</div>
        </Html>
      )}
    </group>
  )
}

// --- Archetypes: simple, distinguishable low-poly body plans built from ---
// --- plain primitives, reused across data entries via color/scale.     ---

function Fish({ color, highlighted }) {
  return (
    <group>
      <mesh scale={[1, 0.55, 0.4]} castShadow>
        <sphereGeometry args={[0.9, 12, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} {...highlightProps(highlighted)} />
      </mesh>
      <mesh position={[-1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.5, 0.7, 4]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Shark({ color, highlighted }) {
  return (
    <group>
      <mesh scale={[1.8, 0.6, 0.5]} castShadow>
        <sphereGeometry args={[0.9, 12, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} {...highlightProps(highlighted)} />
      </mesh>
      <mesh position={[-1.7, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.6, 0.9, 4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      <mesh position={[0.2, 0.7, 0]}>
        <coneGeometry args={[0.3, 0.6, 4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  )
}

function Ray({ color, highlighted }) {
  return (
    <group>
      <mesh scale={[1.6, 0.15, 2]} castShadow>
        <sphereGeometry args={[1, 16, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} {...highlightProps(highlighted)} />
      </mesh>
      <mesh position={[0, 0, 1.7]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.08, 1.4, 4]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Turtle({ color, highlighted }) {
  return (
    <group>
      <mesh scale={[1, 0.5, 1.2]} castShadow>
        <sphereGeometry args={[0.8, 12, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} {...highlightProps(highlighted)} />
      </mesh>
      <mesh position={[0, -0.1, 1]} scale={[0.5, 0.4, 0.5]}>
        <sphereGeometry args={[0.5, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
    </group>
  )
}

function Jelly({ color, highlighted }) {
  const pulseRef = useRef()
  useFrame((state) => {
    if (pulseRef.current) {
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.08
      pulseRef.current.scale.set(pulse, 1 / pulse, pulse)
    }
  })
  return (
    <group ref={pulseRef}>
      <mesh scale={[1, 0.6, 1]} castShadow>
        <sphereGeometry args={[0.8, 12, 8]} />
        <meshStandardMaterial
          color={color}
          roughness={0.3}
          transparent
          opacity={0.8}
          {...highlightProps(highlighted)}
        />
      </mesh>
      {[...Array(5)].map((_, i) => (
        <mesh
          key={i}
          position={[Math.cos((i / 5) * Math.PI * 2) * 0.4, -0.9, Math.sin((i / 5) * Math.PI * 2) * 0.4]}
        >
          <cylinderGeometry args={[0.03, 0.03, 1, 4]} />
          <meshStandardMaterial color={color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function Cephalopod({ color, highlighted }) {
  return (
    <group>
      <mesh scale={[1, 1.1, 1]} castShadow>
        <sphereGeometry args={[0.8, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.5} {...highlightProps(highlighted)} />
      </mesh>
      {[...Array(6)].map((_, i) => {
        const angle = (i / 6) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(angle) * 0.4, -0.9, Math.sin(angle) * 0.4]} rotation={[0.3, 0, angle]}>
            <cylinderGeometry args={[0.05, 0.12, 1.4, 5]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
        )
      })}
    </group>
  )
}

function Whale({ color, highlighted }) {
  return (
    <group>
      <mesh scale={[2.2, 0.9, 0.9]} castShadow>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color={color} roughness={0.5} {...highlightProps(highlighted)} />
      </mesh>
      <mesh position={[-2.2, 0, 0]} scale={[0.6, 0.15, 1.2]}>
        <sphereGeometry args={[1, 10, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0.6, -0.6, 0.9]} rotation={[0, 0, 0.6]}>
        <coneGeometry args={[0.2, 0.7, 4]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
    </group>
  )
}

function Anglerfish({ color, highlighted }) {
  return (
    <group>
      <mesh scale={[1, 0.8, 0.8]} castShadow>
        <sphereGeometry args={[0.6, 12, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} {...highlightProps(highlighted)} />
      </mesh>
      <mesh position={[0.6, 0.5, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.02, 0.04, 0.8, 4]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      {/* Bioluminescent lure tip — glows regardless of highlight state */}
      <mesh position={[0.9, 0.85, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#eaffb0" emissive="#c8ff6b" emissiveIntensity={1.4} />
      </mesh>
    </group>
  )
}

function Shipwreck({ color, highlighted }) {
  return (
    <group rotation={[0, 0.3, 0.15]}>
      <mesh scale={[3.5, 0.9, 1]} castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} roughness={0.9} {...highlightProps(highlighted)} />
      </mesh>
      <mesh position={[-1.4, 0.9, 0]} scale={[0.15, 1.4, 0.15]}>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>
    </group>
  )
}

function Buoy({ color, highlighted }) {
  return (
    <group>
      <mesh castShadow>
        <sphereGeometry args={[0.7, 12, 10]} />
        <meshStandardMaterial color={color} roughness={0.4} {...highlightProps(highlighted)} />
      </mesh>
      <mesh position={[0, -0.7, 0]} scale={[0.06, 6, 0.06]}>
        <cylinderGeometry args={[1, 1, 1, 4]} />
        <meshStandardMaterial color="#2a3540" roughness={0.9} />
      </mesh>
    </group>
  )
}

function Statue({ color, highlighted }) {
  return (
    <group>
      <mesh position={[0, 1.2, 0]} scale={[0.5, 2.4, 0.5]} castShadow>
        <cylinderGeometry args={[0.6, 0.8, 1, 8]} />
        <meshStandardMaterial color={color} roughness={0.95} {...highlightProps(highlighted)} />
      </mesh>
      <mesh position={[0, 2.6, 0]} scale={0.5}>
        <sphereGeometry args={[0.8, 10, 8]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </mesh>
    </group>
  )
}

function Vent({ color, highlighted }) {
  return (
    <group>
      <mesh position={[0, 0.8, 0]} castShadow>
        <coneGeometry args={[0.7, 1.6, 8]} />
        <meshStandardMaterial color={color} roughness={0.95} {...highlightProps(highlighted)} />
      </mesh>
      <mesh position={[0, 2, 0]}>
        <coneGeometry args={[0.4, 1.4, 8, 1, true]} />
        <meshStandardMaterial
          color="#6b4a3a"
          transparent
          opacity={0.35}
          emissive="#c96b3a"
          emissiveIntensity={0.4}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

const ARCHETYPES = {
  fish: Fish,
  shark: Shark,
  ray: Ray,
  turtle: Turtle,
  jelly: Jelly,
  cephalopod: Cephalopod,
  whale: Whale,
  anglerfish: Anglerfish,
  shipwreck: Shipwreck,
  buoy: Buoy,
  statue: Statue,
  vent: Vent
}

function Entity({ data }) {
  const Archetype = ARCHETYPES[data.archetype] || Fish
  return <Interactable data={data}>{(highlighted) => <Archetype color={data.color} highlighted={highlighted} />}</Interactable>
}

export default function MarineLife({ zoneId }) {
  const creatures = marineLife.filter((entry) => entry.zone === zoneId)
  const objects = worldObjects.filter((entry) => entry.zone === zoneId)
  return (
    <>
      {creatures.map((entry) => (
        <Entity key={entry.id} data={entry} />
      ))}
      {objects.map((entry) => (
        <Entity key={entry.id} data={entry} />
      ))}
    </>
  )
}

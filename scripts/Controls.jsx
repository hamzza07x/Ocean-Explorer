import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'

const MOVE_SPEED = 6

export default function Controls({ onDepthChange }) {
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const keys = useRef({ forward: false, backward: false, left: false, right: false, up: false, down: false })
  const { camera } = useThree()

  useEffect(() => {
    const setKey = (code, value) => {
      switch (code) {
        case 'KeyW':
        case 'ArrowUp':
          keys.current.forward = value
          break
        case 'KeyS':
        case 'ArrowDown':
          keys.current.backward = value
          break
        case 'KeyA':
        case 'ArrowLeft':
          keys.current.left = value
          break
        case 'KeyD':
        case 'ArrowRight':
          keys.current.right = value
          break
        case 'Space':
          keys.current.up = value
          break
        case 'ShiftLeft':
        case 'ShiftRight':
          keys.current.down = value
          break
        default:
          break
      }
    }

    const handleKeyDown = (e) => setKey(e.code, true)
    const handleKeyUp = (e) => setKey(e.code, false)

    document.addEventListener('keydown', handleKeyDown)
    document.addEventListener('keyup', handleKeyUp)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame((_, delta) => {
    const k = keys.current
    direction.current.set(0, 0, 0)

    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(forward, camera.up).normalize()

    if (k.forward) direction.current.add(forward)
    if (k.backward) direction.current.sub(forward)
    if (k.right) direction.current.add(right)
    if (k.left) direction.current.sub(right)
    if (k.up) direction.current.y += 1
    if (k.down) direction.current.y -= 1

    if (direction.current.lengthSq() > 0) direction.current.normalize()

    // Frame-rate independent exponential smoothing gives both the
    // acceleration (ramping toward a pressed direction) and deceleration
    // (easing back to zero on release) the brief calls for, from one lerp.
    const targetVelocity = direction.current.multiplyScalar(MOVE_SPEED)
    const smoothing = 1 - Math.pow(0.001, delta)
    velocity.current.lerp(targetVelocity, smoothing)

    camera.position.addScaledVector(velocity.current, delta)

    // Movement boundaries keep the diver within the playable volume.
    camera.position.x = THREE.MathUtils.clamp(camera.position.x, -180, 180)
    camera.position.z = THREE.MathUtils.clamp(camera.position.z, -180, 180)
    // Phase 1 only builds one environment (floor at y=-60), so the diver is
    // kept just above it. This range widens once zone environments land.
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, -55, -1)

    if (onDepthChange) onDepthChange(Math.abs(camera.position.y))
  })

  return <PointerLockControls />
}

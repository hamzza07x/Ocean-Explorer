import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import * as THREE from 'three'

const MOVE_SPEED = 6
const TOUCH_LOOK_SENSITIVITY = 0.004
const TOUCH_DEADZONE = 0.15

export default function Controls({ onDepthChange, isTouch, touchInput }) {
  const velocity = useRef(new THREE.Vector3())
  const direction = useRef(new THREE.Vector3())
  const keys = useRef({ forward: false, backward: false, left: false, right: false, up: false, down: false })
  const { camera } = useThree()

  useEffect(() => {
    // 'YXZ' applies yaw before pitch, which is what keeps a manually-driven
    // FPS-style look from rolling/tilting as you turn. PointerLockControls
    // handles this itself on desktop, so it's only needed for the touch
    // rotation path below, but setting it unconditionally is harmless.
    camera.rotation.order = 'YXZ'
  }, [camera])

  useEffect(() => {
    if (isTouch) return undefined
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
  }, [isTouch])

  useFrame((_, delta) => {
    direction.current.set(0, 0, 0)

    const forward = new THREE.Vector3()
    camera.getWorldDirection(forward)
    forward.y = 0
    forward.normalize()

    const right = new THREE.Vector3()
    right.crossVectors(forward, camera.up).normalize()

    if (isTouch && touchInput?.current) {
      const t = touchInput.current
      const mag = Math.hypot(t.move.forward, t.move.strafe)
      if (mag > TOUCH_DEADZONE) {
        direction.current.addScaledVector(forward, t.move.forward)
        direction.current.addScaledVector(right, t.move.strafe)
      }
      direction.current.y += t.ascend

      // No PointerLockControls on touch (there's no pointer to lock), so
      // rotation is driven directly from the look-area's drag deltas,
      // accumulated since last frame and drained here.
      camera.rotation.y -= t.look.x * TOUCH_LOOK_SENSITIVITY
      camera.rotation.x -= t.look.y * TOUCH_LOOK_SENSITIVITY
      camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x, -1.4, 1.4)
      t.look.x = 0
      t.look.y = 0
    } else {
      const k = keys.current
      if (k.forward) direction.current.add(forward)
      if (k.backward) direction.current.sub(forward)
      if (k.right) direction.current.add(right)
      if (k.left) direction.current.sub(right)
      if (k.up) direction.current.y += 1
      if (k.down) direction.current.y -= 1
    }

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
    // Each zone is its own room (floor at y=-60), so the diver is kept
    // just above it rather than able to swim through into empty space.
    camera.position.y = THREE.MathUtils.clamp(camera.position.y, -55, -1)

    if (onDepthChange) onDepthChange(Math.abs(camera.position.y))
  })

  return isTouch ? null : <PointerLockControls />
}

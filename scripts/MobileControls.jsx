import { useRef, useState } from 'react'

const JOYSTICK_RADIUS = 45

function getTouchByIdentifier(touchList, id) {
  for (let i = 0; i < touchList.length; i += 1) {
    if (touchList[i].identifier === id) return touchList[i]
  }
  return null
}

function Joystick({ onChange }) {
  const baseRef = useRef(null)
  const touchIdRef = useRef(null)
  const [thumb, setThumb] = useState({ x: 0, y: 0 })

  const updateFromTouch = (touch) => {
    const base = baseRef.current
    if (!base) return
    const rect = base.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    let dx = touch.clientX - cx
    let dy = touch.clientY - cy
    const dist = Math.hypot(dx, dy)
    if (dist > JOYSTICK_RADIUS) {
      dx = (dx / dist) * JOYSTICK_RADIUS
      dy = (dy / dist) * JOYSTICK_RADIUS
    }
    setThumb({ x: dx, y: dy })
    onChange({ strafe: dx / JOYSTICK_RADIUS, forward: -dy / JOYSTICK_RADIUS })
  }

  const handleStart = (e) => {
    e.preventDefault()
    const touch = e.changedTouches[0]
    touchIdRef.current = touch.identifier
    updateFromTouch(touch)
  }
  const handleMove = (e) => {
    if (touchIdRef.current === null) return
    const touch = getTouchByIdentifier(e.changedTouches, touchIdRef.current)
    if (touch) updateFromTouch(touch)
  }
  const handleEnd = (e) => {
    const touch = getTouchByIdentifier(e.changedTouches, touchIdRef.current)
    if (touch || touchIdRef.current === null) {
      touchIdRef.current = null
      setThumb({ x: 0, y: 0 })
      onChange({ strafe: 0, forward: 0 })
    }
  }

  return (
    <div
      ref={baseRef}
      className="joystick-base"
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
    >
      <div className="joystick-thumb" style={{ transform: `translate(${thumb.x}px, ${thumb.y}px)` }} />
    </div>
  )
}

function LookArea({ onDelta }) {
  const touchIdRef = useRef(null)
  const lastRef = useRef({ x: 0, y: 0 })

  const handleStart = (e) => {
    const touch = e.changedTouches[0]
    touchIdRef.current = touch.identifier
    lastRef.current = { x: touch.clientX, y: touch.clientY }
  }
  const handleMove = (e) => {
    if (touchIdRef.current === null) return
    const touch = getTouchByIdentifier(e.changedTouches, touchIdRef.current)
    if (!touch) return
    const dx = touch.clientX - lastRef.current.x
    const dy = touch.clientY - lastRef.current.y
    lastRef.current = { x: touch.clientX, y: touch.clientY }
    onDelta(dx, dy)
  }
  const handleEnd = (e) => {
    const touch = getTouchByIdentifier(e.changedTouches, touchIdRef.current)
    if (touch || touchIdRef.current === null) touchIdRef.current = null
  }

  return (
    <div
      className="look-area"
      onTouchStart={handleStart}
      onTouchMove={handleMove}
      onTouchEnd={handleEnd}
      onTouchCancel={handleEnd}
    />
  )
}

function AscendButton({ label, dir, touchInput }) {
  return (
    <button
      type="button"
      className="ascend-btn"
      onTouchStart={(e) => {
        e.preventDefault()
        touchInput.current.ascend = dir
      }}
      onTouchEnd={() => {
        touchInput.current.ascend = 0
      }}
      onTouchCancel={() => {
        touchInput.current.ascend = 0
      }}
      aria-label={label}
    >
      {dir > 0 ? '\u25B2' : '\u25BC'}
    </button>
  )
}

export default function MobileControls({ touchInput, activateSignal }) {
  return (
    <>
      <LookArea
        onDelta={(dx, dy) => {
          touchInput.current.look.x += dx
          touchInput.current.look.y += dy
        }}
      />
      <Joystick onChange={(vec) => { touchInput.current.move = vec }} />
      <div className="ascend-controls">
        <AscendButton label="Rise" dir={1} touchInput={touchInput} />
        <AscendButton label="Dive" dir={-1} touchInput={touchInput} />
      </div>
      <button
        type="button"
        className="interact-btn glass-panel"
        onTouchStart={(e) => {
          e.preventDefault()
          activateSignal.current = true
        }}
      >
        Interact
      </button>
    </>
  )
}

import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import { loadJSON, saveJSON } from './storage.js'

const SettingsContext = createContext(null)

const DEFAULTS = {
  sound: false,
  graphicsQuality: 'medium',
  motionEffects: true,
  learningMode: false,
  showHUD: true,
  creatureLabels: true
}

// A soft two-oscillator hum through a lowpass filter — not a sample, so
// there's no asset to fail to load. AudioContext is only ever created
// while `enabled` is true, and `enabled` only becomes true from the
// settings checkbox's own onChange handler, which is itself a user
// gesture — that satisfies autoplay policy without any extra plumbing.
function useAmbientSound(enabled) {
  const audioRef = useRef(null)

  useEffect(() => {
    if (!enabled) return undefined

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (!AudioCtx) return undefined
      const ctx = new AudioCtx()
      const gain = ctx.createGain()
      gain.gain.value = 0.05
      const filter = ctx.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 220

      const osc1 = ctx.createOscillator()
      osc1.type = 'sine'
      osc1.frequency.value = 55
      const osc2 = ctx.createOscillator()
      osc2.type = 'sine'
      osc2.frequency.value = 58

      osc1.connect(filter)
      osc2.connect(filter)
      filter.connect(gain)
      gain.connect(ctx.destination)
      osc1.start()
      osc2.start()

      audioRef.current = { ctx, oscillators: [osc1, osc2] }
    } catch (e) {
      // AudioContext unsupported or blocked in this browser — sound stays off
      audioRef.current = null
    }

    return () => {
      if (audioRef.current) {
        try {
          audioRef.current.oscillators.forEach((o) => o.stop())
          audioRef.current.ctx.close()
        } catch (e) {
          // best-effort cleanup only
        }
        audioRef.current = null
      }
    }
  }, [enabled])
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => ({ ...DEFAULTS, ...loadJSON('settings', {}) }))

  useAmbientSound(settings.sound)

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value }
      saveJSON('settings', next)
      return next
    })
  }, [])

  return <SettingsContext.Provider value={{ settings, updateSetting }}>{children}</SettingsContext.Provider>
}

export function useSettings() {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}

export default function SettingsPanel({ onClose }) {
  const { settings, updateSetting } = useSettings()

  return (
    <div className="settings-panel glass-panel">
      <div className="settings-header">
        <h2>Settings</h2>
        <button type="button" className="info-panel-close" onClick={onClose} aria-label="Close settings">
          ✕
        </button>
      </div>

      <label className="settings-row">
        <span>Sound</span>
        <input type="checkbox" checked={settings.sound} onChange={(e) => updateSetting('sound', e.target.checked)} />
      </label>

      <label className="settings-row">
        <span>Motion effects</span>
        <input
          type="checkbox"
          checked={settings.motionEffects}
          onChange={(e) => updateSetting('motionEffects', e.target.checked)}
        />
      </label>

      <label className="settings-row">
        <span>Learning mode</span>
        <input
          type="checkbox"
          checked={settings.learningMode}
          onChange={(e) => updateSetting('learningMode', e.target.checked)}
        />
      </label>

      <label className="settings-row">
        <span>Show HUD</span>
        <input
          type="checkbox"
          checked={settings.showHUD}
          onChange={(e) => updateSetting('showHUD', e.target.checked)}
        />
      </label>

      <label className="settings-row">
        <span>Creature labels</span>
        <input
          type="checkbox"
          checked={settings.creatureLabels}
          onChange={(e) => updateSetting('creatureLabels', e.target.checked)}
        />
      </label>

      <div className="settings-row settings-row-select">
        <span>Graphics quality</span>
        <select value={settings.graphicsQuality} onChange={(e) => updateSetting('graphicsQuality', e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </div>
  )
}

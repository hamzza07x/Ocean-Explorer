import { createContext, useContext, useState, useCallback, useRef } from 'react'
import { loadJSON, saveJSON } from './storage.js'

const DiscoveryContext = createContext(null)

export function DiscoveryProvider({ children }) {
  const [discovered, setDiscovered] = useState(() => loadJSON('discovered', {}))
  const [journal, setJournal] = useState(() => loadJSON('journal', {}))
  const [lastDiscoveredName, setLastDiscoveredName] = useState(null)
  const clearTimer = useRef(null)

  const markDiscovered = useCallback((id, name) => {
    setDiscovered((prev) => {
      if (prev[id]) return prev
      const next = { ...prev, [id]: true }
      saveJSON('discovered', next)
      setLastDiscoveredName(name || id)
      if (clearTimer.current) clearTimeout(clearTimer.current)
      clearTimer.current = setTimeout(() => setLastDiscoveredName(null), 3200)
      return next
    })
  }, [])

  const isDiscovered = useCallback((id) => Boolean(discovered[id]), [discovered])

  const saveNote = useCallback((id, text) => {
    setJournal((prev) => {
      const next = { ...prev, [id]: text }
      saveJSON('journal', next)
      return next
    })
  }, [])

  const deleteNote = useCallback((id) => {
    setJournal((prev) => {
      if (!(id in prev)) return prev
      const next = { ...prev }
      delete next[id]
      saveJSON('journal', next)
      return next
    })
  }, [])

  const value = {
    discovered,
    discoveredCount: Object.keys(discovered).length,
    journal,
    markDiscovered,
    isDiscovered,
    saveNote,
    deleteNote,
    lastDiscoveredName
  }

  return <DiscoveryContext.Provider value={value}>{children}</DiscoveryContext.Provider>
}

export function useDiscovery() {
  const ctx = useContext(DiscoveryContext)
  if (!ctx) throw new Error('useDiscovery must be used within DiscoveryProvider')
  return ctx
}

import { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { loadJSON, saveJSON } from './storage.js'
import { missions, achievements, deriveExplorationStats } from './data.js'

const DiscoveryContext = createContext(null)

const NOTICE_MS = 3200

export function DiscoveryProvider({ children }) {
  const [discovered, setDiscovered] = useState(() => loadJSON('discovered', {}))
  const [journal, setJournal] = useState(() => loadJSON('journal', {}))
  const [maxDepthReached, setMaxDepthReached] = useState(() => loadJSON('maxDepth', 0))
  const [visitedZones, setVisitedZones] = useState(() => loadJSON('visitedZones', []))

  const [lastDiscoveredName, setLastDiscoveredName] = useState(null)
  const [lastMissionComplete, setLastMissionComplete] = useState(null)
  const [lastAchievementUnlocked, setLastAchievementUnlocked] = useState(null)

  const discoveryTimer = useRef(null)
  const missionTimer = useRef(null)
  const achievementTimer = useRef(null)
  const completedMissionsRef = useRef(new Set(loadJSON('completedMissions', [])))
  const unlockedAchievementsRef = useRef(new Set(loadJSON('unlockedAchievements', [])))

  const markDiscovered = useCallback((id, name) => {
    setDiscovered((prev) => {
      if (prev[id]) return prev
      const next = { ...prev, [id]: true }
      saveJSON('discovered', next)
      setLastDiscoveredName(name || id)
      if (discoveryTimer.current) clearTimeout(discoveryTimer.current)
      discoveryTimer.current = setTimeout(() => setLastDiscoveredName(null), NOTICE_MS)
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

  const recordDepth = useCallback((depth) => {
    setMaxDepthReached((prev) => {
      if (depth <= prev) return prev
      saveJSON('maxDepth', depth)
      return depth
    })
  }, [])

  const recordZoneVisit = useCallback((zoneId) => {
    setVisitedZones((prev) => {
      if (prev.includes(zoneId)) return prev
      const next = [...prev, zoneId]
      saveJSON('visitedZones', next)
      return next
    })
  }, [])

  const resetAll = useCallback(() => {
    setDiscovered({})
    setJournal({})
    setMaxDepthReached(0)
    setVisitedZones([])
    completedMissionsRef.current = new Set()
    unlockedAchievementsRef.current = new Set()
    saveJSON('discovered', {})
    saveJSON('journal', {})
    saveJSON('maxDepth', 0)
    saveJSON('visitedZones', [])
    saveJSON('completedMissions', [])
    saveJSON('unlockedAchievements', [])
  }, [])

  const stats = useMemo(
    () => deriveExplorationStats({ discovered, visitedZones, maxDepthReached, journal }),
    [discovered, visitedZones, maxDepthReached, journal]
  )

  // Missions and achievements are computed from `stats`, not tracked as
  // their own separate progress counters — this just watches for the
  // moment any of them newly becomes true and fires a one-time notice,
  // recording that it already has via the ref sets above so it doesn't
  // re-fire every time stats recomputes.
  useEffect(() => {
    missions.forEach((m) => {
      if (m.check(stats) && !completedMissionsRef.current.has(m.id)) {
        completedMissionsRef.current.add(m.id)
        saveJSON('completedMissions', [...completedMissionsRef.current])
        setLastMissionComplete(m.title)
        if (missionTimer.current) clearTimeout(missionTimer.current)
        missionTimer.current = setTimeout(() => setLastMissionComplete(null), NOTICE_MS)
      }
    })
    achievements.forEach((a) => {
      if (a.check(stats) && !unlockedAchievementsRef.current.has(a.id)) {
        unlockedAchievementsRef.current.add(a.id)
        saveJSON('unlockedAchievements', [...unlockedAchievementsRef.current])
        setLastAchievementUnlocked(a.title)
        if (achievementTimer.current) clearTimeout(achievementTimer.current)
        achievementTimer.current = setTimeout(() => setLastAchievementUnlocked(null), NOTICE_MS)
      }
    })
  }, [stats])

  const value = {
    discovered,
    discoveredCount: Object.keys(discovered).length,
    journal,
    markDiscovered,
    isDiscovered,
    saveNote,
    deleteNote,
    recordDepth,
    recordZoneVisit,
    resetAll,
    stats,
    lastDiscoveredName,
    lastMissionComplete,
    lastAchievementUnlocked
  }

  return <DiscoveryContext.Provider value={value}>{children}</DiscoveryContext.Provider>
}

export function useDiscovery() {
  const ctx = useContext(DiscoveryContext)
  if (!ctx) throw new Error('useDiscovery must be used within DiscoveryProvider')
  return ctx
}

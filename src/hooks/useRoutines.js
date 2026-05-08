import { useState, useEffect, useCallback } from 'react'
import { CONFIG } from '../config/config'
import { getTodayKey } from '../utils/dateUtils'
import { getCurrentScheduleMode } from '../utils/scheduleUtils'

const STORAGE_KEY = 'fam_dash_routines'

export function useRoutines(now) {
  const [completed, setCompleted] = useState({})
  const todayKey = getTodayKey(now)

  // Load from localStorage, resetting if date changed
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    const stored = raw ? JSON.parse(raw) : {}
    if (stored.date === todayKey) {
      setCompleted(stored.completed ?? {})
    } else {
      setCompleted({})
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey, completed: {} }))
    }
  }, [todayKey])

  const toggleRoutine = useCallback((childName, routineId) => {
    const key = `${childName}__${routineId}`
    setCompleted(prev => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey, completed: next }))
      return next
    })
  }, [todayKey])

  const mode = getCurrentScheduleMode(now, CONFIG)

  const routinesByChild = {}
  CONFIG.children.forEach(child => {
    routinesByChild[child.name] = (CONFIG.routines[child.name] ?? [])
      .filter(r => r.schedules.includes(mode))
      .map(r => ({ ...r, completed: !!completed[`${child.name}__${r.id}`] }))
  })

  return { routinesByChild, toggleRoutine, mode }
}

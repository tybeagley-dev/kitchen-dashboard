import { useState, useEffect, useCallback } from 'react'
import { CONFIG } from '../config/config'
import { getTodayKey } from '../utils/dateUtils'
import { getCurrentScheduleMode } from '../utils/scheduleUtils'

const STORAGE_KEY  = 'fam_dash_routines'
const POLL_MS      = 60 * 1000

function sheetsGet(params) {
  if (!CONFIG.appsScriptUrl) return Promise.resolve(null)
  const url = new URL(CONFIG.appsScriptUrl)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  url.searchParams.set('_t', Date.now())
  return fetch(url.toString()).then(r => r.json()).catch(() => null)
}

export function useRoutines(now) {
  const [completed, setCompleted] = useState({})
  const todayKey = getTodayKey(now)

  // Instant load from localStorage
  useEffect(() => {
    const raw    = localStorage.getItem(STORAGE_KEY)
    const stored = raw ? JSON.parse(raw) : {}
    if (stored.date === todayKey) {
      setCompleted(stored.completed ?? {})
    } else {
      setCompleted({})
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey, completed: {} }))
    }
  }, [todayKey])

  // Hydrate from Sheets on mount + poll for cross-device sync
  useEffect(() => {
    if (!CONFIG.appsScriptUrl) return

    async function hydrate() {
      const data = await sheetsGet({ action: 'getRoutineState', date: todayKey })
      if (!data?.completed) return
      setCompleted(data.completed)
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey, completed: data.completed }))
    }

    hydrate()
    const id = setInterval(hydrate, POLL_MS)
    return () => clearInterval(id)
  }, [todayKey])

  const toggleRoutine = useCallback((childName, routineId) => {
    const key = `${childName}__${routineId}`
    setCompleted(prev => {
      const next = { ...prev, [key]: !prev[key] }
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey, completed: next }))
      sheetsGet({ action: 'setRoutineItem', date: todayKey, key, value: next[key] })
      return next
    })
  }, [todayKey])

  const mode = getCurrentScheduleMode(now, CONFIG)

  const routinesByChild = {}
  CONFIG.children.forEach(child => {
    routinesByChild[child.name] = (CONFIG.routines[child.name] ?? [])
      .filter(r => {
        if (!r.schedules.includes(mode)) return false
        if (!r.time) return true
        const isEvening = now.getHours() >= 12
        return r.time === (isEvening ? 'evening' : 'morning')
      })
      .map(r => ({ ...r, completed: !!completed[`${child.name}__${r.id}`] }))
  })

  return { routinesByChild, toggleRoutine, mode }
}

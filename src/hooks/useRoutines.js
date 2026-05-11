import { useState, useEffect, useCallback } from 'react'
import { CONFIG } from '../config/config'
import { getTodayKey } from '../utils/dateUtils'
import { getCurrentScheduleMode } from '../utils/scheduleUtils'

const STORAGE_KEY = 'fam_dash_routines'
const POLL_MS     = 60 * 1000

function sheetsGet(params) {
  if (!CONFIG.appsScriptUrl) return Promise.resolve(null)
  const url = new URL(CONFIG.appsScriptUrl)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  url.searchParams.set('_t', Date.now())
  return fetch(url.toString()).then(r => r.json()).catch(() => null)
}

function configDefs() {
  const all = []
  CONFIG.children.forEach(child => {
    (CONFIG.routines[child.name] ?? []).forEach(r => {
      all.push({ ...r, child: child.name })
    })
  })
  return all
}

export function useRoutines(now) {
  const [completed,   setCompleted]   = useState({})
  const [routineDefs, setRoutineDefs] = useState(configDefs)
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

  // Hydrate completion state from Sheets on mount + poll
  useEffect(() => {
    if (!CONFIG.appsScriptUrl) return

    async function hydrate() {
      const data = await sheetsGet({ action: 'getRoutineState', date: todayKey })
      if (!data?.completed) return
      setCompleted(prev => {
        // Merge: Sheets is the base, but locally-true values take precedence so a
        // recent toggle that hasn't landed in Sheets yet doesn't get wiped.
        const merged = { ...data.completed }
        Object.entries(prev).forEach(([k, v]) => { if (v) merged[k] = true })
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey, completed: merged }))
        return merged
      })
    }

    hydrate()
    const id = setInterval(hydrate, POLL_MS)
    return () => clearInterval(id)
  }, [todayKey])

  // Load routine definitions from Sheets on mount; fall back to config.js
  useEffect(() => {
    async function loadDefs() {
      const data = await sheetsGet({ action: 'getRoutineDefs' })
      if (Array.isArray(data) && data.length > 0) setRoutineDefs(data)
    }
    loadDefs()
  }, [])

  const toggleRoutine = useCallback((childName, routineId) => {
    const key = `${childName}__${routineId}`

    // Read current value directly from localStorage to avoid stale closure
    const raw   = localStorage.getItem(STORAGE_KEY)
    const local = raw ? JSON.parse(raw) : {}
    const curr  = local.date === todayKey ? (local.completed ?? {}) : {}
    const nextValue = !curr[key]

    // Optimistic local update so UI responds instantly
    const optimistic = { ...curr, [key]: nextValue }
    setCompleted(optimistic)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey, completed: optimistic }))

    // Write to Sheets, then immediately re-fetch to confirm — so other devices
    // polling Sheets always see fully settled state, never a write-in-flight.
    sheetsGet({ action: 'setRoutineItem', date: todayKey, key, value: nextValue })
      .then(() => sheetsGet({ action: 'getRoutineState', date: todayKey }))
      .then(data => {
        if (!data?.completed) return
        setCompleted(prev => {
          const merged = { ...data.completed }
          Object.entries(prev).forEach(([k, v]) => { if (v) merged[k] = true })
          localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey, completed: merged }))
          return merged
        })
      })
      .catch(() => { /* local optimistic state stands on network failure */ })
  }, [todayKey])

  const mode = getCurrentScheduleMode(now, CONFIG)

  const routinesByChild = {}
  CONFIG.children.forEach(child => {
    const childDefs = routineDefs.filter(r => r.child === child.name)
    routinesByChild[child.name] = childDefs
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

// ── Parent panel admin ────────────────────────────────────────────────────────

export function useRoutineDefs() {
  const [defs,    setDefs]    = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const data = await sheetsGet({ action: 'getRoutineDefs' })
    setDefs(Array.isArray(data) ? data : [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return { defs, loading, reload: load }
}

export async function adminAddRoutineDef(data) {
  return sheetsGet({
    action:    'addRoutineDef',
    child:     encodeURIComponent(data.child),
    label:     encodeURIComponent(data.label),
    icon:      encodeURIComponent(data.icon),
    schedules: encodeURIComponent(data.schedules.join(',')),
    time:      data.time || '',
    sortOrder: data.sortOrder ?? 0,
  })
}

export async function adminEditRoutineDef(data) {
  return sheetsGet({
    action:    'editRoutineDef',
    id:        data.id,
    child:     encodeURIComponent(data.child),
    label:     encodeURIComponent(data.label),
    icon:      encodeURIComponent(data.icon),
    schedules: encodeURIComponent(data.schedules.join(',')),
    time:      data.time || '',
    sortOrder: data.sortOrder ?? 0,
  })
}

export async function adminDeleteRoutineDef(id) {
  return sheetsGet({ action: 'deleteRoutineDef', id })
}

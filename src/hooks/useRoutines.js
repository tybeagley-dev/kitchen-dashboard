import { useState, useEffect, useCallback, useRef } from 'react'
import { CONFIG } from '../config/config'
import { getTodayKey } from '../utils/dateUtils'
import { getCurrentScheduleMode } from '../utils/scheduleUtils'

const STORAGE_KEY = 'fam_dash_routines'
const POLL_MS     = 20 * 1000

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
  const [loading,     setLoading]     = useState(true)
  const todayKey = getTodayKey(now)

  // Tracks writes that are in-flight so re-fetches can't overwrite them.
  // Keyed by routine key, value is the optimistic boolean.
  const pendingWrites = useRef({})

  function applySheets(sheetsCompleted) {
    // Always overlay any still-in-flight optimistic writes on top of Sheets data.
    const merged = { ...sheetsCompleted, ...pendingWrites.current }
    setCompleted(merged)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey, completed: merged }))
  }

  // Sheets is the source of truth — fetch on mount and poll every 20s.
  // No localStorage trust on load; localStorage is only a within-session write cache.
  useEffect(() => {
    if (!CONFIG.appsScriptUrl) { setLoading(false); return }

    async function hydrate() {
      const data = await sheetsGet({ action: 'getRoutineState', date: todayKey })
      applySheets(data?.completed ?? {})
      setLoading(false)
    }

    setLoading(true)
    hydrate()
    const id = setInterval(hydrate, POLL_MS)
    return () => clearInterval(id)
  }, [todayKey]) // eslint-disable-line react-hooks/exhaustive-deps

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

    // Read current value from localStorage cache (avoids stale closure),
    // then overlay any pending in-flight writes so rapid taps stay coherent.
    const raw   = localStorage.getItem(STORAGE_KEY)
    const local = raw ? JSON.parse(raw) : {}
    const curr  = local.date === todayKey ? (local.completed ?? {}) : {}
    const merged = { ...curr, ...pendingWrites.current }
    const nextValue = !merged[key]

    // Register this write as in-flight before the async chain starts.
    pendingWrites.current = { ...pendingWrites.current, [key]: nextValue }

    // Optimistic local update for instant UI response
    const optimistic = { ...curr, ...pendingWrites.current }
    setCompleted(optimistic)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: todayKey, completed: optimistic }))

    // Write to Sheets, then re-fetch so Sheets is confirmed before other devices poll.
    // Remove the key from pendingWrites only after the round-trip completes.
    sheetsGet({ action: 'setRoutineItem', date: todayKey, key, value: nextValue })
      .then(() => sheetsGet({ action: 'getRoutineState', date: todayKey }))
      .then(data => {
        const { [key]: _done, ...remaining } = pendingWrites.current
        pendingWrites.current = remaining
        applySheets(data?.completed ?? {})
      })
      .catch(() => {
        const { [key]: _err, ...remaining } = pendingWrites.current
        pendingWrites.current = remaining
      })
  }, [todayKey]) // eslint-disable-line react-hooks/exhaustive-deps

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

  return { routinesByChild, toggleRoutine, mode, loading }
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

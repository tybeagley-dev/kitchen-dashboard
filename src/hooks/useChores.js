import { useState, useEffect, useCallback } from 'react'
import { CONFIG } from '../config/config'
import { getTodayKey } from '../utils/dateUtils'

const BUCKS_KEY      = 'fam_dash_bucks'
const CHORE_DONE_KEY = 'fam_dash_chore_done'

function getLocalBucks() {
  return JSON.parse(localStorage.getItem(BUCKS_KEY) ?? '{}')
}

function saveLocalBucks(obj) {
  localStorage.setItem(BUCKS_KEY, JSON.stringify(obj))
}

function sheetsGet(params) {
  if (!CONFIG.appsScriptUrl) return Promise.resolve(null)
  const url = new URL(CONFIG.appsScriptUrl)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  url.searchParams.set('_t', Date.now())
  return fetch(url.toString()).then(r => r.json()).catch(() => null)
}

// ── Chore pool ────────────────────────────────────────────────────────────────

export function useChores() {
  const [chores, setChores] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    if (!CONFIG.appsScriptUrl) {
      setChores(CONFIG.demoChores)
      setLoading(false)
      return
    }
    try {
      const data = await sheetsGet({ action: 'getChores' })
      setChores(data ?? CONFIG.demoChores)
    } catch {
      setChores(CONFIG.demoChores)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { chores, loading, reload: load }
}

// ── Beagley Bucks ─────────────────────────────────────────────────────────────

export function useChorePoints(childName) {
  const [bucks, setBucks] = useState(() => getLocalBucks()[childName] ?? 0)

  // Hydrate from Sheets on mount
  useEffect(() => {
    async function load() {
      const data = await sheetsGet({ action: 'getBucks' })
      if (!data) return
      const row = data.find(d => d.child === childName)
      if (row) {
        setBucks(row.bucks)
        const local = getLocalBucks()
        local[childName] = row.bucks
        saveLocalBucks(local)
      }
    }
    load()
  }, [childName])

  const recordCompletion = useCallback(async (child, choreId, bucksEarned) => {
    setBucks(b => {
      const next = b + bucksEarned
      const local = getLocalBucks()
      local[child] = next
      saveLocalBucks(local)
      return next
    })

    const result = await sheetsGet({ action: 'completeChore', child, choreId })
    return result ?? { success: true, bucksEarned }
  }, [])

  const adjustBucks = useCallback((delta) => {
    setBucks(b => {
      const next = Math.max(0, b + delta)
      const local = getLocalBucks()
      local[childName] = next
      saveLocalBucks(local)
      return next
    })

    sheetsGet({ action: 'adjustBucks', child: childName, delta })
  }, [childName])

  return { bucks, recordCompletion, adjustBucks }
}

// ── Chore-as-routine tracking ─────────────────────────────────────────────────

export function markChoreToday(childName) {
  const today = getTodayKey(new Date())
  const raw   = localStorage.getItem(CHORE_DONE_KEY)
  const stored = raw ? JSON.parse(raw) : {}
  const record = stored.date === today ? stored : { date: today, children: {} }
  record.children[childName] = true
  localStorage.setItem(CHORE_DONE_KEY, JSON.stringify(record))
  window.dispatchEvent(new CustomEvent('fam_chore_done_update'))
}

export function useChoreCompletedToday(childName) {
  function read() {
    const today = getTodayKey(new Date())
    const raw   = localStorage.getItem(CHORE_DONE_KEY)
    if (!raw) return false
    const stored = JSON.parse(raw)
    return stored.date === today && !!stored.children?.[childName]
  }

  const [done, setDone] = useState(read)

  useEffect(() => {
    function onUpdate() { setDone(read()) }
    window.addEventListener('fam_chore_done_update', onUpdate)
    return () => window.removeEventListener('fam_chore_done_update', onUpdate)
  }, [childName])

  return done
}

// ── Chore admin (parent panel) ────────────────────────────────────────────

export async function adminAddChore(data) {
  return sheetsGet({
    action:       'addChore',
    label:        encodeURIComponent(data.label),
    bucks:        data.bucks,
    icon:         encodeURIComponent(data.icon),
    days:         encodeURIComponent(data.days.join(',')),
    frequency:    data.frequency,
    required:     data.required ? 'true' : 'false',
    instructions: encodeURIComponent(data.instructions.filter(Boolean).join('|')),
  })
}

export async function adminGetAllChores() {
  if (!CONFIG.appsScriptUrl) return CONFIG.demoChores
  const data = await sheetsGet({ action: 'getChores', includeInactive: 'true' })
  return data ?? CONFIG.demoChores
}

export async function adminEditChore(data) {
  return sheetsGet({
    action:       'editChore',
    id:           data.id,
    label:        encodeURIComponent(data.label),
    bucks:        data.bucks,
    icon:         encodeURIComponent(data.icon),
    active:       data.active !== false ? 'true' : 'false',
    days:         encodeURIComponent(data.days.join(',')),
    frequency:    data.frequency,
    required:     data.required ? 'true' : 'false',
    instructions: encodeURIComponent(data.instructions.filter(Boolean).join('|')),
  })
}

export async function adminDeleteChore(id) {
  return sheetsGet({ action: 'deleteChore', id })
}

import { useState, useEffect } from 'react'
import { getTodayKey } from '../utils/dateUtils'
import { CONFIG } from '../config/config'
import { hydrateWeeklyFromHistory, isChoreAvailableThisWeek } from './useChoreFrequency'

const ASSIGNED_KEY = 'fam_dash_assigned_chores'
const EVENT        = 'fam_assigned_update'
const REFETCH_EVENT = 'fam_refetch_chores'
const POLL_MS      = 20 * 1000

function getToday() { return getTodayKey(new Date()) }
function todayName() { return new Date().toLocaleDateString('en-US', { weekday: 'long' }) }

const DAY_INDEX = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 }

// True if any of the chore's designated days has arrived this week (Sun–Sat).
function choreStartedThisWeek(days) {
  const todayIdx = new Date().getDay()
  return days.some(d => (DAY_INDEX[d] ?? 7) <= todayIdx)
}

async function sheetsGet(params) {
  if (!CONFIG.appsScriptUrl) return null
  const url = new URL(CONFIG.appsScriptUrl)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  url.searchParams.set('_t', Date.now())
  try { return await fetch(url.toString()).then(r => r.json()) } catch { return null }
}

function loadAssignments() {
  const raw = localStorage.getItem(ASSIGNED_KEY)
  if (!raw) return {}
  const stored = JSON.parse(raw)
  return stored.date === getToday() ? (stored.assignments ?? {}) : {}
}

function saveAssignments(assignments) {
  localStorage.setItem(ASSIGNED_KEY, JSON.stringify({ date: getToday(), assignments }))
  window.dispatchEvent(new CustomEvent(EVENT))
}

// Compute the full chore list for a child from Sheets data + chore definitions.
// Required chores come from definitions (deterministic on any device).
// Spin chores come from the Sheets History for today.
function buildFromSheets(childName, todayEntries, weekCompleted, chores) {
  const weekDone = new Set(weekCompleted[childName] ?? [])

  const required = chores
    .filter(c =>
      c.required &&
      c.active !== false &&
      (c.days.length === 0 || choreStartedThisWeek(c.days)) &&
      !weekDone.has(c.id)
    )
    .map(c => ({
      ...c,
      completed: todayEntries[c.id]?.status === 'completed' || false,
      pending:   todayEntries[c.id]?.status === 'pending_approval' || false,
    }))

  const spin = Object.entries(todayEntries)
    .map(([choreId, entry]) => {
      const def = chores.find(c => c.id === choreId) ?? {}
      return {
        id:           choreId,
        label:        entry.choreLabel,
        bucks:        entry.bucks,
        icon:         def.icon ?? '',
        required:     def.required ?? false,
        instructions: def.instructions ?? [],
        completed:    entry.status === 'completed',
        pending:      entry.status === 'pending_approval',
        acceptedAt:   entry.acceptedAt ?? null,
      }
    })
    .filter(c => !c.required)

  return [...required, ...spin]
}

export function getClaimedChoreIds(childName) {
  const all = loadAssignments()
  const ids = new Set()
  Object.entries(all).forEach(([name, chores]) => {
    chores.filter(c => !c.required).forEach(c => {
      if (name !== childName || c.completed) ids.add(c.id)
    })
  })
  return ids
}

// Optimistic local assignment for spin chores (still needed for instant UI response)
export function assignChores(childName, newChores) {
  const all        = loadAssignments()
  const existing   = all[childName] ?? []
  const existingIds = new Set(existing.map(c => c.id))
  const toAdd      = newChores.filter(c => !existingIds.has(c.id))
  if (!toAdd.length) return
  const now = new Date().toISOString()
  all[childName] = [...existing, ...toAdd.map(c => ({ ...c, acceptedAt: c.acceptedAt ?? now }))]
  saveAssignments(all)
}

export function markChoreAsPending(childName, choreId) {
  const all = loadAssignments()
  if (!all[childName]) return
  all[childName] = all[childName].map(c =>
    c.id === choreId ? { ...c, pending: true } : c
  )
  saveAssignments(all)
}

export function completeAssignedChore(childName, choreId) {
  const all = loadAssignments()
  if (!all[childName]) return
  all[childName] = all[childName].map(c =>
    c.id === choreId ? { ...c, completed: true } : c
  )
  saveAssignments(all)
}

// Write spin chore acceptances to Sheets — returns a Promise so callers can await.
export function acceptChoresToSheets(child, chores) {
  return Promise.all(chores.map(c =>
    sheetsGet({
      action:     'acceptChore',
      child:      child.name,
      choreId:    c.id,
      choreLabel: c.label,
      bucks:      c.bucks,
    })
  ))
}

export function submitApprovalRequest(child, choreId, choreLabel, bucks) {
  return sheetsGet({
    action:     'requestApproval',
    child:      child.name,
    choreId,
    choreLabel: encodeURIComponent(choreLabel),
    bucks,
  })
}

// Dispatch this after any Sheets write to trigger an immediate re-fetch on all hook instances.
export function triggerChoreRefetch() {
  window.dispatchEvent(new Event(REFETCH_EVENT))
}

export function useAssignedChores(childName, chores = []) {
  const [assignedChores, setAssignedChores] = useState([])
  const [loading, setLoading]               = useState(true)

  // Reflect optimistic local updates instantly
  useEffect(() => {
    function onUpdate() { setAssignedChores(loadAssignments()[childName] ?? []) }
    window.addEventListener(EVENT, onUpdate)
    return () => window.removeEventListener(EVENT, onUpdate)
  }, [childName])

  // Sheets is the source of truth — fetch on mount, poll every 20s, and on demand
  useEffect(() => {
    if (!chores.length) return

    if (!CONFIG.appsScriptUrl) {
      setLoading(false)
      return
    }

    async function hydrate() {
      const data = await sheetsGet({ action: 'getChoreState', date: getToday() })
      if (!data) { setLoading(false); return }
      hydrateWeeklyFromHistory(data.weekCompleted ?? {}, chores)
      const built = buildFromSheets(childName, data.today?.[childName] ?? {}, data.weekCompleted ?? {}, chores)
      const all = loadAssignments()
      // Preserve local pending flags and acceptedAt that Sheets may not have caught up with yet.
      // Only clear pending once Sheets confirms the chore is completed (approved).
      const localChores = all[childName] ?? []
      const localPending = new Set(localChores.filter(c => c.pending && !c.completed).map(c => c.id))
      const localMap = Object.fromEntries(localChores.map(c => [c.id, c]))
      all[childName] = built.map(c => ({
        ...c,
        pending:    c.pending || (localPending.has(c.id) && !c.completed),
        acceptedAt: c.acceptedAt ?? localMap[c.id]?.acceptedAt ?? null,
      }))
      saveAssignments(all)
      setLoading(false)
    }

    hydrate()
    const poll    = setInterval(hydrate, POLL_MS)
    const onForce = () => hydrate()
    window.addEventListener(REFETCH_EVENT, onForce)

    return () => {
      clearInterval(poll)
      window.removeEventListener(REFETCH_EVENT, onForce)
    }
  }, [childName, chores.length]) // eslint-disable-line react-hooks/exhaustive-deps

  return { chores: assignedChores, loading }
}

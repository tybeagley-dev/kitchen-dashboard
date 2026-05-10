import { useState, useEffect } from 'react'
import { getTodayKey } from '../utils/dateUtils'
import { CONFIG } from '../config/config'
import { hydrateWeeklyFromHistory } from './useChoreFrequency'

const ASSIGNED_KEY = 'fam_dash_assigned_chores'
const EVENT        = 'fam_assigned_update'
const POLL_MS      = 60 * 1000

function getToday() { return getTodayKey(new Date()) }

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

// Reconcile local state with Sheets truth. Required chores stay local (auto-assigned
// by ChildCard) but their completed flag is updated from Sheets. Spin chores are
// rebuilt entirely from Sheets — if a parent deleted History rows, they disappear.
function mergeSheetState(childName, todayEntries, chores) {
  const all = loadAssignments()
  const existing = all[childName] ?? []

  const required = existing
    .filter(c => c.required)
    .map(c => ({
      ...c,
      completed: todayEntries[c.id]?.status === 'completed' || false,
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
      }
    })
    .filter(c => !c.required)

  all[childName] = [...required, ...spin]
  saveAssignments(all)
}

export function getClaimedChoreIds(childName) {
  const all = loadAssignments()
  const ids = new Set()
  Object.entries(all).forEach(([name, chores]) => {
    chores.filter(c => !c.required).forEach(c => {
      // Exclude other kids' claimed chores + this child's already-completed chores
      if (name !== childName || c.completed) ids.add(c.id)
    })
  })
  return ids
}

// Replace only incomplete chores; keep completed ones (used for required auto-assign)
export function assignChores(childName, newChores) {
  const all      = loadAssignments()
  const existing = all[childName] ?? []
  const kept     = existing.filter(c => c.completed)
  all[childName] = [...kept, ...newChores]
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

// Fire-and-forget: write accepted chores to Sheets so other devices can see them
export function acceptChoresToSheets(child, chores) {
  chores.forEach(c =>
    sheetsGet({
      action:     'acceptChore',
      child:      child.name,
      choreId:    c.id,
      choreLabel: c.label,
      bucks:      c.bucks,
    })
  )
}

export function useAssignedChores(childName, chores = []) {
  const [assignedChores, setAssignedChores] = useState(() => loadAssignments()[childName] ?? [])

  useEffect(() => {
    function onUpdate() { setAssignedChores(loadAssignments()[childName] ?? []) }
    window.addEventListener(EVENT, onUpdate)
    return () => window.removeEventListener(EVENT, onUpdate)
  }, [childName])

  // Hydrate from Sheets on mount + poll for cross-device sync.
  // Waits for chores list to load before starting so mergeSheetState can join icons/instructions.
  useEffect(() => {
    if (!CONFIG.appsScriptUrl || !chores.length) return

    async function hydrate() {
      const data = await sheetsGet({ action: 'getChoreState', date: getToday() })
      if (!data) return
      hydrateWeeklyFromHistory(data.weekCompleted ?? {}, chores)
      mergeSheetState(childName, data.today?.[childName] ?? {}, chores)
    }

    hydrate()
    const id = setInterval(hydrate, POLL_MS)
    return () => clearInterval(id)
  }, [childName, chores.length]) // eslint-disable-line react-hooks/exhaustive-deps

  return assignedChores
}

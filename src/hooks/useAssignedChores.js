import { useState, useEffect } from 'react'
import { getTodayKey } from '../utils/dateUtils'

const ASSIGNED_KEY = 'fam_dash_assigned_chores'
const EVENT        = 'fam_assigned_update'

function getToday() { return getTodayKey(new Date()) }

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

// IDs assigned to any child *other* than excludeChildName (for pool filtering)
export function getClaimedChoreIds(excludeChildName) {
  const all = loadAssignments()
  const ids = new Set()
  Object.entries(all).forEach(([name, chores]) => {
    if (name !== excludeChildName) chores.filter(c => !c.required).forEach(c => ids.add(c.id))
  })
  return ids
}

// Replace only incomplete chores; keep completed ones
export function assignChores(childName, newChores) {
  const all  = loadAssignments()
  const existing = all[childName] ?? []
  const kept = existing.filter(c => c.completed)
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

export function useAssignedChores(childName) {
  const [chores, setChores] = useState(() => loadAssignments()[childName] ?? [])

  useEffect(() => {
    function onUpdate() {
      setChores(loadAssignments()[childName] ?? [])
    }
    window.addEventListener(EVENT, onUpdate)
    return () => window.removeEventListener(EVENT, onUpdate)
  }, [childName])

  return chores
}

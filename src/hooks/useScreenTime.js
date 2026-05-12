import { useState, useEffect, useCallback } from 'react'
import { CONFIG } from '../config/config'

const BALANCE_KEY    = 'fam_dash_screentime'
const TIMER_KEY      = 'fam_dash_timer'
const SHEETS_POLL_MS = 20 * 1000

function loadBalance() {
  try { return JSON.parse(localStorage.getItem(BALANCE_KEY) ?? '{}') } catch { return {} }
}

function saveBalance(obj) {
  localStorage.setItem(BALANCE_KEY, JSON.stringify(obj))
  window.dispatchEvent(new Event('fam_balance_update'))
}

function loadTimers() {
  try {
    const raw = JSON.parse(localStorage.getItem(TIMER_KEY) ?? '{}')
    if (!raw || typeof raw !== 'object') return {}
    // Migrate old single-timer format { child, endTime, … } → { [child]: { … } }
    if (typeof raw.child === 'string') return { [raw.child]: raw }
    return raw
  } catch { return {} }
}

function saveTimers(obj) {
  localStorage.setItem(TIMER_KEY, JSON.stringify(obj))
  window.dispatchEvent(new Event('fam_timer_update'))
}

function sheetsAddScreenTime(child, delta) {
  if (!CONFIG.appsScriptUrl) return
  const url = new URL(CONFIG.appsScriptUrl)
  url.searchParams.set('action', 'addScreenTime')
  url.searchParams.set('child', child)
  url.searchParams.set('delta', delta)
  url.searchParams.set('_t', Date.now())
  fetch(url.toString()).catch(() => {})
}

// ── Balance ───────────────────────────────────────────────────────────────────

export function useScreenBalance(childName) {
  const [balance, setBalance] = useState(0)

  // Hydrate from Sheets on mount, then re-poll every 5 minutes
  useEffect(() => {
    if (!CONFIG.appsScriptUrl) return
    async function load() {
      try {
        const url = new URL(CONFIG.appsScriptUrl)
        url.searchParams.set('action', 'getScreenTime')
        url.searchParams.set('_t', Date.now())
        const res  = await fetch(url.toString())
        const data = await res.json()
        if (!Array.isArray(data)) return
        const row = data.find(d => d.child === childName)
        if (row) {
          const obj = loadBalance()
          obj[childName] = row.balance
          saveBalance(obj)
          setBalance(row.balance)
        }
      } catch { /* fall back to local */ }
    }
    load()
    const id = setInterval(load, SHEETS_POLL_MS)
    return () => clearInterval(id)
  }, [childName])

  // Re-read whenever balance changes from any source
  useEffect(() => {
    const sync = () => setBalance(loadBalance()[childName] ?? 0)
    window.addEventListener('fam_balance_update', sync)
    return () => window.removeEventListener('fam_balance_update', sync)
  }, [childName])

  const addMinutes = useCallback((minutes) => {
    const obj = loadBalance()
    obj[childName] = (obj[childName] ?? 0) + minutes
    saveBalance(obj)
    setBalance(obj[childName])
    sheetsAddScreenTime(childName, minutes)
  }, [childName])

  return { balance, addMinutes }
}

// ── Timer ─────────────────────────────────────────────────────────────────────

export function startChildTimer(childName) {
  const minutesPerChore = CONFIG.screenTime?.minutesPerChore ?? 30
  const bufferMin       = CONFIG.screenTime?.timerBufferMinutes ?? 35

  const obj = loadBalance()
  const current  = obj[childName] ?? 0
  const deducted = Math.min(current, minutesPerChore)
  obj[childName] = Math.max(0, current - deducted)
  saveBalance(obj)
  sheetsAddScreenTime(childName, -deducted)

  const totalMs = bufferMin * 60 * 1000
  const endTime = Date.now() + totalMs
  const timers  = loadTimers()
  timers[childName] = { child: childName, endTime, deducted, totalMs }
  saveTimers(timers)
}

// childName is required; pass { expired: true } when called from timer expiry.
export function stopChildTimer(childName, { expired = false } = {}) {
  const timers = loadTimers()
  const timer  = timers[childName]
  if (!expired && timer) {
    const msLeft  = Math.max(0, timer.endTime - Date.now())
    const totalMs = timer.totalMs ?? (CONFIG.screenTime?.timerBufferMinutes ?? 35) * 60 * 1000
    const refund  = Math.round((msLeft / totalMs) * (timer.deducted ?? 0))
    if (refund > 0) {
      const obj = loadBalance()
      obj[childName] = (obj[childName] ?? 0) + refund
      saveBalance(obj)
      sheetsAddScreenTime(childName, refund)
    }
  }
  delete timers[childName]
  saveTimers(timers)
}

// ── Active timers (reactive) ──────────────────────────────────────────────────

export function useActiveChildTimers() {
  const [timers, setTimers] = useState(loadTimers)
  const [now, setNow]       = useState(Date.now)

  useEffect(() => {
    const sync = () => setTimers(loadTimers())
    window.addEventListener('fam_timer_update', sync)
    return () => window.removeEventListener('fam_timer_update', sync)
  }, [])

  // Tick every second while any timer is active
  useEffect(() => {
    if (Object.keys(timers).length === 0) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [timers])

  // Clean up deeply expired timers outside of render
  useEffect(() => {
    Object.values(timers).forEach(timer => {
      if (now - timer.endTime > 5000) stopChildTimer(timer.child, { expired: true })
    })
  }, [timers, now])

  return Object.values(timers).map(timer => {
    const msLeft   = timer.endTime - now
    const totalSec = Math.max(0, Math.ceil(msLeft / 1000))
    return {
      child:   timer.child,
      minutes: Math.floor(totalSec / 60),
      seconds: totalSec % 60,
      expired: msLeft <= 0,
      endTime: timer.endTime,
    }
  })
}

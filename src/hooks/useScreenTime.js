import { useState, useEffect, useCallback } from 'react'
import { CONFIG } from '../config/config'

const BALANCE_KEY = 'fam_dash_screentime'
const TIMER_KEY   = 'fam_dash_timer'

function loadBalance() {
  try { return JSON.parse(localStorage.getItem(BALANCE_KEY) ?? '{}') } catch { return {} }
}

function saveBalance(obj) {
  localStorage.setItem(BALANCE_KEY, JSON.stringify(obj))
  window.dispatchEvent(new Event('fam_balance_update'))
}

function loadTimer() {
  try { return JSON.parse(localStorage.getItem(TIMER_KEY) ?? 'null') } catch { return null }
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
  const [balance, setBalance] = useState(() => loadBalance()[childName] ?? 0)

  // Hydrate from Sheets on mount
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

// Starts the countdown and deducts minutesPerChore from the child's balance.
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
  localStorage.setItem(TIMER_KEY, JSON.stringify({ child: childName, endTime, deducted, totalMs }))
  window.dispatchEvent(new Event('fam_timer_update'))
}

// Stops the timer. Remaining time is refunded (capped at what was deducted).
export function stopChildTimer({ expired = false } = {}) {
  const timer = loadTimer()
  if (!expired && timer) {
    const msLeft  = Math.max(0, timer.endTime - Date.now())
    const totalMs = timer.totalMs ?? (CONFIG.screenTime?.timerBufferMinutes ?? 35) * 60 * 1000
    const refund  = Math.round((msLeft / totalMs) * (timer.deducted ?? 0))
    if (refund > 0) {
      const obj = loadBalance()
      obj[timer.child] = (obj[timer.child] ?? 0) + refund
      saveBalance(obj)
      sheetsAddScreenTime(timer.child, refund)
    }
  }
  localStorage.removeItem(TIMER_KEY)
  window.dispatchEvent(new Event('fam_timer_update'))
}

// ── Active timer (reactive) ───────────────────────────────────────────────────

export function useActiveChildTimer() {
  const [timer, setTimer] = useState(loadTimer)
  const [now, setNow]     = useState(Date.now)

  useEffect(() => {
    const sync = () => setTimer(loadTimer())
    window.addEventListener('fam_timer_update', sync)
    return () => window.removeEventListener('fam_timer_update', sync)
  }, [])

  useEffect(() => {
    if (!timer) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [timer])

  if (!timer) return null

  const msLeft = timer.endTime - now
  if (msLeft <= -5000) {
    stopChildTimer({ expired: true })
    return null
  }

  const totalSec = Math.max(0, Math.ceil(msLeft / 1000))
  return {
    child:   timer.child,
    minutes: Math.floor(totalSec / 60),
    seconds: totalSec % 60,
    expired: msLeft <= 0,
    endTime: timer.endTime,
  }
}

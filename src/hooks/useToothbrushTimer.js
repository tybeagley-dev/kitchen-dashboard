import { useState, useEffect, useCallback } from 'react'

const TOOTH_KEY    = 'fam_dash_tooth_timer'
const DURATION_MIN = 2

function loadTooth() {
  try { return JSON.parse(localStorage.getItem(TOOTH_KEY) ?? 'null') } catch { return null }
}

export function useToothbrushTimer() {
  const [timer, setTimer] = useState(loadTooth)
  const [now,   setNow]   = useState(Date.now)

  useEffect(() => {
    const sync = () => setTimer(loadTooth())
    window.addEventListener('fam_tooth_update', sync)
    return () => window.removeEventListener('fam_tooth_update', sync)
  }, [])

  useEffect(() => {
    if (!timer) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [timer])

  const startTimer = useCallback(() => {
    const data = { endTime: Date.now() + DURATION_MIN * 60 * 1000 }
    localStorage.setItem(TOOTH_KEY, JSON.stringify(data))
    window.dispatchEvent(new Event('fam_tooth_update'))
    setTimer(data)
  }, [])

  const stopTimer = useCallback(() => {
    localStorage.removeItem(TOOTH_KEY)
    window.dispatchEvent(new Event('fam_tooth_update'))
    setTimer(null)
  }, [])

  if (!timer) return { active: false, startTimer, stopTimer, minutes: 0, seconds: 0, expired: false }

  const msLeft   = timer.endTime - now
  if (msLeft <= -5000) {
    stopTimer()
    return { active: false, startTimer, stopTimer, minutes: 0, seconds: 0, expired: false }
  }

  const totalSec = Math.max(0, Math.ceil(msLeft / 1000))
  return {
    active:  true,
    minutes: Math.floor(totalSec / 60),
    seconds: totalSec % 60,
    expired: msLeft <= 0,
    startTimer,
    stopTimer,
  }
}

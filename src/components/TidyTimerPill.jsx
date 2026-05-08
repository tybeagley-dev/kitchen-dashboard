import { useEffect } from 'react'
import { startChimeLoop, stopChimeLoop } from '../utils/chime'

export default function TidyTimerPill({ minutes, seconds, expired, onStop }) {
  const timeStr = `${minutes}:${String(seconds).padStart(2, '0')}`

  useEffect(() => {
    if (expired) {
      startChimeLoop()
    } else {
      stopChimeLoop()
    }
    return stopChimeLoop
  }, [expired])

  function handleStop() {
    stopChimeLoop()
    onStop()
  }

  return (
    <div className={`tidy-pill ${expired ? 'expired' : ''}`}>
      <span className="tidy-pill-icon">🧹</span>
      <span className="tidy-pill-time">
        {expired ? 'Tidy time done!' : `Tidy · ${timeStr}`}
      </span>
      <button className="tidy-pill-stop" onClick={handleStop} aria-label="Stop tidy timer">
        ×
      </button>
    </div>
  )
}

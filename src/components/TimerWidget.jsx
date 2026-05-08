import { useState, useEffect } from 'react'
import { useActiveChildTimer, stopChildTimer } from '../hooks/useScreenTime'
import { startChimeLoop, stopChimeLoop } from '../utils/chime'

export default function TimerWidget() {
  const timer = useActiveChildTimer()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (timer?.expired) {
      startChimeLoop()
    } else {
      stopChimeLoop()
    }
    return stopChimeLoop
  }, [timer?.expired])

  if (!timer) return null

  const timeStr = `${timer.minutes}:${String(timer.seconds).padStart(2, '0')}`

  function handleDismiss() {
    stopChimeLoop()
    stopChildTimer()
    setOpen(false)
  }

  return (
    <div className="timer-widget-wrap">
      <button
        className={`timer-pill ${timer.expired ? 'expired' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        {timer.expired ? (
          '🔴 Time\'s up!'
        ) : (
          <>
            <span className="timer-pulse" />
            {timer.child} · {timeStr}
          </>
        )}
      </button>

      {open && (
        <div className="timer-popover">
          <p className="timer-popover-name">{timer.child}'s screen time</p>
          <p className="timer-popover-time">{timer.expired ? 'All done!' : timeStr}</p>
          <button
            className="timer-stop-btn"
            onClick={() => { stopChimeLoop(); stopChildTimer(); setOpen(false) }}
          >
            Stop Timer
          </button>
          {timer.expired && (
            <button className="timer-dismiss-btn" onClick={handleDismiss}>
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { useActiveChildTimer, stopChildTimer } from '../hooks/useScreenTime'

export default function TimerWidget() {
  const timer = useActiveChildTimer()
  const [open, setOpen] = useState(false)

  if (!timer) return null

  const timeStr = `${timer.minutes}:${String(timer.seconds).padStart(2, '0')}`

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
            onClick={() => { stopChildTimer(); setOpen(false) }}
          >
            Stop Timer
          </button>
          {timer.expired && (
            <button
              className="timer-dismiss-btn"
              onClick={() => { stopChildTimer(); setOpen(false) }}
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  )
}

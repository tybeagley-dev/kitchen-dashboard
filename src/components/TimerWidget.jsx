import { useState, useEffect } from 'react'
import { useActiveChildTimers, stopChildTimer } from '../hooks/useScreenTime'
import { startChimeLoop, stopChimeLoop } from '../utils/chime'

export default function TimerWidget() {
  const timers     = useActiveChildTimers()
  const [openChild, setOpenChild] = useState(null)

  const anyExpired = timers.some(t => t.expired)

  useEffect(() => {
    if (anyExpired) startChimeLoop()
    else stopChimeLoop()
    return stopChimeLoop
  }, [anyExpired])

  if (timers.length === 0) return null

  return (
    <div className="timer-widget-wrap">
      {timers.map(timer => {
        const timeStr = `${timer.minutes}:${String(timer.seconds).padStart(2, '0')}`
        const isOpen  = openChild === timer.child

        function handleStop() {
          stopChimeLoop()
          stopChildTimer(timer.child)
          setOpenChild(null)
        }

        return (
          <div key={timer.child} className="timer-pill-wrap">
            <button
              className={`timer-pill ${timer.expired ? 'expired' : ''}`}
              onClick={() => setOpenChild(isOpen ? null : timer.child)}
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

            {isOpen && (
              <div className="timer-popover">
                <p className="timer-popover-name">{timer.child}'s screen time</p>
                <p className="timer-popover-time">{timer.expired ? 'All done!' : timeStr}</p>
                <button className="timer-stop-btn" onClick={handleStop}>
                  Stop Timer
                </button>
                {timer.expired && (
                  <button className="timer-dismiss-btn" onClick={handleStop}>
                    Dismiss
                  </button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

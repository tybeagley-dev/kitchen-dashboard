import { useRef, useState, useEffect } from 'react'
import RoutineItem from './RoutineItem'
import Confetti from './Confetti'
import ChoreInstructionsModal from './ChoreInstructionsModal'
import { useScreenBalance, stopChildTimer } from '../hooks/useScreenTime'
import { useChorePoints, markChoreToday } from '../hooks/useChores'
import { useAssignedChores, markChoreAsPending, submitApprovalRequest, triggerChoreRefetch } from '../hooks/useAssignedChores'
import { recordChoreCompletion } from '../hooks/useChoreFrequency'
import { startChimeLoop, stopChimeLoop } from '../utils/chime'
import { CONFIG } from '../config/config'

function isChoreDay() {
  return new Date().getDay() !== 0
}

function SkeletonList() {
  return (
    <div className="skeleton-list">
      {[88, 72, 80].map((w, i) => (
        <div key={i} className="skeleton-row" style={{ width: `${w}%` }} />
      ))}
    </div>
  )
}

export default function ChildCard({ child, routines, routinesLoading, chores, choresLoading, onToggle, onSpin, onExtraSpin, onScreenTime, onBucks, timer }) {
  const { chores: assignedChores, loading: assignedLoading } = useAssignedChores(child.name, chores)
  const { balance, addMinutes } = useScreenBalance(child.name)
  const { bucks, recordCompletion } = useChorePoints(child.name)
  const minutesPerBuck = Math.round((CONFIG.screenTime?.minutesPerChore ?? 30) / 2)

  const isLoading = routinesLoading || choresLoading || assignedLoading

  const requiredChores = assignedChores.filter(c => c.required)
  const spinChores     = assignedChores.filter(c => !c.required)

  const allItems = [...routines, ...requiredChores, ...spinChores]
  const done     = allItems.filter(r => r.completed).length
  const total    = allItems.length
  const allDone  = total > 0 && done === total
  const progress = total > 0 ? (done / total) * 100 : 0

  // Confetti when allDone transitions false → true
  const prevAllDone = useRef(allDone)
  const [confettiKey, setConfettiKey] = useState(0)
  useEffect(() => {
    if (!prevAllDone.current && allDone) setConfettiKey(k => k + 1)
    prevAllDone.current = allDone
  }, [allDone])

  // Chime when this child's timer expires
  useEffect(() => {
    if (timer?.expired) startChimeLoop()
    else stopChimeLoop()
    return stopChimeLoop
  }, [timer?.expired])

  const [instructionsChore, setInstructionsChore] = useState(null)
  const [submitting, setSubmitting] = useState(new Set())

  async function handleChoreRequest(chore) {
    if (submitting.has(chore.id)) return
    setSubmitting(prev => new Set([...prev, chore.id]))
    try {
      markChoreAsPending(child.name, chore.id)
      markChoreToday(child.name)
      recordChoreCompletion(child.name, chore.id, chore.required)
      await submitApprovalRequest(child, chore.id, chore.label, chore.bucks)
      triggerChoreRefetch()
    } finally {
      setSubmitting(prev => { const next = new Set(prev); next.delete(chore.id); return next })
    }
  }

  function handleChoreTap(chore) {
    if (chore.completed || chore.pending || submitting.has(chore.id)) return
    if (chore.instructions?.length) {
      setInstructionsChore(chore)
    } else {
      handleChoreRequest(chore)
    }
  }

  return (
    <div className={`child-card ${allDone ? 'all-done' : ''}`} style={{ position: 'relative' }}>
      <Confetti triggerKey={confettiKey} />

      <div className="child-header">
        <div className="child-avatar" style={{ background: child.color }}>
          {child.emoji}
        </div>
        <div className="child-meta">
          <h3 className="child-name">{child.name}</h3>
          <span className="child-progress-text">
            {isLoading ? 'Syncing…' : allDone ? 'All done! ✓' : `${done} of ${total}`}
          </span>
        </div>
        {timer && (
          <div
            className={`child-timer-pill ${timer.expired ? 'expired' : ''}`}
            style={{ '--child-color': child.color }}
          >
            {timer.expired ? (
              <span className="child-timer-label">Time's up!</span>
            ) : (
              <>
                <span className="child-timer-dot" />
                <span className="child-timer-label">
                  {timer.minutes}:{String(timer.seconds).padStart(2, '0')}
                </span>
              </>
            )}
            <button
              className="child-timer-stop"
              onClick={() => { stopChimeLoop(); stopChildTimer(child.name) }}
              aria-label="Stop timer"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%`, background: child.color }} />
      </div>

      <div className="routine-list">
        {isLoading ? (
          <SkeletonList />
        ) : (
          <>
            {routines.map(r => (
              <RoutineItem key={r.id} routine={r} onToggle={() => onToggle(child.name, r.id)} />
            ))}

            {requiredChores.map(chore => (
              <RoutineItem
                key={chore.id}
                routine={chore}
                onToggle={() => handleChoreTap(chore)}
              />
            ))}

            {isChoreDay() && (spinChores.length > 0 ? (
              <>
                {spinChores.map(chore => (
                  <RoutineItem
                    key={chore.id}
                    routine={chore}
                    onToggle={() => handleChoreTap(chore)}
                  />
                ))}
                {spinChores.every(c => c.completed) && (
                  <button
                    className="spin-row-btn extra-spin-btn"
                    onClick={onExtraSpin}
                    style={{ '--child-color': child.color }}
                  >
                    <span className="spin-row-icon">⭐</span>
                    <span className="spin-row-label">Bonus Chore</span>
                    <span className="spin-row-sub">Earns Beagley Bucks</span>
                  </button>
                )}
              </>
            ) : (
              <button
                className="spin-row-btn"
                onClick={onSpin}
                style={{ '--child-color': child.color }}
              >
                <span className="spin-row-icon">🎡</span>
                <span className="spin-row-label">Spin a Chore</span>
              </button>
            ))}
          </>
        )}
      </div>

      <div className="child-card-actions">
        <button className="bucks-btn" onClick={onBucks} style={{ '--child-color': child.color }}>
          <span className="bucks-btn-count">{bucks}</span>
          Beagley Bucks
        </button>
        <button
          className={`screentime-btn ${balance > 0 ? 'has-balance' : ''}`}
          onClick={onScreenTime}
        >
          <span className="spin-btn-icon">⏱</span>
          {balance > 0 ? `${balance} min` : 'Screen Time'}
        </button>
      </div>

      {instructionsChore && (
        <ChoreInstructionsModal
          chore={instructionsChore}
          onComplete={() => {
            handleChoreRequest(instructionsChore)
            setInstructionsChore(null)
          }}
          onClose={() => setInstructionsChore(null)}
        />
      )}
    </div>
  )
}

import { useRef, useState, useEffect } from 'react'
import RoutineItem from './RoutineItem'
import Confetti from './Confetti'
import ScreenTimeModal from './ScreenTimeModal'
import ChoreInstructionsModal from './ChoreInstructionsModal'
import { useScreenBalance } from '../hooks/useScreenTime'
import { useChorePoints, markChoreToday } from '../hooks/useChores'
import { useAssignedChores, assignChores, completeAssignedChore } from '../hooks/useAssignedChores'
import { recordChoreCompletion, isChoreAvailableThisWeek } from '../hooks/useChoreFrequency'
import { CONFIG } from '../config/config'

function todayName() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' })
}

export default function ChildCard({ child, routines, chores, choresLoading, onToggle, onSpin, onScreenTime, onBucks }) {
  const assignedChores         = useAssignedChores(child.name)
  const { balance, addMinutes } = useScreenBalance(child.name)
  const { bucks, recordCompletion } = useChorePoints(child.name)
  const screenEarned = CONFIG.screenTime?.minutesPerChore ?? 30

  // Auto-assign required chores when chore list loads
  useEffect(() => {
    if (choresLoading || !chores?.length) return
    const today    = todayName()
    const required = chores.filter(c =>
      c.required &&
      (c.days.length === 0 || c.days.includes(today)) &&
      !assignedChores.some(a => a.id === c.id) &&
      isChoreAvailableThisWeek(c, child.name)
    )
    if (required.length) {
      assignChores(child.name, required.map(c => ({ ...c, completed: false })))
    }
  }, [choresLoading]) // eslint-disable-line react-hooks/exhaustive-deps

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

  // Modal states
  const [completionEarned,  setCompletionEarned]  = useState(null) // null = closed
  const [instructionsChore, setInstructionsChore] = useState(null)

  async function handleChoreComplete(chore) {
    completeAssignedChore(child.name, chore.id)
    await recordCompletion(child.name, chore.id, chore.bucks)
    addMinutes(screenEarned)
    markChoreToday(child.name)
    recordChoreCompletion(child.name, chore.id, chore.required)
    setCompletionEarned(screenEarned)
  }

  function handleChoreTap(chore) {
    if (chore.completed) return
    if (chore.instructions?.length) {
      setInstructionsChore(chore)
    } else {
      handleChoreComplete(chore)
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
            {allDone ? 'All done! ✓' : `${done} of ${total}`}
          </span>
        </div>
      </div>

      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${progress}%`, background: child.color }} />
      </div>

      <div className="routine-list">
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

        {spinChores.length > 0 ? (
          spinChores.map(chore => (
            <RoutineItem
              key={chore.id}
              routine={chore}
              onToggle={() => handleChoreTap(chore)}
            />
          ))
        ) : (
          <button
            className="spin-row-btn"
            onClick={onSpin}
            style={{ '--child-color': child.color }}
          >
            <span className="spin-row-icon">🎡</span>
            <span className="spin-row-label">Spin a Chore</span>
          </button>
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

      {completionEarned != null && (
        <ScreenTimeModal
          child={child}
          earned={completionEarned}
          onClose={() => setCompletionEarned(null)}
        />
      )}

      {instructionsChore && (
        <ChoreInstructionsModal
          chore={instructionsChore}
          onComplete={() => {
            handleChoreComplete(instructionsChore)
            setInstructionsChore(null)
          }}
          onClose={() => setInstructionsChore(null)}
        />
      )}
    </div>
  )
}

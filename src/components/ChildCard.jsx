import { useRef, useState, useEffect } from 'react'
import RoutineItem from './RoutineItem'
import Confetti from './Confetti'
import ScreenTimeModal from './ScreenTimeModal'
import { useScreenBalance } from '../hooks/useScreenTime'
import { useChorePoints, markChoreToday } from '../hooks/useChores'
import { useAssignedChores, completeAssignedChore } from '../hooks/useAssignedChores'
import { CONFIG } from '../config/config'

export default function ChildCard({ child, routines, onToggle, onSpin, onScreenTime, onBucks }) {
  const assignedChores = useAssignedChores(child.name)
  const { balance, addMinutes } = useScreenBalance(child.name)
  const { bucks, recordCompletion } = useChorePoints(child.name)
  const screenEarned = CONFIG.screenTime?.minutesPerChore ?? 30

  // ScreenTimeModal state for post-completion prompt
  const [completionEarned, setCompletionEarned] = useState(null) // null = closed

  // Build the full item list: routines + chore item(s)
  const choreItems = assignedChores.length > 0
    ? assignedChores.map(c => ({ ...c, isChore: true }))
    : [{ id: '__spin__', label: 'Spin a Chore', icon: '🎡', completed: false, isSpin: true }]

  const allItems = [...routines, ...choreItems]
  const done     = allItems.filter(r => r.completed).length
  const total    = allItems.length
  const allDone  = total > 0 && done === total
  const progress = total > 0 ? (done / total) * 100 : 0

  // Trigger confetti when allDone transitions false → true
  const prevAllDone = useRef(allDone)
  const [confettiKey, setConfettiKey] = useState(0)
  useEffect(() => {
    if (!prevAllDone.current && allDone) setConfettiKey(k => k + 1)
    prevAllDone.current = allDone
  }, [allDone])

  async function handleChoreComplete(chore) {
    completeAssignedChore(child.name, chore.id)
    await recordCompletion(child.name, chore.id, chore.bucks)
    addMinutes(screenEarned)
    markChoreToday(child.name)
    setCompletionEarned(screenEarned)
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
        <div
          className="progress-fill"
          style={{ width: `${progress}%`, background: child.color }}
        />
      </div>

      <div className="routine-list">
        {routines.map(r => (
          <RoutineItem
            key={r.id}
            routine={r}
            onToggle={() => onToggle(child.name, r.id)}
          />
        ))}

        {assignedChores.length > 0 ? (
          // Show actual assigned chores
          assignedChores.map(chore => (
            <RoutineItem
              key={chore.id}
              routine={chore}
              onToggle={() => !chore.completed && handleChoreComplete(chore)}
            />
          ))
        ) : (
          // No chores assigned yet — show spin button as routine-style item
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
    </div>
  )
}

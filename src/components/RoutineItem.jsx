import { useRef, useState, useEffect } from 'react'
import Burst from './Burst'

export default function RoutineItem({ routine, onToggle }) {
  const prevCompleted = useRef(routine.completed)
  const [burstKey, setBurstKey] = useState(0)

  useEffect(() => {
    if (!prevCompleted.current && routine.completed) {
      setBurstKey(k => k + 1)
    }
    prevCompleted.current = routine.completed
  }, [routine.completed])

  return (
    <button
      className={`routine-item ${routine.completed ? 'completed' : ''}`}
      onClick={onToggle}
      aria-pressed={routine.completed}
    >
      <span className="routine-check">
        {routine.completed && (
          <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
            <path
              d="M1 5L4.5 8.5L11 1"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
        <Burst triggerKey={burstKey} />
      </span>
      <span className="routine-icon">{routine.icon}</span>
      <span className="routine-label">{routine.label}</span>
    </button>
  )
}

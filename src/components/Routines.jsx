import ChildCard from './ChildCard'
import { useRoutines } from '../hooks/useRoutines'
import { useChores } from '../hooks/useChores'
import { SCHEDULE_LABELS } from '../utils/scheduleUtils'
import { CONFIG } from '../config/config'

export default function Routines({ now, onSpinChore, onScreenTime, onBucks }) {
  const { routinesByChild, toggleRoutine, mode } = useRoutines(now)
  const { chores, loading } = useChores()

  return (
    <section className="routines-section">
      <div className="routines-header">
        <h2 className="section-label">Daily Routines</h2>
        <span className="schedule-badge">{SCHEDULE_LABELS[mode]}</span>
      </div>

      <div
        className={`children-grid ${CONFIG.children.length >= 3 ? 'compact' : ''}`}
        style={{ '--child-count': CONFIG.children.length }}
      >
        {CONFIG.children.map(child => (
          <ChildCard
            key={child.name}
            child={child}
            routines={routinesByChild[child.name] ?? []}
            chores={chores}
            choresLoading={loading}
            onToggle={toggleRoutine}
            onSpin={() => onSpinChore(child, chores)}
            onScreenTime={() => onScreenTime(child)}
            onBucks={() => onBucks(child)}
          />
        ))}
      </div>
    </section>
  )
}

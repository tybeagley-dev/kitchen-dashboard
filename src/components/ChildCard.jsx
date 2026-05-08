import RoutineItem from './RoutineItem'
import { useScreenBalance } from '../hooks/useScreenTime'
import { useChorePoints } from '../hooks/useChores'

export default function ChildCard({ child, routines, onToggle, onSpin, onScreenTime, onBucks }) {
  const done = routines.filter(r => r.completed).length
  const total = routines.length
  const allDone = total > 0 && done === total
  const progress = total > 0 ? (done / total) * 100 : 0
  const { balance } = useScreenBalance(child.name)
  const { bucks } = useChorePoints(child.name)

  return (
    <div className={`child-card ${allDone ? 'all-done' : ''}`}>
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
        {routines.length === 0 ? (
          <p className="no-routines">No routines for today</p>
        ) : (
          routines.map(r => (
            <RoutineItem
              key={r.id}
              routine={r}
              onToggle={() => onToggle(child.name, r.id)}
            />
          ))
        )}
        <button
          className="spin-row-btn"
          onClick={onSpin}
          style={{ '--child-color': child.color }}
        >
          <span className="spin-row-icon">🎡</span>
          <span className="spin-row-label">Spin a Chore</span>
        </button>
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
    </div>
  )
}

import { useState, useEffect } from 'react'
import SpinningWheel from './SpinningWheel'
import BuckBadge from './BuckBadge'
import { assignChores, acceptChoresToSheets, getClaimedChoreIds } from '../hooks/useAssignedChores'
import { isChoreAvailableThisWeek } from '../hooks/useChoreFrequency'

const PHASE = { READY: 'ready', RESULT: 'result' }
const MODE  = { TWO_ONE: '2x1', ONE_TWO: '1x2' }

function todayName() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' })
}

function pickUnique(pool, count) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export default function ChoreModal({ child, chores = [], onClose }) {
  const [phase,   setPhase]   = useState(PHASE.READY)
  const [mode,    setMode]    = useState(MODE.TWO_ONE)
  const [results, setResults] = useState([])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function filteredPool() {
    const targetBucks = mode === MODE.TWO_ONE ? 1 : 2
    const claimed     = getClaimedChoreIds(child.name)
    const today       = todayName()
    return chores.filter(c =>
      c.bucks === targetBucks &&
      !c.required &&
      (c.days.length === 0 || c.days.includes(today)) &&
      isChoreAvailableThisWeek(c, child.name) &&
      !claimed.has(c.id)
    )
  }

  function handleSpinEnd(firstChore) {
    if (mode === MODE.TWO_ONE) {
      const pool   = filteredPool()
      const second = pool.filter(c => c.id !== firstChore.id)
      const extra  = second.length > 0
        ? second[Math.floor(Math.random() * second.length)]
        : null
      setResults(extra ? [firstChore, extra] : [firstChore])
    } else {
      setResults([firstChore])
    }
    setPhase(PHASE.RESULT)
  }

  function handleAccept() {
    const mapped = results.map(c => ({ ...c, completed: false }))
    assignChores(child.name, mapped)
    acceptChoresToSheets(child, results) // fire-and-forget: persists to Sheets for cross-device visibility
    onClose()
  }

  function handleSpinAgain() {
    setResults([])
    setPhase(PHASE.READY)
  }

  function switchMode(newMode) {
    setMode(newMode)
    setPhase(PHASE.READY)
    setResults([])
  }

  const pool = filteredPool()

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="modal-child-header">
          <div className="modal-avatar" style={{ background: child.color }}>
            {child.emoji}
          </div>
          <div>
            <h2 className="modal-title">{child.name}'s Chore</h2>
          </div>
        </div>

        <div className="chore-mode-toggle">
          <button
            className={`chore-mode-btn ${mode === MODE.TWO_ONE ? 'active' : ''}`}
            onClick={() => switchMode(MODE.TWO_ONE)}
          >
            <BuckBadge amount={1} /> × 2 chores
          </button>
          <button
            className={`chore-mode-btn ${mode === MODE.ONE_TWO ? 'active' : ''}`}
            onClick={() => switchMode(MODE.ONE_TWO)}
          >
            <BuckBadge amount={2} /> × 1 chore
          </button>
        </div>

        {pool.length === 0 ? (
          <div className="modal-loading">
            No {mode === MODE.TWO_ONE ? '1-buck' : '2-buck'} chores available today
          </div>
        ) : (
          <div className={`modal-wheel-wrap ${phase !== PHASE.READY ? 'dimmed' : ''}`}>
            <SpinningWheel chores={pool} onSpinEnd={handleSpinEnd} />
          </div>
        )}

        {phase === PHASE.RESULT && results.length > 0 && (
          <div className="chore-result-panel">
            <div className="chore-result-cards">
              {results.map(chore => (
                <div key={chore.id} className="chore-result-card">
                  <span className="chore-result-icon">{chore.icon}</span>
                  <span className="chore-result-name">{chore.label}</span>
                  <BuckBadge amount={chore.bucks} />
                </div>
              ))}
            </div>
            <div className="chore-result-actions">
              <button className="btn-complete" onClick={handleAccept}>
                ✓ These are my chores!
              </button>
              <button className="btn-spin-again" onClick={handleSpinAgain}>
                Spin Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

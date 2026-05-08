import { useState, useEffect } from 'react'
import SpinningWheel from './SpinningWheel'
import { useChores } from '../hooks/useChores'
import { assignChores, getClaimedChoreIds } from '../hooks/useAssignedChores'

const PHASE = { READY: 'ready', RESULT: 'result' }
const MODE  = { TWO_ONE: '2x1', ONE_TWO: '1x2' }

function pickUnique(pool, count) {
  const shuffled = [...pool].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

export default function ChoreModal({ child, onClose }) {
  const { chores, loading } = useChores()

  const [phase,    setPhase]    = useState(PHASE.READY)
  const [mode,     setMode]     = useState(MODE.TWO_ONE)
  const [results,  setResults]  = useState([]) // 1 or 2 chore objects

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function filteredPool() {
    const targetBucks = mode === MODE.TWO_ONE ? 1 : 2
    const claimed     = getClaimedChoreIds(child.name)
    return chores.filter(c => c.bucks === targetBucks && !claimed.has(c.id))
  }

  function handleSpinEnd(firstChore) {
    if (mode === MODE.TWO_ONE) {
      // Pick a second unique chore from the 1-buck pool
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
    assignChores(child.name, results.map(c => ({ ...c, completed: false })))
    onClose()
  }

  function handleSpinAgain() {
    setResults([])
    setPhase(PHASE.READY)
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

        {/* Mode toggle */}
        <div className="chore-mode-toggle">
          <button
            className={`chore-mode-btn ${mode === MODE.TWO_ONE ? 'active' : ''}`}
            onClick={() => { setMode(MODE.TWO_ONE); setPhase(PHASE.READY); setResults([]) }}
          >
            2 × 🪙1
          </button>
          <button
            className={`chore-mode-btn ${mode === MODE.ONE_TWO ? 'active' : ''}`}
            onClick={() => { setMode(MODE.ONE_TWO); setPhase(PHASE.READY); setResults([]) }}
          >
            1 × 🪙🪙2
          </button>
        </div>

        {loading ? (
          <div className="modal-loading">Loading chores…</div>
        ) : pool.length === 0 ? (
          <div className="modal-loading">
            No {mode === MODE.TWO_ONE ? '1-buck' : '2-buck'} chores in the pool
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
                  <span className="chore-result-bucks">🪙{chore.bucks}</span>
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

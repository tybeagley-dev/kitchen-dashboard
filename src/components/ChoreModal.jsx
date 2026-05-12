import { useState, useEffect } from 'react'
import SpinningWheel from './SpinningWheel'
import BuckBadge from './BuckBadge'
import { assignChores, acceptChoresToSheets, getClaimedChoreIds, triggerChoreRefetch } from '../hooks/useAssignedChores'
import { isChoreAvailableThisWeek } from '../hooks/useChoreFrequency'

const PHASE = { READY: 'ready', RESULT: 'result', RESPIN: 'respin', CHOOSE: 'choose' }
const MODE  = { TWO_ONE: '2x1', ONE_TWO: '1x2' }

function todayName() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' })
}

export default function ChoreModal({ child, chores = [], onClose, isExtra = false }) {
  const [phase,        setPhase]        = useState(PHASE.READY)
  const [mode,         setMode]         = useState(MODE.TWO_ONE)
  const [firstBundle,  setFirstBundle]  = useState([])
  const [secondBundle, setSecondBundle] = useState([])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function filteredPool(excludeIds = []) {
    const targetBucks = mode === MODE.TWO_ONE ? 1 : 2
    const claimed     = getClaimedChoreIds(child.name)
    const today       = todayName()
    return chores.filter(c =>
      c.active !== false &&
      c.bucks === targetBucks &&
      !c.required &&
      (c.days.length === 0 || c.days.includes(today)) &&
      isChoreAvailableThisWeek(c, child.name) &&
      !claimed.has(c.id) &&
      !excludeIds.includes(c.id)
    )
  }

  function buildBundle(firstChore, excludeIds = []) {
    if (mode === MODE.TWO_ONE) {
      const pool   = filteredPool(excludeIds).filter(c => c.id !== firstChore.id)
      const second = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : null
      return second ? [firstChore, second] : [firstChore]
    }
    return [firstChore]
  }

  function handleSpinEnd(firstChore) {
    if (phase === PHASE.READY) {
      setFirstBundle(buildBundle(firstChore))
      setPhase(PHASE.RESULT)
    } else if (phase === PHASE.RESPIN) {
      setSecondBundle(buildBundle(firstChore, firstBundle.map(c => c.id)))
      setPhase(PHASE.CHOOSE)
    }
  }

  function handleAccept(bundle) {
    const mapped = bundle.map(c => ({ ...c, completed: false, ...(isExtra && { extra: true }) }))
    assignChores(child.name, mapped)
    onClose()
    acceptChoresToSheets(child, mapped).then(() => triggerChoreRefetch())
  }

  function handleSpinAgain() {
    setPhase(PHASE.RESPIN)
  }

  function switchMode(newMode) {
    setMode(newMode)
    setPhase(PHASE.READY)
    setFirstBundle([])
    setSecondBundle([])
  }

  const firstPool   = filteredPool()
  const respinPool  = filteredPool(firstBundle.map(c => c.id))
  const activePool  = phase === PHASE.RESPIN ? respinPool : firstPool
  const isSpinPhase = phase === PHASE.READY || phase === PHASE.RESPIN

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-card">
        <button className="modal-close" onClick={onClose} aria-label="Close">×</button>

        <div className="modal-child-header">
          <div className="modal-avatar" style={{ background: child.color }}>
            {child.emoji}
          </div>
          <div>
            <h2 className="modal-title">{isExtra ? 'Bonus Chore' : `${child.name}'s Chore`}</h2>
            {isExtra && <p className="modal-subtitle">Earns Beagley Bucks only</p>}
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

        {/* ── CHOOSE phase: pick one of two bundles ── */}
        {phase === PHASE.CHOOSE && (
          <div className="chore-choose-panel">
            <p className="chore-choose-label">Pick your bundle:</p>
            <div className="chore-choose-bundles">
              {[firstBundle, secondBundle].map((bundle, i) => (
                <button key={i} className="chore-bundle-btn" onClick={() => handleAccept(bundle)}>
                  {bundle.map(c => (
                    <div key={c.id} className="chore-bundle-item">
                      <span className="chore-result-icon">{c.icon}</span>
                      <span className="chore-result-name">{c.label}</span>
                      <BuckBadge amount={c.bucks} />
                    </div>
                  ))}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── READY / RESULT / RESPIN phases: wheel + result ── */}
        {phase !== PHASE.CHOOSE && (
          <>
            {activePool.length === 0 ? (
              <div className="modal-loading">
                No {mode === MODE.TWO_ONE ? '1-buck' : '2-buck'} chores available today
              </div>
            ) : (
              <div className={`modal-wheel-wrap ${!isSpinPhase ? 'dimmed' : ''}`}>
                <SpinningWheel
                  key={phase}
                  chores={activePool}
                  onSpinEnd={handleSpinEnd}
                />
              </div>
            )}

            {phase === PHASE.RESPIN && (
              <p className="chore-respin-hint">Spin #2 — then choose your favorite!</p>
            )}

            {phase === PHASE.RESULT && firstBundle.length > 0 && (
              <div className="chore-result-panel">
                <div className="chore-result-cards">
                  {firstBundle.map(chore => (
                    <div key={chore.id} className="chore-result-card">
                      <span className="chore-result-icon">{chore.icon}</span>
                      <span className="chore-result-name">{chore.label}</span>
                      <BuckBadge amount={chore.bucks} />
                    </div>
                  ))}
                </div>
                <div className="chore-result-actions">
                  <button className="btn-complete" onClick={() => handleAccept(firstBundle)}>
                    ✓ These are my chores!
                  </button>
                  {respinPool.length > 0 && (
                    <button className="btn-spin-again" onClick={handleSpinAgain}>
                      Spin Again
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

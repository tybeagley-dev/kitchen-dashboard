import { useState, useEffect } from 'react'
import PinModal from './PinModal'
import ParentBucksTab from './ParentBucksTab'
import ParentChoresTab from './ParentChoresTab'
import ParentMealsTab    from './ParentMealsTab'
import ParentRoutinesTab from './ParentRoutinesTab'
import ParentMomStoreTab from './ParentMomStoreTab'

const TABS = [
  { id: 'bucks',    label: 'Bucks & Time' },
  { id: 'chores',   label: 'Chores'       },
  { id: 'routines', label: 'Routines'     },
  { id: 'meals',    label: 'Meals'        },
  { id: 'store',    label: 'Mom Store'    },
]

export default function ParentPanel({ onClose }) {
  const [unlocked, setUnlocked] = useState(false)
  const [tab, setTab]           = useState('bucks')

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  if (!unlocked) {
    return (
      <PinModal
        prompt="Parent Panel"
        onSuccess={() => setUnlocked(true)}
        onCancel={onClose}
      />
    )
  }

  return (
    <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
      <div className="parent-panel">
        <div className="parent-panel-hd">
          <h2 className="parent-panel-title">Parent Panel</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="parent-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`parent-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="parent-panel-body">
          {tab === 'bucks'    && <ParentBucksTab />}
          {tab === 'chores'   && <ParentChoresTab />}
          {tab === 'routines' && <ParentRoutinesTab />}
          {tab === 'meals'    && <ParentMealsTab />}
          {tab === 'store'    && <ParentMomStoreTab />}
        </div>
      </div>
    </div>
  )
}

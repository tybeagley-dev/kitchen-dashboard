import { useState, useEffect } from 'react'
import Header from './components/Header'
import Calendar from './components/Calendar'
import MealPlan from './components/MealPlan'
import NotesAndGrocery from './components/NotesAndGrocery'
import Routines from './components/Routines'
import ChoreModal from './components/ChoreModal'
import ScreenTimeModal from './components/ScreenTimeModal'
import BucksModal from './components/BucksModal'
import { useClock } from './hooks/useClock'
import { useWeather } from './hooks/useWeather'
import { unlockAudio } from './utils/chime'

export default function App() {
  const now = useClock()
  const weather = useWeather()

  // ?clearcache in the URL wipes localStorage and reloads cleanly
  useEffect(() => {
    if (new URLSearchParams(window.location.search).has('clearcache')) {
      localStorage.clear()
      window.location.replace(window.location.pathname)
    }
  }, [])

  // Unlock Web Audio on first user gesture so chimes work on iOS Safari
  useEffect(() => {
    const unlock = () => unlockAudio()
    document.addEventListener('touchstart', unlock, { once: true })
    document.addEventListener('click',      unlock, { once: true })
    return () => {
      document.removeEventListener('touchstart', unlock)
      document.removeEventListener('click',      unlock)
    }
  }, [])
  const [activeChoreChild, setActiveChoreChild] = useState(null)  // { child, chores }

  const [activeScreenChild, setActiveScreenChild] = useState(null)
  const [activeBucksChild, setActiveBucksChild] = useState(null)

  return (
    <div className="dashboard">
      <Header now={now} weather={weather} />

      <div className="dashboard-body">
        <div className="panel-left">
          <Calendar now={now} />
          <MealPlan now={now} />
          <NotesAndGrocery />
        </div>

        <div className="panel-right">
          <Routines
            now={now}
            onSpinChore={(child, chores) => setActiveChoreChild({ child, chores })}
            onScreenTime={setActiveScreenChild}
            onBucks={setActiveBucksChild}
          />
        </div>
      </div>

      {activeChoreChild && (
        <ChoreModal
          child={activeChoreChild.child}
          chores={activeChoreChild.chores}
          onClose={() => setActiveChoreChild(null)}
        />
      )}

      {activeScreenChild && (
        <ScreenTimeModal
          child={activeScreenChild}
          onClose={() => setActiveScreenChild(null)}
        />
      )}

      {activeBucksChild && (
        <BucksModal
          child={activeBucksChild}
          onClose={() => setActiveBucksChild(null)}
        />
      )}
    </div>
  )
}

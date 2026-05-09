import { useState } from 'react'
import { getDayName } from '../utils/dateUtils'
import { useMeals } from '../hooks/useMeals'
import { getCurrentScheduleMode } from '../utils/scheduleUtils'
import { CONFIG } from '../config/config'
import PinModal from './PinModal'
import MealsEditModal from './MealsEditModal'

export default function MealPlan({ now }) {
  const todayName = getDayName(now)
  const { meals, updateMeal, getMealForDay, DAY_ORDER } = useMeals()
  const meal = getMealForDay(todayName)

  const [showPin, setShowPin]   = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  const mode      = getCurrentScheduleMode(now, CONFIG)
  const isSummer  = mode === 'summer'
  const isMorning = now.getHours() < 12
  const showLunch = isSummer && isMorning

  const cardTitle   = showLunch ? "Today's Lunch" : "Tonight's Dinner"
  const displayMain = showLunch ? meal?.lunch : meal?.main
  const displayNote = showLunch ? null : meal?.note

  function handleSave(draft) {
    draft.forEach(({ day, main, note, lunch }) => updateMeal(day, main, note, lunch))
  }

  return (
    <>
      <section className="card meal-card">
        <div className="meal-card-header">
          <h2 className="section-label">{cardTitle}</h2>
          <button className="card-edit-btn" onClick={() => setShowPin(true)} aria-label="Edit meal plan">✏️</button>
        </div>
        {displayMain ? (
          <div className="meal-content">
            <span className="meal-main">{displayMain}</span>
            {displayNote && <span className="meal-note">{displayNote}</span>}
          </div>
        ) : (
          <p className="meal-empty">No plan yet — check the fridge!</p>
        )}
      </section>

      {showPin && (
        <PinModal
          prompt="Enter PIN to edit meals"
          onSuccess={() => { setShowPin(false); setShowEdit(true) }}
          onCancel={() => setShowPin(false)}
        />
      )}

      {showEdit && (
        <MealsEditModal
          meals={meals}
          dayOrder={DAY_ORDER}
          onSave={handleSave}
          onClose={() => setShowEdit(false)}
        />
      )}
    </>
  )
}

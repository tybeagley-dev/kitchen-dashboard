import { useState } from 'react'
import { getDayName } from '../utils/dateUtils'
import { useMeals } from '../hooks/useMeals'
import PinModal from './PinModal'
import MealsEditModal from './MealsEditModal'

export default function MealPlan({ now }) {
  const todayName = getDayName(now)
  const { meals, updateMeal, getMealForDay, DAY_ORDER } = useMeals()
  const meal = getMealForDay(todayName)

  const [showPin, setShowPin]   = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  function handleSave(draft) {
    draft.forEach(({ day, main, note }) => updateMeal(day, main, note))
  }

  return (
    <>
      <section className="card meal-card">
        <div className="meal-card-header">
          <h2 className="section-label">Tonight's Dinner</h2>
          <button className="card-edit-btn" onClick={() => setShowPin(true)} aria-label="Edit meal plan">✏️</button>
        </div>
        {meal?.main ? (
          <div className="meal-content">
            <span className="meal-main">{meal.main}</span>
            {meal.note && <span className="meal-note">{meal.note}</span>}
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

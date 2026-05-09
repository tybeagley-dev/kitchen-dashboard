import { useState, useEffect, useCallback } from 'react'
import { CONFIG } from '../config/config'

const KEY = 'fam_dash_meals'

const DAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function configMealsToArray() {
  return DAY_ORDER.map(day => ({
    day,
    main:  CONFIG.meals?.[day]?.main  ?? '',
    note:  CONFIG.meals?.[day]?.note  ?? '',
    lunch: CONFIG.meals?.[day]?.lunch ?? '',
  }))
}

function loadLocal() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) ?? 'null')
    return data ?? configMealsToArray()
  } catch {
    return configMealsToArray()
  }
}

function saveLocal(meals) {
  localStorage.setItem(KEY, JSON.stringify(meals))
}

function sheetsGet(params) {
  if (!CONFIG.appsScriptUrl) return Promise.resolve(null)
  const url = new URL(CONFIG.appsScriptUrl)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  url.searchParams.set('_t', Date.now())
  return fetch(url.toString()).then(r => r.json()).catch(() => null)
}

export function useMeals() {
  const [meals, setMeals] = useState(loadLocal)

  useEffect(() => {
    async function hydrate() {
      const data = await sheetsGet({ action: 'getMeals' })
      if (!Array.isArray(data) || data.length === 0) return
      saveLocal(data)
      setMeals(data)
    }
    hydrate()
  }, [])

  const updateMeal = useCallback((day, main, note, lunch = '') => {
    setMeals(prev => {
      const next = prev.map(m => m.day === day ? { day, main, note, lunch } : m)
      saveLocal(next)
      return next
    })
    sheetsGet({ action: 'setMeal', day, main: encodeURIComponent(main), note: encodeURIComponent(note), lunch: encodeURIComponent(lunch) })
  }, [])

  const getMealForDay = useCallback((dayName) => {
    return meals.find(m => m.day === dayName) ?? { day: dayName, main: '', note: '', lunch: '' }
  }, [meals])

  return { meals, updateMeal, getMealForDay, DAY_ORDER }
}

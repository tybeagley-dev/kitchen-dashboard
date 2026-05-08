const FREQ_KEY = 'fam_dash_chore_freq'

function getISOWeek(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function loadFreq() {
  const week = getISOWeek(new Date())
  const raw  = localStorage.getItem(FREQ_KEY)
  if (!raw) return { week, byChild: {}, global: [] }
  const stored = JSON.parse(raw)
  if (stored.week !== week) return { week, byChild: {}, global: [] }
  return stored
}

function saveFreq(data) {
  localStorage.setItem(FREQ_KEY, JSON.stringify(data))
}

export function recordChoreCompletion(childName, choreId, isRequired) {
  const data = loadFreq()
  data.byChild[childName] = data.byChild[childName] ?? []
  if (!data.byChild[childName].includes(choreId)) {
    data.byChild[childName].push(choreId)
  }
  if (!isRequired && !data.global.includes(choreId)) {
    data.global.push(choreId)
  }
  saveFreq(data)
}

export function isChoreAvailableThisWeek(chore, childName) {
  if (chore.frequency !== 'weekly') return true
  const data = loadFreq()
  if (chore.required) {
    return !(data.byChild[childName] ?? []).includes(chore.id)
  }
  return !data.global.includes(chore.id)
}

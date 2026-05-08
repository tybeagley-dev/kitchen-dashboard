const DAY_NAMES   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December']
const DAY_SHORT   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export function getDayName(date)    { return DAY_NAMES[date.getDay()] }
export function getMonthName(date)  { return MONTH_NAMES[date.getMonth()] }
export function getDayShort(date)   { return DAY_SHORT[date.getDay()] }

export function formatDate(date) {
  return `${DAY_NAMES[date.getDay()]}, ${MONTH_NAMES[date.getMonth()]} ${date.getDate()}`
}

export function formatTime(date) {
  let h = date.getHours()
  const m = String(date.getMinutes()).padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m} ${ampm}`
}

export function getGreeting(date) {
  const h = date.getHours()
  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'
  if (h < 20) return 'Good Evening'
  return 'Good Night'
}

// Returns "2026-05-08"
export function getTodayKey(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
}

// Returns an array of 7 Date objects for the current week (Sun–Sat)
export function getWeekDays(date) {
  const days = []
  const dow = date.getDay()
  for (let i = 0; i < 7; i++) {
    const d = new Date(date)
    d.setDate(date.getDate() - dow + i)
    days.push(d)
  }
  return days
}

// Format event date like "Fri, May 9" or "Today" / "Tomorrow"
export function formatEventDate(eventDateStr, now) {
  const [y, mo, d] = eventDateStr.split('-').map(Number)
  const eventDate = new Date(y, mo - 1, d)
  if (isSameDay(eventDate, now)) return 'Today'
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  if (isSameDay(eventDate, tomorrow)) return 'Tomorrow'
  return `${DAY_SHORT[eventDate.getDay()]}, ${MONTH_SHORT[eventDate.getMonth()]} ${eventDate.getDate()}`
}

// Returns upcoming events from a list sorted by date, within the next N days
export function getUpcomingEvents(events, now, days = 14) {
  const todayKey = getTodayKey(now)
  const cutoff = new Date(now)
  cutoff.setDate(now.getDate() + days)
  const cutoffKey = getTodayKey(cutoff)

  return [...events]
    .filter(e => e.date >= todayKey && e.date <= cutoffKey)
    .sort((a, b) => a.date.localeCompare(b.date))
}

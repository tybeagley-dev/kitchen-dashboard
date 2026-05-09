import { useState } from 'react'
import { getWeekDays, getDayShort, isSameDay, getTodayKey, formatEventDate } from '../utils/dateUtils'
import { useCalendarEvents } from '../hooks/useCalendarEvents'

export default function Calendar({ now }) {
  const events      = useCalendarEvents()
  const weekDays    = getWeekDays(now)
  const [selected, setSelected] = useState(() => now)

  function handleDayClick(day) {
    setSelected(day)
  }

  const displayed = events.filter(e => {
    const [y, m, d] = e.date.split('-').map(Number)
    return isSameDay(new Date(y, m - 1, d), selected)
  })

  const emptyMsg = `Nothing on ${getDayShort(selected)} the ${selected.getDate()}`

  return (
    <section className="card calendar-card">
      <div className="calendar-header-row">
        <h2 className="section-label">Calendar</h2>
      </div>

      <div className="week-strip">
        {weekDays.map((day, i) => {
          const isToday    = isSameDay(day, now)
          const isSelected = selected && isSameDay(selected, day)
          const hasEvent   = events.some(e => {
            const [y, m, d] = e.date.split('-').map(Number)
            return isSameDay(new Date(y, m - 1, d), day)
          })
          return (
            <button
              key={i}
              className={`week-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
              onClick={() => handleDayClick(day)}
            >
              <span className="week-day-name">{getDayShort(day)}</span>
              <span className="week-day-num">{day.getDate()}</span>
              {hasEvent && <span className="event-dot" />}
            </button>
          )
        })}
      </div>

      <div className="upcoming-events">
        {displayed.length === 0 ? (
          <p className="no-events">{emptyMsg}</p>
        ) : (
          displayed.map((evt, i) => (
            <div key={i} className="event-row">
              <span
                className="event-color-bar"
                style={{ background: evt.color ?? 'var(--accent-warm)' }}
              />
              <div className="event-info">
                <span className="event-title">{evt.title}</span>
                <span className="event-meta">
                  {formatEventDate(evt.date, now)}
                  {evt.time ? ` · ${evt.time}${evt.endTime && evt.endTime !== evt.time ? `–${evt.endTime}` : ''}` : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

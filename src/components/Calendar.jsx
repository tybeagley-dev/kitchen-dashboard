import { useState } from 'react'
import { getWeekDays, getDayShort, isSameDay, getUpcomingEvents, getTodayKey, formatEventDate } from '../utils/dateUtils'
import { useCalendarEvents } from '../hooks/useCalendarEvents'

export default function Calendar({ now }) {
  const events      = useCalendarEvents()
  const weekDays    = getWeekDays(now)
  const [selected, setSelected] = useState(null) // Date object or null

  function handleDayClick(day) {
    setSelected(prev => prev && isSameDay(prev, day) ? null : day)
  }

  const displayed = selected
    ? events.filter(e => {
        const [y, m, d] = e.date.split('-').map(Number)
        return isSameDay(new Date(y, m - 1, d), selected)
      })
    : getUpcomingEvents(events, now, 14)

  const emptyMsg = selected
    ? `Nothing on ${getDayShort(selected)} the ${selected.getDate()}`
    : 'Nothing coming up — enjoy the calm!'

  return (
    <section className="card calendar-card">
      <div className="calendar-header-row">
        <h2 className="section-label">Calendar</h2>
        {selected && (
          <button className="cal-clear-btn" onClick={() => setSelected(null)}>
            All upcoming
          </button>
        )}
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
                  {evt.time ? ` · ${evt.time}` : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}

import { getWeekDays, getDayShort, isSameDay, getUpcomingEvents, formatEventDate } from '../utils/dateUtils'
import { useCalendarEvents } from '../hooks/useCalendarEvents'

export default function Calendar({ now }) {
  const events   = useCalendarEvents()
  const weekDays = getWeekDays(now)
  const upcoming = getUpcomingEvents(events, now, 14)

  return (
    <section className="card calendar-card">
      <h2 className="section-label">Calendar</h2>

      <div className="week-strip">
        {weekDays.map((day, i) => {
          const isToday  = isSameDay(day, now)
          const hasEvent = events.some(e => {
            const [y, m, d] = e.date.split('-').map(Number)
            return isSameDay(new Date(y, m - 1, d), day)
          })
          return (
            <div key={i} className={`week-day ${isToday ? 'today' : ''}`}>
              <span className="week-day-name">{getDayShort(day)}</span>
              <span className="week-day-num">{day.getDate()}</span>
              {hasEvent && <span className="event-dot" />}
            </div>
          )
        })}
      </div>

      <div className="upcoming-events">
        {upcoming.length === 0 ? (
          <p className="no-events">Nothing coming up — enjoy the calm!</p>
        ) : (
          upcoming.map((evt, i) => (
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

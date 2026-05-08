import { formatDate, formatTime, getGreeting } from '../utils/dateUtils'
import { getWeatherInfo } from '../utils/weatherCodes'
import { CONFIG } from '../config/config'
import TimerWidget from './TimerWidget'
import TidyTimerButton from './TidyTimerButton'
import TidyTimerPill from './TidyTimerPill'
import { useTidyTimer } from '../hooks/useTidyTimer'

export default function Header({ now, weather }) {
  const weatherInfo = weather ? getWeatherInfo(weather.code) : null
  const tidy = useTidyTimer()

  return (
    <header className="dashboard-header">
      <div className="header-greeting">
        <span className="greeting-text">{getGreeting(now)}, {CONFIG.familyName}!</span>
      </div>

      <div className="header-center">
        <span className="header-date">{formatDate(now)}</span>
        <span className="header-time">{formatTime(now)}</span>
      </div>

      <div className="header-right">
        {/* Active per-child screen time timer */}
        <TimerWidget />

        {/* Active family tidy timer pill */}
        {tidy.active && (
          <TidyTimerPill
            minutes={tidy.minutes}
            seconds={tidy.seconds}
            expired={tidy.expired}
            onStop={tidy.stopTimer}
          />
        )}

        {/* Tidy timer trigger button */}
        {!tidy.active && (
          <TidyTimerButton onStart={(mins, castSession) => tidy.startTimer(mins, castSession)} />
        )}

        {/* Weather pill */}
        <div className="header-weather">
          {weatherInfo ? (
            <>
              <span className="weather-emoji">{weatherInfo.emoji}</span>
              <span className="weather-temp">{weather.temp}°</span>
              <span className="weather-label">{weatherInfo.label}</span>
            </>
          ) : (
            <span className="weather-loading">—</span>
          )}
        </div>
      </div>
    </header>
  )
}

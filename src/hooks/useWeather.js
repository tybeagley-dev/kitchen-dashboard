import { useState, useEffect } from 'react'
import { CONFIG } from '../config/config'

const REFRESH_MS = 30 * 60 * 1000 // 30 minutes

export function useWeather() {
  const [weather, setWeather] = useState(null)

  useEffect(() => {
    async function fetch_() {
      try {
        const { lat, lon } = CONFIG.weather
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&temperature_unit=fahrenheit&wind_speed_unit=mph`
        const res = await fetch(url)
        const data = await res.json()
        const c = data.current
        setWeather({
          temp: Math.round(c.temperature_2m),
          code: c.weather_code,
          humidity: c.relative_humidity_2m,
          wind: Math.round(c.wind_speed_10m),
        })
      } catch {
        // silently fail — weather is non-critical
      }
    }

    fetch_()
    const id = setInterval(fetch_, REFRESH_MS)
    return () => clearInterval(id)
  }, [])

  return weather
}

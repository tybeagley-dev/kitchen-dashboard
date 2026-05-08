// WMO Weather Interpretation Codes → display info
const CODES = {
  0:  { label: 'Clear Sky',         emoji: '☀️'  },
  1:  { label: 'Mainly Clear',      emoji: '🌤️'  },
  2:  { label: 'Partly Cloudy',     emoji: '⛅'  },
  3:  { label: 'Overcast',          emoji: '☁️'  },
  45: { label: 'Foggy',             emoji: '🌫️'  },
  48: { label: 'Freezing Fog',      emoji: '🌫️'  },
  51: { label: 'Light Drizzle',     emoji: '🌦️'  },
  53: { label: 'Drizzle',           emoji: '🌦️'  },
  55: { label: 'Heavy Drizzle',     emoji: '🌧️'  },
  61: { label: 'Light Rain',        emoji: '🌧️'  },
  63: { label: 'Rain',              emoji: '🌧️'  },
  65: { label: 'Heavy Rain',        emoji: '🌧️'  },
  71: { label: 'Light Snow',        emoji: '🌨️'  },
  73: { label: 'Snow',              emoji: '❄️'  },
  75: { label: 'Heavy Snow',        emoji: '❄️'  },
  77: { label: 'Snow Grains',       emoji: '🌨️'  },
  80: { label: 'Rain Showers',      emoji: '🌦️'  },
  81: { label: 'Rain Showers',      emoji: '🌦️'  },
  82: { label: 'Heavy Showers',     emoji: '⛈️'  },
  85: { label: 'Snow Showers',      emoji: '🌨️'  },
  86: { label: 'Snow Showers',      emoji: '🌨️'  },
  95: { label: 'Thunderstorm',      emoji: '⛈️'  },
  96: { label: 'Thunderstorm',      emoji: '⛈️'  },
  99: { label: 'Thunderstorm',      emoji: '⛈️'  },
}

export function getWeatherInfo(code) {
  return CODES[code] ?? { label: 'Unknown', emoji: '🌡️' }
}

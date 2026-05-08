import { getTodayKey } from './dateUtils'

export const SCHEDULE_MODES = {
  school:  'school',
  weekend: 'weekend',
  summer:  'summer',
  holiday: 'holiday',
}

export const SCHEDULE_LABELS = {
  school:  'School Day',
  weekend: 'Weekend',
  summer:  'Summer Break',
  holiday: 'Break Day',
}

export function getCurrentScheduleMode(date, config) {
  const dayOfWeek = date.getDay()
  const todayKey = getTodayKey(date)
  const { schedules } = config

  if (schedules.summer && todayKey >= schedules.summer.start && todayKey <= schedules.summer.end) {
    return SCHEDULE_MODES.summer
  }

  for (const period of schedules.breaks) {
    if (todayKey >= period.start && todayKey <= period.end) {
      return SCHEDULE_MODES.holiday
    }
  }

  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return SCHEDULE_MODES.weekend
  }

  return SCHEDULE_MODES.school
}

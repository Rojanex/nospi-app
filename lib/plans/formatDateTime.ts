import { strings } from '@/constants/strings'

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function formatClockTime(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours >= 12 ? strings.dates.pm : strings.dates.am
  const hour12 = hours % 12 || 12
  const minutePart = minutes === 0 ? '' : `:${String(minutes).padStart(2, '0')}`
  return strings.dates.clockTime(hour12, minutePart, period)
}

export function formatPostedAgo(createdAt: string): string {
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  const diffMin = Math.floor(diffMs / 60_000)

  if (diffMin < 1) return strings.dates.postedJustNow
  if (diffMin < 60) return strings.dates.postedMinutes(diffMin)

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) {
    return diffHours === 1
      ? strings.dates.postedHoursOne
      : strings.dates.postedHours(diffHours)
  }

  const diffDays = Math.floor(diffHours / 24)
  return diffDays === 1
    ? strings.dates.postedDaysOne
    : strings.dates.postedDays(diffDays)
}

export function formatPlanDateTime(dateTime: string): string {
  const date = new Date(dateTime)
  const dayLabel = isSameDay(date, new Date())
    ? strings.dates.today
    : strings.dates.weekdays[date.getDay()]

  return strings.dates.planDateTime(
    dayLabel,
    date.getDate(),
    strings.dates.months[date.getMonth()],
    formatClockTime(date),
  )
}

export function formatSheetDate(date: Date): string {
  return strings.dates.sheetDate(
    strings.dates.weekdaysLong[date.getDay()],
    date.getDate(),
    strings.dates.months[date.getMonth()],
  )
}

export function formatSheetTime(time: Date): string {
  return formatClockTime(time)
}

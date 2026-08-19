/** America/Bogota is UTC-5 with no DST. Hardcoded so this stays library-free. */
const BOGOTA_OFFSET_MS = 5 * 60 * 60 * 1000

/**
 * Upcoming weekend in America/Bogota: Friday 00:00 through Sunday 23:59:59.999.
 * If `now` already falls on Fri–Sun, the range starts at `now` instead of Friday 00:00.
 */
export function getUpcomingWeekendRange(now: Date): { start: Date; end: Date } {
  const bogota = new Date(now.getTime() - BOGOTA_OFFSET_MS)
  const year = bogota.getUTCFullYear()
  const month = bogota.getUTCMonth()
  const date = bogota.getUTCDate()
  const weekday = bogota.getUTCDay()

  const fridayOffset =
    weekday === 0 ? -2 : weekday === 6 ? -1 : weekday === 5 ? 0 : 5 - weekday

  const sundayEnd = new Date(
    Date.UTC(year, month, date + fridayOffset + 2, 23, 59, 59, 999) +
      BOGOTA_OFFSET_MS,
  )

  const isWeekend = weekday === 0 || weekday === 5 || weekday === 6
  if (isWeekend) {
    return { start: new Date(now.getTime()), end: sundayEnd }
  }

  const fridayStart = new Date(
    Date.UTC(year, month, date + fridayOffset, 0, 0, 0, 0) + BOGOTA_OFFSET_MS,
  )
  return { start: fridayStart, end: sundayEnd }
}

import { getUpcomingWeekendRange } from '@/lib/plans/weekendRange'

/** TODO: hardcoded UTC-5 assumes Colombia (no DST). Safe for all Colombian
// cities in current expansion plan. Revisit only when launching outside
// Colombia — other LatAm countries have different offsets and some (e.g.
// Chile) observe DST. At that point, derive offset from the plan's city
// rather than hardcoding, and consider date-fns-tz / Luxon instead of
// manual offset math. */
const BOGOTA_OFFSET_MS = 5 * 60 * 60 * 1000

export function getBogotaTodayRange(now: Date): { start: Date; end: Date } {
  const bogota = new Date(now.getTime() - BOGOTA_OFFSET_MS)
  const year = bogota.getUTCFullYear()
  const month = bogota.getUTCMonth()
  const date = bogota.getUTCDate()
  return {
    start: new Date(Date.UTC(year, month, date, 0, 0, 0, 0) + BOGOTA_OFFSET_MS),
    end: new Date(Date.UTC(year, month, date, 23, 59, 59, 999) + BOGOTA_OFFSET_MS),
  }
}

export function getFeedDateRange(
  dateFilter: 'hoy' | 'finde' | null | undefined,
  now: Date = new Date(),
): { start: Date; end: Date } | null {
  if (dateFilter === 'hoy') return getBogotaTodayRange(now)
  if (dateFilter === 'finde') return getUpcomingWeekendRange(now)
  return null
}

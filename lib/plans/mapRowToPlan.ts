import { initialsFromName } from '@/lib/utils/avatar'
import { Plan, PlanRow } from '@/types'

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'] as const

function formatPostedAgo(createdAt: string): string {
  const created = new Date(createdAt)
  const now = new Date()
  const diffMs = now.getTime() - created.getTime()
  const diffMin = Math.floor(diffMs / 60_000)

  if (diffMin < 1) return 'hace 1 min'
  if (diffMin < 60) return `hace ${diffMin} min`

  const diffHours = Math.floor(diffMin / 60)
  if (diffHours < 24) return diffHours === 1 ? 'hace 1 h' : `hace ${diffHours} h`

  const diffDays = Math.floor(diffHours / 24)
  return diffDays === 1 ? 'hace 1 d' : `hace ${diffDays} d`
}

function formatTime(date: Date): string {
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const period = hours >= 12 ? 'pm' : 'am'
  const hour12 = hours % 12 || 12
  const minutePart = minutes === 0 ? '' : `:${String(minutes).padStart(2, '0')}`
  return `${hour12}${minutePart} ${period}`
}

function formatDateTime(dateTime: string): string {
  const date = new Date(dateTime)
  const now = new Date()
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  const dayLabel = isToday ? 'Hoy' : WEEKDAY_LABELS[date.getDay()]
  return `${dayLabel} · ${formatTime(date)}`
}

export function mapRowToPlan(
  row: PlanRow,
  currentUserId: string,
  hostProfile?: { display_name: string | null; avatar_url: string | null; role: string },
): Plan {
  const memberCount = row.plan_members.length
  const hostName = hostProfile?.display_name ?? 'Host'
  const attendees = row.plan_members.slice(0, 3).map(m => ({
    user_id: m.user_id,
    initials: initialsFromName(m.profiles?.display_name ?? 'Usuario'),
    avatar_url: m.profiles?.avatar_url ?? null,
  }))

  return {
    id: row.id,
    title: row.title,
    activity_type: row.activity_type,
    location_name: row.location_name,
    date_time: formatDateTime(row.date_time),
    spots_left: row.max_spots - memberCount,
    extra_attendees: memberCount,
    attendees,
    host_name: hostName,
    host_initials: initialsFromName(hostName),
    host_avatar_url: hostProfile?.avatar_url ?? null,
    host_type: hostProfile?.role === 'local' ? 'local' : 'turista',
    posted_ago: formatPostedAgo(row.created_at),
    user_joined: row.plan_members.some(m => m.user_id === currentUserId),
  }
}

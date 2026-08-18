import { strings } from '@/constants/strings'
import {
  formatPlanDateTime,
  formatPostedAgo,
} from '@/lib/plans/formatDateTime'
import { initialsFromName } from '@/lib/utils/avatar'
import { Plan, PlanRow, PlanVisibility } from '@/types'


export function mapRowToPlan(
  row: PlanRow,
  currentUserId: string,
  hostProfile?: { display_name: string | null; avatar_url: string | null; role: string },
): Plan {
  const memberCount = row.plan_members.length
  const hostName = hostProfile?.display_name ?? strings.common.hostFallback
  const attendees = row.plan_members.map(m => {
    const name = m.profiles?.display_name?.trim() || strings.common.userFallback
    return {
      user_id: m.user_id,
      name,
      initials: initialsFromName(name),
      avatar_url: m.profiles?.avatar_url ?? null,
    }
  })

  return {
    id: row.id,
    title: row.title,
    activity_type: row.activity_type,
    location_name: row.location_name,
    date_time: formatPlanDateTime(row.date_time),
    spots_left: row.max_spots - memberCount,
    extra_attendees: memberCount,
    attendees,
    host_id: row.created_by,
    host_name: hostName,
    host_initials: initialsFromName(hostName),
    host_avatar_url: hostProfile?.avatar_url ?? null,
    host_type: hostProfile?.role === 'local' ? 'local' : 'turista',
    posted_ago: formatPostedAgo(row.created_at),
    user_joined: row.plan_members.some(m => m.user_id === currentUserId),
    visibility: row.visibility as PlanVisibility,
    description: row.description,
  }
}

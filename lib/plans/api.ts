import { mapRowToPlan } from '@/lib/plans/mapRowToPlan'
import { supabase } from '@/lib/supabase'
import { Plan, PlanRow } from '@/types'

const PLAN_SELECT =
  '*, plan_members(user_id, profiles(display_name, avatar_url)), host:profiles!created_by(display_name, avatar_url, role)'

const PAGE_SIZE = 20

export { PAGE_SIZE }

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    throw new Error('Not authenticated')
  }
  return data.user.id
}

export async function fetchPlansPage(pageNum: number): Promise<{
  plans: Plan[]
  more: boolean
}> {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('plans')
    .select(PLAN_SELECT)
    .order('date_time', { ascending: true })
    .range(pageNum * PAGE_SIZE, pageNum * PAGE_SIZE + PAGE_SIZE - 1)

  if (error) {
    console.error('[fetchPlansPage]', error)
    throw error
  }

  const rows = (data as PlanRow[]) ?? []
  return {
    plans: rows.map(row => mapRowToPlan(row, userId, row.host ?? undefined)),
    more: rows.length === PAGE_SIZE,
  }
}

export async function fetchNextJoinedPlan(): Promise<Plan | null> {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('plans')
    .select(
      '*, plan_members!inner(user_id, profiles(display_name, avatar_url)), host:profiles!created_by(display_name, avatar_url, role)',
    )
    .eq('plan_members.user_id', userId)
    .gt('date_time', new Date().toISOString())
    .order('date_time', { ascending: true })
    .limit(1)

  if (error) {
    console.error('[fetchNextJoinedPlan]', error)
    throw error
  }

  const row = data?.[0] as PlanRow | undefined
  if (!row) return null
  return mapRowToPlan(row, userId, row.host ?? undefined)
}

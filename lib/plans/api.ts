import { getFeedDateRange } from '@/lib/plans/feedDateRange'
import { mapRowToPlan } from '@/lib/plans/mapRowToPlan'
import { supabase } from '@/lib/supabase'
import { Plan, PlanRow } from '@/types'

const PLAN_SELECT =
  '*, plan_members(user_id, profiles(display_name, avatar_url)), host:profiles!created_by(display_name, avatar_url, role)'

const PAGE_SIZE = 20

export { PAGE_SIZE }

export type NearMeParams = {
  lat: number
  lng: number
}

export type FetchPlansPageParams = {
  searchQuery?: string
  dateFilter?: 'hoy' | 'finde' | null
  nearMe?: NearMeParams | null
}

type NearbyPlanRpcRow = {
  plan: PlanRow
  distance_m: number
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) {
    throw new Error('Not authenticated')
  }
  return data.user.id
}

function sanitizeSearchQuery(searchQuery: string): string {
  return searchQuery.replace(/[%,]/g, '')
}

async function hydratePlanRows(ids: string[]): Promise<PlanRow[]> {
  if (ids.length === 0) return []

  const { data, error } = await supabase
    .from('plans')
    .select(PLAN_SELECT)
    .in('id', ids)

  if (error) {
    console.error('[hydratePlanRows]', error)
    throw error
  }

  const byId = new Map(((data as PlanRow[]) ?? []).map(row => [row.id, row]))
  return ids.flatMap(id => {
    const row = byId.get(id)
    return row ? [row] : []
  })
}

async function fetchNearbyPlansPage(
  pageNum: number,
  params: FetchPlansPageParams & { nearMe: NearMeParams },
  userId: string,
): Promise<{ plans: Plan[]; more: boolean }> {
  const sanitizedSearch = params.searchQuery
    ? sanitizeSearchQuery(params.searchQuery)
    : ''
  const range = getFeedDateRange(params.dateFilter)
  const nowIso = new Date().toISOString()
  const dateStart = range
    ? (range.start.toISOString() > nowIso ? range.start.toISOString() : nowIso)
    : nowIso

  const { data, error } = await supabase.rpc('nearby_plans', {
    user_lat: params.nearMe.lat,
    user_lng: params.nearMe.lng,
    search_query: sanitizedSearch || null,
    date_start: dateStart,
    date_end: range?.end.toISOString() ?? null,
    page_size: PAGE_SIZE,
    page_offset: pageNum * PAGE_SIZE,
  })

  if (error) {
    console.error('[fetchNearbyPlansPage]', error)
    throw error
  }

  const rpcRows = (data as NearbyPlanRpcRow[] | null) ?? []
  const flattened = rpcRows.map(row => ({
    ...row.plan,
    distanceM: row.distance_m,
  }))
  const hasMembers = flattened.every(row => Array.isArray(row.plan_members))
  const rows = hasMembers
    ? (flattened as PlanRow[])
    : await hydratePlanRows(flattened.map(row => row.id).filter(Boolean))

  return {
    plans: rows.map(row => mapRowToPlan(row, userId, row.host ?? undefined)),
    more: rpcRows.length === PAGE_SIZE,
  }
}

export async function fetchPlansPage(
  pageNum: number,
  params?: FetchPlansPageParams,
): Promise<{
  plans: Plan[]
  more: boolean
}> {
  const userId = await requireUserId()

  if (params?.nearMe) {
    return fetchNearbyPlansPage(pageNum, { ...params, nearMe: params.nearMe }, userId)
  }

  let query = supabase
    .from('plans')
    .select(PLAN_SELECT)
    .order('date_time', { ascending: true })
    .eq('status', 'active')
    .gt('date_time', new Date().toISOString())

  const sanitizedSearch = params?.searchQuery
    ? sanitizeSearchQuery(params.searchQuery)
    : ''
  if (sanitizedSearch) {
    query = query.or(
      `title.ilike.%${sanitizedSearch}%,location_name.ilike.%${sanitizedSearch}%`,
    )
  }

  const range = getFeedDateRange(params?.dateFilter)
  if (range) {
    query = query
      .gte('date_time', range.start.toISOString())
      .lte('date_time', range.end.toISOString())
  }

  const { data, error } = await query.range(
    pageNum * PAGE_SIZE,
    pageNum * PAGE_SIZE + PAGE_SIZE - 1,
  )

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

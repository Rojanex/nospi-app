import { asActivityType } from '@/lib/chats/api'
import { supabase } from '@/lib/supabase'
import type { PlanActivityType, UserRole } from '@/types'

export type ActivityFingerprintItem = {
  activity_type: PlanActivityType
  count: number
}

export type PublicProfile = {
  id: string
  display_name: string | null
  avatar_url: string | null
  home_city: string | null
  role: UserRole
  is_founder: boolean
  plansCreated: number
  plansJoined: number
  fingerprint: ActivityFingerprintItem[]
}

export type ProfileWithStats = {
  id: string
  display_name: string | null
  avatar_url: string | null
  home_city: string | null
  role: UserRole
  is_founder: boolean
  onboarding_completed: boolean
  plansCreated: number
  plansJoined: number
}

export type ProfileRecentPlan = {
  id: string
  title: string
  activity_type: PlanActivityType
  date_time: string
}

type ProfileRow = {
  id: string
  display_name: string | null
  avatar_url: string | null
  home_city: string | null
  role: string
  is_founder: boolean
  onboarding_completed: boolean
}

type RecentPlanEmbed = {
  id: string
  title: string
  activity_type: string
  date_time: string
  status: string
}

type RecentMembershipRow = {
  joined_at: string
  plans: RecentPlanEmbed | RecentPlanEmbed[] | null
}

function asUserRole(value: string): UserRole {
  if (value === 'visitor' || value === 'local') return value
  return 'explorer'
}

function unwrapPlan(plans: RecentMembershipRow['plans']): RecentPlanEmbed | null {
  if (!plans) return null
  return Array.isArray(plans) ? plans[0] ?? null : plans
}

function parseFingerprint(raw: unknown): ActivityFingerprintItem[] {
  if (!Array.isArray(raw)) return []

  return raw
    .map(entry => {
      if (!entry || typeof entry !== 'object') return null
      const row = entry as { activity_type?: unknown; count?: unknown }
      const count = Number(row.count ?? 0)
      if (!Number.isFinite(count) || count <= 0) return null
      if (typeof row.activity_type !== 'string') return null

      return {
        activity_type: asActivityType(row.activity_type),
        count,
      }
    })
    .filter((item): item is ActivityFingerprintItem => item !== null)
}

function parsePublicProfileStats(raw: unknown): {
  plansCreated: number
  plansJoined: number
  fingerprint: ActivityFingerprintItem[]
} {
  const row = Array.isArray(raw) ? raw[0] : raw
  if (!row || typeof row !== 'object') {
    return { plansCreated: 0, plansJoined: 0, fingerprint: [] }
  }

  const stats = row as Record<string, unknown>

  return {
    plansCreated: Number(stats.plans_created ?? stats.plansCreated ?? 0) || 0,
    plansJoined: Number(stats.plans_joined ?? stats.plansJoined ?? 0) || 0,
    fingerprint: parseFingerprint(stats.fingerprint),
  }
}

export async function fetchPublicProfile(userId: string): Promise<PublicProfile> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, display_name, avatar_url, home_city, role, is_founder')
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    console.error('[fetchPublicProfile] profile', profileError)
    throw profileError
  }

  if (!profile) {
    throw new Error('Profile not found')
  }

  const row = profile as Omit<ProfileRow, 'onboarding_completed'>

  const { data: stats, error: statsError } = await supabase.rpc(
    'get_public_profile_stats',
    { target_user_id: userId },
  )

  if (statsError) {
    console.error('[fetchPublicProfile] stats rpc', statsError)
    throw statsError
  }

  const parsed = parsePublicProfileStats(stats)

  return {
    id: row.id,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    home_city: row.home_city,
    role: asUserRole(row.role),
    is_founder: row.is_founder,
    plansCreated: parsed.plansCreated,
    plansJoined: parsed.plansJoined,
    fingerprint: parsed.fingerprint,
  }
}

export async function fetchProfile(userId: string): Promise<ProfileWithStats> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select(
      'id, display_name, avatar_url, home_city, role, is_founder, onboarding_completed',
    )
    .eq('id', userId)
    .maybeSingle()

  if (profileError) {
    console.error('[fetchProfile] profile', profileError)
    throw profileError
  }

  if (!profile) {
    throw new Error('Profile not found')
  }

  const row = profile as ProfileRow

  const [createdResult, joinedResult] = await Promise.all([
    supabase
      .from('plans')
      .select('*', { count: 'exact', head: true })
      .eq('created_by', userId),
    supabase
      .from('plan_members')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId),
  ])

  if (createdResult.error) {
    console.error('[fetchProfile] plans count', createdResult.error)
    throw createdResult.error
  }

  if (joinedResult.error) {
    console.error('[fetchProfile] members count', joinedResult.error)
    throw joinedResult.error
  }

  return {
    id: row.id,
    display_name: row.display_name,
    avatar_url: row.avatar_url,
    home_city: row.home_city,
    role: asUserRole(row.role),
    is_founder: row.is_founder,
    onboarding_completed: row.onboarding_completed,
    plansCreated: createdResult.count ?? 0,
    plansJoined: joinedResult.count ?? 0,
  }
}

export async function fetchRecentJoinedPlans(
  userId: string,
  limit = 6,
): Promise<ProfileRecentPlan[]> {
  const { data, error } = await supabase
    .from('plan_members')
    .select(
      `
      joined_at,
      plans(
        id,
        title,
        activity_type,
        date_time,
        status
      )
      `,
    )
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[fetchRecentJoinedPlans]', error)
    throw error
  }

  const rows = (data as RecentMembershipRow[] | null) ?? []

  return rows
    .map(row => {
      const plan = unwrapPlan(row.plans)
      if (!plan) return null

      return {
        id: plan.id,
        title: plan.title,
        activity_type: asActivityType(plan.activity_type),
        date_time: plan.date_time,
      }
    })
    .filter((item): item is ProfileRecentPlan => item !== null)
}

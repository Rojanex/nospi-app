import { supabase } from '@/lib/supabase'

const UNIQUE_VIOLATION = '23505'

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session?.user) {
    throw new Error('Not authenticated')
  }
  return data.session.user.id
}

/** Non-fatal: errors return `null` (unknown) so the feed still renders without claiming "not liked". */
export async function fetchLikedPlanIds(
  planIds: string[],
  userId: string,
): Promise<Set<string> | null> {
  if (planIds.length === 0) return new Set()

  const { data, error } = await supabase
    .from('plan_likes')
    .select('plan_id')
    .eq('user_id', userId)
    .in('plan_id', planIds)

  if (error) {
    console.error('[fetchLikedPlanIds]', error)
    return null
  }

  return new Set(((data as { plan_id: string }[] | null) ?? []).map(row => row.plan_id))
}

export async function likePlan(planId: string): Promise<void> {
  const userId = await requireUserId()

  const { error } = await supabase
    .from('plan_likes')
    .insert({ plan_id: planId, user_id: userId })

  // Already liked (e.g. from another device) — desired state reached.
  if (error && error.code !== UNIQUE_VIOLATION) {
    console.error('[likePlan]', error)
    throw error
  }
}

export async function unlikePlan(planId: string): Promise<void> {
  const userId = await requireUserId()

  const { error } = await supabase
    .from('plan_likes')
    .delete()
    .eq('plan_id', planId)
    .eq('user_id', userId)

  if (error) {
    console.error('[unlikePlan]', error)
    throw error
  }
}

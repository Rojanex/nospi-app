import { strings } from '@/constants/strings'
import { insertSystemMessage } from '@/lib/chats/api'
import { notifyPlanDeleted, notifyPlansChanged } from '@/lib/plans/plansEvents'
import { supabase } from '@/lib/supabase'

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session?.user) {
    throw new Error('Not authenticated')
  }
  return data.session.user.id
}

async function getCurrentDisplayName(userId: string): Promise<string> {
  const { data } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', userId)
    .maybeSingle()

  return data?.display_name?.trim() || strings.common.someoneFallback
}

export async function deletePlan(planId: string): Promise<void> {
  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', planId)

  if (error) {
    console.error('[deletePlan]', error)
    throw error
  }
}

export async function joinPlan(planId: string): Promise<void> {
  const userId = await requireUserId()

  const { error } = await supabase.from('plan_members').insert({
    plan_id: planId,
    user_id: userId,
    role: 'member',
  })

  if (error && error.code !== '23505') { // 23505 is the code for unique constraint violation
    console.error('[joinPlan]', error)
    throw error
  }

  try {
    const displayName = await getCurrentDisplayName(userId)
    await insertSystemMessage(planId, strings.systemMessages.joinedPlanSystem({ name: displayName }))
  } catch (err) {
    console.error('[joinPlan] system message', err)
  }

  notifyPlansChanged()
}

export async function leavePlan(planId: string, isHost: boolean): Promise<void> {
  const userId = await requireUserId()

  if (isHost) {
    const { error } = await supabase.rpc('leave_plan_as_host', {
      target_plan_id: planId,
    })
    if (error) {
      console.error('[leavePlan] host rpc', error)
      throw error
    }
    notifyPlanDeleted(planId)
    return
  }

  const displayName = await getCurrentDisplayName(userId)
  await insertSystemMessage(planId, strings.systemMessages.leftPlanSystem({ name: displayName }))

  const { error } = await supabase
    .from('plan_members')
    .delete()
    .eq('plan_id', planId)
    .eq('user_id', userId)

  if (error) {
    console.error('[leavePlan] delete member', error)
    throw error
  }

  notifyPlanDeleted(planId)
}

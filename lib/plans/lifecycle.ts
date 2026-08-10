import { strings } from '@/constants/strings'
import { insertSystemMessage } from '@/lib/chats/api'
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
  const userId = await requireUserId()

  const { error } = await supabase
    .from('plans')
    .delete()
    .eq('id', planId)
    .eq('created_by', userId)

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

  if (error) {
    console.error('[joinPlan]', error)
    throw error
  }

  const displayName = await getCurrentDisplayName(userId)
  await insertSystemMessage(planId, strings.systemMessages.joinedPlanSystem(displayName))
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
    return
  }

  const displayName = await getCurrentDisplayName(userId)

  const { error } = await supabase
    .from('plan_members')
    .delete()
    .eq('plan_id', planId)
    .eq('user_id', userId)

  if (error) {
    console.error('[leavePlan] delete member', error)
    throw error
  }

  await insertSystemMessage(planId, strings.systemMessages.leftPlanSystem(displayName))
}

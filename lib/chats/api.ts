import { PlanStatus } from '@/constants/planStatus'
import { strings } from '@/constants/strings'
import { avatarColorsForId, initialsFromName } from '@/lib/utils/avatar'
import { supabase } from '@/lib/supabase'
import { ChatListItem, ChatMessage, Participant, PlanActivityType, PlanMetaRow } from '@/types'

type DbPlanStatus = 'active' | 'expired' | 'completed'

type PlanEmbed = {
  id: string
  title: string
  activity_type: string
  status: DbPlanStatus
  date_time: string
}

type MembershipRow = {
  plan_id: string
  role: 'host' | 'member'
  archived_at: string | null
  plans: PlanEmbed | PlanEmbed[] | null
}

type MessagePreviewRow = {
  plan_id: string
  content: string
  created_at: string
  user_id: string | null
}

type ProfileEmbed = { display_name: string | null; avatar_url: string | null }

type MessageRow = {
  id: string
  content: string
  type: string
  user_id: string | null
  created_at: string
  profiles: ProfileEmbed | ProfileEmbed[] | null
}

type MemberRow = {
  user_id: string
  role: 'host' | 'member'
  profiles: ProfileEmbed | ProfileEmbed[] | null
}

export function mapPlanStatusToUi(status: DbPlanStatus): PlanStatus {
  if (status === 'active') return PlanStatus.ACTIVE
  return PlanStatus.EXPIRED
}

function unwrapPlan(plans: MembershipRow['plans']): PlanEmbed | null {
  if (!plans) return null
  return Array.isArray(plans) ? plans[0] ?? null : plans
}

function unwrapProfile(
  profiles: ProfileEmbed | ProfileEmbed[] | null | undefined,
): ProfileEmbed | null {
  if (!profiles) return null
  return Array.isArray(profiles) ? profiles[0] ?? null : profiles
}

function formatTimestampLabel(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export function asActivityType(value: string): PlanActivityType {
  const allowed: PlanActivityType[] = [
    'social',
    'playa',
    'rumba',
    'deporte',
    'comida',
    'cultura',
    'naturaleza',
    'otro',
  ]
  return (allowed.includes(value as PlanActivityType) ? value : 'otro') as PlanActivityType
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session?.user) {
    throw new Error('Not authenticated')
  }
  return data.session.user.id
}

export async function fetchPlanMeta(planId: string): Promise<PlanMetaRow | null> {
  const [{ data: plan, error: planError }, { data: lastMsg, error: messageError }] =
    await Promise.all([
      supabase
        .from('plans')
        .select('id, title, activity_type, status')
        .eq('id', planId)
        .maybeSingle(),
      supabase
        .from('messages')
        .select('content, created_at')
        .eq('plan_id', planId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ])

  if (planError) {
    console.error('[fetchPlanMeta]', planError)
    throw planError
  }
  if (messageError) {
    console.error('[fetchPlanMeta]', messageError)
    throw messageError
  }

  if (!plan) return null

  return {
    id: plan.id,
    title: plan.title,
    activity_type: plan.activity_type,
    status: plan.status as DbPlanStatus,
    previewText: lastMsg?.content ?? '',
    timeLabel: lastMsg ? formatTimestampLabel(lastMsg.created_at) : '',
  }
}

export async function fetchChatList(): Promise<ChatListItem[]> {
  const userId = await requireUserId()

  const { data: memberships, error } = await supabase
    .from('plan_members')
    .select(
      'plan_id, role, archived_at, plans(id, title, activity_type, status, date_time)',
    )
    .eq('user_id', userId)

  if (error) {
    console.error('[fetchChatList] memberships', error)
    throw error
  }

  const rows = (memberships as MembershipRow[] | null) ?? []
  if (rows.length === 0) return []

  const planIds = rows.map(row => row.plan_id)

  const [{ data: allMembers, error: membersError }, { data: recentMessages, error: messagesError }] =
    await Promise.all([
      supabase.from('plan_members').select('plan_id').in('plan_id', planIds),
      supabase
        .from('messages')
        .select('plan_id, content, created_at, user_id')
        .in('plan_id', planIds)
        .order('created_at', { ascending: false }),
    ])

  if (membersError) {
    console.error('[fetchChatList] member counts', membersError)
    throw membersError
  }
  if (messagesError) {
    console.error('[fetchChatList] last messages', messagesError)
    throw messagesError
  }

  const memberCounts = new Map<string, number>()
  for (const row of allMembers ?? []) {
    const planId = (row as { plan_id: string }).plan_id
    memberCounts.set(planId, (memberCounts.get(planId) ?? 0) + 1)
  }

  const lastMessageByPlan = new Map<string, MessagePreviewRow>()
  for (const row of (recentMessages as MessagePreviewRow[] | null) ?? []) {
    if (!lastMessageByPlan.has(row.plan_id)) {
      lastMessageByPlan.set(row.plan_id, row)
    }
  }

  return rows
    .map(row => {
      const plan = unwrapPlan(row.plans)
      if (!plan) return null

      const last = lastMessageByPlan.get(row.plan_id)

      const item: ChatListItem = {
        id: plan.id,
        activityType: asActivityType(plan.activity_type),
        title: plan.title,
        previewText: last?.content ?? '',
        timeLabel: last ? formatTimestampLabel(last.created_at) : '',
        memberCount: memberCounts.get(row.plan_id) ?? 0,
        isHost: row.role === 'host',
        status: mapPlanStatusToUi(plan.status),
        archivedAt: row.archived_at,
      }
      return item
    })
    .filter((item): item is ChatListItem => item !== null)
}

export async function fetchMessages(planId: string): Promise<ChatMessage[]> {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('messages')
    .select('id, content, type, user_id, created_at, profiles(display_name, avatar_url)')
    .eq('plan_id', planId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[fetchMessages]', error)
    throw error
  }

  return ((data as unknown as MessageRow[] | null) ?? []).map(row => {
    const isSystem = row.user_id === null || row.type === 'system'
    if (isSystem) {
      return {
        id: row.id,
        type: 'system' as const,
        content: row.content,
        timeLabel: formatTimestampLabel(row.created_at),
      }
    }

    const profile = unwrapProfile(row.profiles)
    const name = profile?.display_name?.trim() || 'Usuario'
    const colors = avatarColorsForId(row.user_id!)

    return {
      id: row.id,
      type: 'user' as const,
      content: row.content,
      timeLabel: formatTimestampLabel(row.created_at),
      isOwn: row.user_id === userId,
      sender:
        row.user_id === userId
          ? undefined
          : {
              name,
              initials: initialsFromName(name),
              bg: colors.bg,
              text: colors.text,
            },
    }
  })
}

export async function fetchParticipants(planId: string): Promise<Participant[]> {
  const userId = await requireUserId()

  const { data, error } = await supabase
    .from('plan_members')
    .select('user_id, role, profiles(display_name, avatar_url)')
    .eq('plan_id', planId)

  if (error) {
    console.error('[fetchParticipants]', error)
    throw error
  }

  return ((data as unknown as MemberRow[] | null) ?? []).map(row => {
    const profile = unwrapProfile(row.profiles)
    const name = profile?.display_name?.trim() || 'Usuario'
    const colors = avatarColorsForId(row.user_id)
    return {
      id: row.user_id,
      name,
      initials: initialsFromName(name),
      avatarBg: colors.bg,
      avatarText: colors.text,
      role: row.role,
      isSelf: row.user_id === userId,
    }
  })
}

export async function sendMessage(planId: string, content: string): Promise<void> {
  const userId = await requireUserId()

  const { error } = await supabase.from('messages').insert({
    plan_id: planId,
    user_id: userId,
    content,
    type: 'text',
  })

  if (error) {
    console.error('[sendMessage]', error)
    throw error
  }
}

export async function insertSystemMessage(planId: string, content: string): Promise<void> {
  const { error } = await supabase.from('messages').insert({
    plan_id: planId,
    user_id: null,
    content,
    type: 'system',
  })

  if (error) {
    console.error('[insertSystemMessage]', error)
    throw error
  }
}

export async function archiveChat(planId: string): Promise<void> {
  const userId = await requireUserId()

  const { error } = await supabase
    .from('plan_members')
    .update({ archived_at: new Date().toISOString() })
    .eq('plan_id', planId)
    .eq('user_id', userId)

  if (error) {
    console.error('[archiveChat]', error)
    throw error
  }
}

export async function unarchiveChat(planId: string): Promise<void> {
  const userId = await requireUserId()

  const { error } = await supabase
    .from('plan_members')
    .update({ archived_at: null })
    .eq('plan_id', planId)
    .eq('user_id', userId)

  if (error) {
    console.error('[unarchiveChat]', error)
    throw error
  }
}

export async function removeMember(
  planId: string,
  targetUserId: string,
  targetName: string,
): Promise<void> {
  const { error } = await supabase
    .from('plan_members')
    .delete()
    .eq('plan_id', planId)
    .eq('user_id', targetUserId)

  if (error) {
    console.error('[removeMember]', error)
    throw error
  }

  await insertSystemMessage(planId, strings.systemMessages.removedMemberSystem(targetName))
}

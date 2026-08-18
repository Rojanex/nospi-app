import { PlanStatus } from '@/constants/planStatus'
import { strings } from '@/constants/strings'
import {
  CHAT_LIST_CACHE_TTL_MS,
  MESSAGES_CACHE_TTL_MS,
  MESSAGES_PAGE_SIZE,
} from '@/lib/env_reader'
import { avatarColorsForId, initialsFromName } from '@/lib/utils/avatar'
import { resolveSystemContent, systemPayloadFromName } from '@/lib/chats/systemMessage'
import { notifyPlansChanged } from '@/lib/plans/plansEvents'
import { supabase } from '@/lib/supabase'
import { ChatListItem, ChatMessage, Participant, PlanActivityType, PlanMetaRow } from '@/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

type DbPlanStatus = 'active' | 'expired' | 'completed'

type ProfileEmbed = { display_name: string | null; avatar_url: string | null }

type MessagePreviewEmbed = {
  content: string
  created_at: string
  user_id: string | null
  profiles?: ProfileEmbed | ProfileEmbed[] | null
}

type PlanEmbed = {
  id: string
  title: string
  activity_type: string
  status: DbPlanStatus
  date_time: string
  messages?: MessagePreviewEmbed[] | null
}

type MembershipRow = {
  plan_id: string
  role: 'host' | 'member'
  archived_at: string | null
  plans: PlanEmbed | PlanEmbed[] | null
}

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

function previewTextFromMessage(
  content: string,
  displayName?: string | null,
): string {
  return resolveSystemContent(content, systemPayloadFromName(displayName))
}

export async function resolveMessagePreview(message: {
  content: string
  user_id: string | null
}): Promise<string> {
  if (!message.user_id) return previewTextFromMessage(message.content)

  const { data } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', message.user_id)
    .maybeSingle()

  return previewTextFromMessage(message.content, data?.display_name)
}

export function formatTimestampLabel(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

export type ThreadMessageInsert = {
  id: string
  plan_id: string
  user_id: string | null
content: string
  type: string
  created_at: string
}

export function mapRealtimeMessageToChatMessage(
  row: ThreadMessageInsert,
  currentUserId: string | null,
  participants: Participant[],
): ChatMessage {
  const isSystem = row.user_id === null || row.type === 'system'
  if (isSystem) {
    const name = participants.find(p => p.id === row.user_id)?.name
    return {
      id: row.id,
      type: 'system',
      content: resolveSystemContent(row.content, systemPayloadFromName(name)),
      createdAt: row.created_at,
      timeLabel: formatTimestampLabel(row.created_at),
    }
  }

  const isOwn = currentUserId != null && row.user_id === currentUserId
  if (isOwn) {
    return {
      id: row.id,
      type: 'user',
      content: row.content,
      createdAt: row.created_at,
      timeLabel: formatTimestampLabel(row.created_at),
      isOwn: true,
    }
  }

  const participant = participants.find(p => p.id === row.user_id)
  const name = participant?.name ?? strings.common.userFallback
  const colors = participant
    ? { bg: participant.avatarBg, text: participant.avatarText }
    : avatarColorsForId(row.user_id!)

  return {
    id: row.id,
    type: 'user',
    content: row.content,
    createdAt: row.created_at,
    timeLabel: formatTimestampLabel(row.created_at),
    isOwn: false,
    sender: {
      name,
      initials: participant?.initials ?? initialsFromName(name),
      bg: colors.bg,
      text: colors.text,
    },
  }
}

export function subscribeToChatPreviews(
  planIds: string[],
  onNewMessage: (message: ThreadMessageInsert) => void,
): RealtimeChannel | null {
  if (planIds.length === 0) return null

  const channel = supabase
    .channel('chat-list-previews')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `plan_id=in.(${planIds.join(',')})`,
      },
      payload => {
        onNewMessage(payload.new as ThreadMessageInsert)
      },
    )
    .subscribe()

  return channel
}

export function subscribeToThreadMessages(
  planId: string,
  onNewMessage: (message: ThreadMessageInsert) => void,
): RealtimeChannel {
  const channel = supabase
    .channel(`thread-messages-${planId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `plan_id=eq.${planId}`,
      },
      payload => {
        onNewMessage(payload.new as ThreadMessageInsert)
      },
    )
    .subscribe()

  return channel
}

export type ThreadParticipantChange = {
  eventType: 'INSERT' | 'DELETE'
  row: { user_id: string; plan_id: string }
}

export function subscribeToThreadParticipants(
  planId: string,
  onParticipantChange: (event: ThreadParticipantChange) => void,
): RealtimeChannel {
  const channel = supabase
    .channel(`thread-participants-${planId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'plan_members',
        filter: `plan_id=eq.${planId}`,
      },
      payload => {
        // Archive/unarchive update archived_at; leave/remove are DELETE. Ignore UPDATE.
        if (payload.eventType === 'UPDATE') return

        if (payload.eventType === 'INSERT') {
          const row = payload.new as { user_id: string; plan_id: string }
          onParticipantChange({ eventType: 'INSERT', row })
          return
        }

        if (payload.eventType === 'DELETE') {
          const row = payload.old as { user_id: string; plan_id: string }
          onParticipantChange({ eventType: 'DELETE', row })
        }
      },
    )
    .subscribe()

  return channel
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

let _cachedUserId: string | null = null

export function setCachedUserId(id: string | null): void {
  _cachedUserId = id
}

export function clearUserIdCache(): void {
  _cachedUserId = null
}

async function requireUserId(): Promise<string> {
  if (_cachedUserId) return _cachedUserId
  const { data, error } = await supabase.auth.getSession()
  if (error || !data.session?.user) {
    throw new Error('Not authenticated')
  }
  _cachedUserId = data.session.user.id
  return _cachedUserId
}

type ChatListCacheEntry = { data: ChatListItem[]; fetchedAt: number }
let _chatListCache: ChatListCacheEntry | null = null

export function getChatListCache(): ChatListItem[] | null {
  if (!_chatListCache || Date.now() - _chatListCache.fetchedAt > CHAT_LIST_CACHE_TTL_MS) return null
  return _chatListCache.data
}

export function setChatListCache(data: ChatListItem[]): void {
  _chatListCache = { data, fetchedAt: Date.now() }
}

export function clearChatListCache(): void {
  _chatListCache = null
}

function patchChatListArchivedAt(planId: string, archivedAt: string | null): void {
  const cached = getChatListCache()
  if (!cached) return
  setChatListCache(
    cached.map(item => (item.id === planId ? { ...item, archivedAt } : item)),
  )
}

type MessagesCacheEntry = {
  data: ChatMessage[]
  hasMore: boolean
  fetchedAt: number
}
const _messagesCacheByPlan = new Map<string, MessagesCacheEntry>()

export type MessagesCacheMeta = {
  messages: ChatMessage[]
  hasMore: boolean
}

export function getMessagesCacheMeta(planId: string): MessagesCacheMeta | null {
  const entry = _messagesCacheByPlan.get(planId)
  if (!entry || Date.now() - entry.fetchedAt > MESSAGES_CACHE_TTL_MS) return null
  return { messages: entry.data, hasMore: entry.hasMore }
}

export function getMessagesCache(planId: string): ChatMessage[] | null {
  return getMessagesCacheMeta(planId)?.messages ?? null
}

/** When `hasMore` is omitted, keep the previous flag (realtime / merge updates). */
export function setMessagesCache(
  planId: string,
  data: ChatMessage[],
  hasMore?: boolean,
): void {
  const existing = _messagesCacheByPlan.get(planId)
  _messagesCacheByPlan.set(planId, {
    data,
    hasMore: hasMore ?? existing?.hasMore ?? false,
    fetchedAt: Date.now(),
  })
}

export function clearMessagesCache(): void {
  _messagesCacheByPlan.clear()
}

export function prefetchMessages(planId: string): void {
  fetchMessagesPage(planId)
    .then(page => setMessagesCache(planId, page.messages, page.hasMore))
    .catch(() => {})
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
        .select('content, created_at, user_id, profiles(display_name)')
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
    previewText: lastMsg
      ? previewTextFromMessage(
          lastMsg.content,
          unwrapProfile(lastMsg.profiles as ProfileEmbed | ProfileEmbed[] | null)?.display_name,
        )
      : '',
    timeLabel: lastMsg ? formatTimestampLabel(lastMsg.created_at) : '',
  }
}

export async function fetchChatList(): Promise<ChatListItem[]> {
  const userId = await requireUserId()

  const { data: memberships, error } = await supabase
    .from('plan_members')
    .select(
      `
      plan_id,
      role,
      archived_at,
      plans(
        id,
        title,
        activity_type,
        status,
        date_time,
        messages(content, created_at, user_id, profiles(display_name))
      )
      `,
    )
    .eq('user_id', userId)
    .order('created_at', { referencedTable: 'plans.messages', ascending: false })
    .limit(1, { referencedTable: 'plans.messages' })

  if (error) {
    console.error('[fetchChatList] memberships', error)
    throw error
  }

  const rows = (memberships as MembershipRow[] | null) ?? []
  if (rows.length === 0) return []

  const planIds = rows.map(row => row.plan_id)

  const { data: allMembers, error: membersError } = await supabase
    .from('plan_members')
    .select('plan_id')
    .in('plan_id', planIds)

  if (membersError) {
    console.error('[fetchChatList] member counts', membersError)
    throw membersError
  }

  const memberCounts = new Map<string, number>()
  for (const row of allMembers ?? []) {
    const planId = (row as { plan_id: string }).plan_id
    memberCounts.set(planId, (memberCounts.get(planId) ?? 0) + 1)
  }

  const result = rows
    .map(row => {
      const plan = unwrapPlan(row.plans)
      if (!plan) return null

      const last = plan.messages?.[0] ?? null

      const item: ChatListItem = {
        id: plan.id,
        activityType: asActivityType(plan.activity_type),
        title: plan.title,
        previewText: last
          ? previewTextFromMessage(
              last.content,
              unwrapProfile(last.profiles)?.display_name,
            )
          : '',
        timeLabel: last ? formatTimestampLabel(last.created_at) : '',
        lastMessageAt: last?.created_at ?? null,
        memberCount: memberCounts.get(row.plan_id) ?? 0,
        isHost: row.role === 'host',
        status: mapPlanStatusToUi(plan.status),
        archivedAt: row.archived_at,
      }
      return item
    })
    .filter((item): item is ChatListItem => item !== null)
    .sort((a, b) => {
      const aTime = a.lastMessageAt ?? ''
      const bTime = b.lastMessageAt ?? ''
      if (aTime === bTime) return 0
      if (!aTime) return 1
      if (!bTime) return -1
      return bTime.localeCompare(aTime)
    })

  setChatListCache(result)
  return result
}

export type MessagesPage = {
  messages: ChatMessage[]
  hasMore: boolean
}

function mapMessageRow(row: MessageRow, userId: string): ChatMessage {
  const isSystem = row.user_id === null || row.type === 'system'
  if (isSystem) {
    const name = unwrapProfile(row.profiles)?.display_name
    return {
      id: row.id,
      type: 'system',
      content: resolveSystemContent(row.content, systemPayloadFromName(name)),
      createdAt: row.created_at,
      timeLabel: formatTimestampLabel(row.created_at),
    }
  }

  const profile = unwrapProfile(row.profiles)
  const name = profile?.display_name?.trim() || strings.common.userFallback
  const colors = avatarColorsForId(row.user_id!)

  return {
    id: row.id,
    type: 'user',
    content: row.content,
    createdAt: row.created_at,
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
}

/**
 * Cursor page of messages (newest-first query, returned chronological).
 * Pass `beforeCreatedAt` to load older history while scrolling up.
 */
export async function fetchMessagesPage(
  planId: string,
  opts: { beforeCreatedAt?: string; limit?: number } = {},
): Promise<MessagesPage> {
  const userId = await requireUserId()
  const limit = opts.limit ?? MESSAGES_PAGE_SIZE

  let query = supabase
    .from('messages')
    .select('id, content, type, user_id, created_at, profiles(display_name, avatar_url)')
    .eq('plan_id', planId)
    .order('created_at', { ascending: false })
    .limit(limit + 1)

  if (opts.beforeCreatedAt) {
    query = query.lt('created_at', opts.beforeCreatedAt)
  }

  const { data, error } = await query

  if (error) {
    console.error('[fetchMessagesPage]', error)
    throw error
  }

  const rows = (data as unknown as MessageRow[] | null) ?? []
  const hasMore = rows.length > limit
  const pageRows = rows.slice(0, limit).reverse()
  const messages = pageRows.map(row => mapMessageRow(row, userId))

  if (!opts.beforeCreatedAt) {
    setMessagesCache(planId, messages, hasMore)
  }

  return { messages, hasMore }
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
    const name = profile?.display_name?.trim() || strings.common.userFallback
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

/** Single member + profile for a plan. planId is required so .maybeSingle() is safe across multi-plan users. */
export async function fetchParticipantProfile(
  planId: string,
  userId: string,
): Promise<Participant> {
  const currentUserId = await requireUserId()

  const { data, error } = await supabase
    .from('plan_members')
    .select('user_id, role, profiles(display_name, avatar_url)')
    .eq('plan_id', planId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    console.error('[fetchParticipantProfile]', error)
    throw error
  }
  if (!data) {
    throw new Error('Participant not found')
  }

  const row = data as unknown as MemberRow
  const profile = unwrapProfile(row.profiles)
  const name = profile?.display_name?.trim() || strings.common.userFallback
  const colors = avatarColorsForId(row.user_id)

  return {
    id: row.user_id,
    name,
    initials: initialsFromName(name),
    avatarBg: colors.bg,
    avatarText: colors.text,
    role: row.role,
    isSelf: row.user_id === currentUserId,
  }
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
  const archivedAt = new Date().toISOString()

  const { error } = await supabase
    .from('plan_members')
    .update({ archived_at: archivedAt })
    .eq('plan_id', planId)
    .eq('user_id', userId)

  if (error) {
    console.error('[archiveChat]', error)
    throw error
  }

  patchChatListArchivedAt(planId, archivedAt)
  notifyPlansChanged()
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

  patchChatListArchivedAt(planId, null)
  notifyPlansChanged()
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

  await insertSystemMessage(planId, strings.systemMessages.removedMemberSystem({ name: targetName }))
}

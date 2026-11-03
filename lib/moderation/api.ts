import { strings } from '@/constants/strings'
import { clearChatListCache, clearMessagesCache } from '@/lib/chats/api'
import { notifyPlansChanged } from '@/lib/plans/plansEvents'
import { supabase } from '@/lib/supabase'
import { avatarColorsForId, initialsFromName } from '@/lib/utils/avatar'

/** Postgres unique_violation: already reported / already blocked. */
const UNIQUE_VIOLATION = '23505'

export type ReportTargetType = 'user' | 'plan' | 'message'

/** Must match the `public.report_reason` enum. */
export type ReportReason =
  | 'spam'
  | 'harassment'
  | 'inappropriate'
  | 'impersonation'
  | 'underage'
  | 'other'

/** Order shown in the report sheet. */
export const REPORT_REASONS: ReportReason[] = [
  'spam',
  'harassment',
  'inappropriate',
  'impersonation',
  'underage',
  'other',
]

export type ReportTarget = {
  type: ReportTargetType
  id: string
}

export type BlockedUser = {
  id: string
  name: string
  initials: string
  avatarUrl: string | null
  avatarBg: string
  avatarText: string
  blockedAt: string
}

type BlockedRow = {
  blocked_id: string
  created_at: string
  profiles:
    | { display_name: string | null; avatar_url: string | null }
    | { display_name: string | null; avatar_url: string | null }[]
    | null
}

/**
 * Insert-only: reporter_id is filled by the column default (auth.uid()) and enforced by RLS.
 * Reporting the same thing twice counts as success.
 */
export async function reportContent(
  target: ReportTarget,
  reason: ReportReason,
  details?: string,
): Promise<void> {
  const { error } = await supabase.from('reports').insert({
    target_type: target.type,
    target_id: target.id,
    reason,
    details: details?.trim() || null,
  })

  if (error && error.code !== UNIQUE_VIOLATION) {
    console.error('[reportContent]', error)
    throw error
  }
}

/**
 * Blocked users' plans and messages are hidden by RLS, so local caches must be refetched.
 * Exported for callers that pass `refresh: false` and refresh later (see PlanDetailModal).
 */
export function refreshAfterBlockChange(): void {
  clearChatListCache()
  clearMessagesCache()
  notifyPlansChanged()
}

type BlockOptions = {
  /**
   * Refresh feeds and chat caches right away (default). Pass false when the refresh would
   * unmount the screen that is still showing sheets, and call refreshAfterBlockChange()
   * once they are closed.
   */
  refresh?: boolean
}

export async function blockUser(userId: string, { refresh = true }: BlockOptions = {}): Promise<void> {
  const { error } = await supabase.from('blocks').insert({ blocked_id: userId })

  if (error && error.code !== UNIQUE_VIOLATION) {
    console.error('[blockUser]', error)
    throw error
  }

  if (refresh) refreshAfterBlockChange()
}

export async function unblockUser(
  userId: string,
  { refresh = true }: BlockOptions = {},
): Promise<void> {
  const { error } = await supabase.from('blocks').delete().eq('blocked_id', userId)

  if (error) {
    console.error('[unblockUser]', error)
    throw error
  }

  if (refresh) refreshAfterBlockChange()
}

export async function isUserBlocked(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('blocks')
    .select('blocked_id')
    .eq('blocked_id', userId)
    .maybeSingle()

  if (error) {
    console.error('[isUserBlocked]', error)
    throw error
  }

  return data !== null
}

export async function fetchBlockedUsers(): Promise<BlockedUser[]> {
  const { data, error } = await supabase
    .from('blocks')
    .select('blocked_id, created_at, profiles!blocks_blocked_id_fkey(display_name, avatar_url)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[fetchBlockedUsers]', error)
    throw error
  }

  return ((data as unknown as BlockedRow[] | null) ?? []).map(row => {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] ?? null : row.profiles
    const name = profile?.display_name?.trim() || strings.common.userFallback
    const colors = avatarColorsForId(row.blocked_id)
    return {
      id: row.blocked_id,
      name,
      initials: initialsFromName(name),
      avatarUrl: profile?.avatar_url ?? null,
      avatarBg: colors.bg,
      avatarText: colors.text,
      blockedAt: row.created_at,
    }
  })
}

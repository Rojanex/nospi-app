import { strings } from '@/constants/strings'
import { resolveSystemContent, systemPayloadFromName } from '@/lib/chats/systemMessage'
import { MESSAGES_CACHE_TTL_MS } from '@/lib/env_reader'
import { supabase } from '@/lib/supabase'
import { PlanMessagePreview } from '@/types'

type PreviewRpc = 'get_plan_message_preview_card' | 'get_plan_message_preview_modal'

type PlanMessagePreviewRow = {
  message_id: string
  content: string
  created_at: string
  user_id: string | null
  display_name: string | null
  avatar_url: string | null
}

type CacheEntry = { data: PlanMessagePreview[]; fetchedAt: number }

const caches: Record<PreviewRpc, Map<string, CacheEntry>> = {
  get_plan_message_preview_card: new Map(),
  get_plan_message_preview_modal: new Map(),
}
const inFlight: Record<PreviewRpc, Map<string, Promise<PlanMessagePreview[]>>> = {
  get_plan_message_preview_card: new Map(),
  get_plan_message_preview_modal: new Map(),
}

function mapRow(row: PlanMessagePreviewRow): PlanMessagePreview {
  const senderName = row.display_name?.trim() || strings.common.userFallback
  return {
    id: row.message_id,
    content: row.user_id
      ? row.content
      : resolveSystemContent(row.content, systemPayloadFromName(row.display_name)),
    createdAt: row.created_at,
    userId: row.user_id,
    senderName,
    avatarUrl: row.avatar_url,
  }
}

function getCached(
  rpc: PreviewRpc,
  planId: string,
  allowStale = false,
): PlanMessagePreview[] | null {
  const entry = caches[rpc].get(planId)
  if (!entry) return null
  if (!allowStale && Date.now() - entry.fetchedAt > MESSAGES_CACHE_TTL_MS) return null
  return entry.data
}

/** Returns messages oldest → newest; the RPC resolves its own row limit. */
function callPreviewRpc(rpc: PreviewRpc, planId: string): Promise<PlanMessagePreview[]> {
  const pending = inFlight[rpc].get(planId)
  if (pending) return pending

  const request = (async () => {
    const { data, error } = await supabase.rpc(rpc, { p_plan_id: planId })
    if (error) {
      console.error(`[${rpc}]`, error)
      throw error
    }
    const messages = ((data as PlanMessagePreviewRow[] | null) ?? [])
      .map(mapRow)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    caches[rpc].set(planId, { data: messages, fetchedAt: Date.now() })
    return messages
  })().finally(() => {
    inFlight[rpc].delete(planId)
  })

  inFlight[rpc].set(planId, request)
  return request
}

export function getCachedPlanMessagePreviewCard(planId: string) {
  return getCached('get_plan_message_preview_card', planId)
}

export function getCachedPlanMessagePreviewModal(planId: string) {
  return getCached('get_plan_message_preview_modal', planId)
}

/** Placeholder while the modal loads: fresh modal rows, else the card's rows at any age. */
export function getPlanMessagePreviewModalSeed(planId: string) {
  return (
    getCached('get_plan_message_preview_modal', planId) ??
    getCached('get_plan_message_preview_card', planId, true)
  )
}

export function fetchPlanMessagePreviewCard(planId: string) {
  return callPreviewRpc('get_plan_message_preview_card', planId)
}

export function fetchPlanMessagePreviewModal(planId: string) {
  return callPreviewRpc('get_plan_message_preview_modal', planId)
}

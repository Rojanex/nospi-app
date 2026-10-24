import { fetchLikedPlanIds, likePlan, unlikePlan } from '@/lib/plans/likes'

type LikeEntry = {
  /** What the UI shows (optimistic). */
  liked: boolean
  /** Last state confirmed by the server. */
  server: boolean
  syncing: boolean
  /** Fetches that started before this are stale for this plan. */
  touchedAt: number
}

const entries = new Map<string, LikeEntry>()
const listeners = new Set<() => void>()
let version = 0

function emit() {
  version += 1
  listeners.forEach(listener => listener())
}

/** Changes whenever any like changes; lets list views re-filter via useSyncExternalStore. */
export function getLikesVersion(): number {
  return version
}

export function subscribeLikes(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getStoredLike(planId: string): boolean | undefined {
  return entries.get(planId)?.liked
}

/** `fetchedAt` must be taken before the query starts so in-flight toggles aren't overwritten. */
export function recordFetchedLikes(
  planIds: string[],
  likedPlanIds: ReadonlySet<string>,
  fetchedAt: number,
) {
  let changed = false
  for (const planId of planIds) {
    const liked = likedPlanIds.has(planId)
    const entry = entries.get(planId)
    if (!entry) {
      entries.set(planId, { liked, server: liked, syncing: false, touchedAt: 0 })
      changed = true
      continue
    }
    if (entry.syncing || entry.touchedAt > fetchedAt) continue
    if (entry.liked !== liked || entry.server !== liked) {
      entry.liked = liked
      entry.server = liked
      changed = true
    }
  }
  if (changed) emit()
}

/** Loads the user's likes for a page of plans in one query and seeds the store. `null` = unknown. */
export async function loadLikedPlanIds(
  planIds: string[],
  userId: string,
): Promise<Set<string> | null> {
  const fetchedAt = Date.now()
  const likedPlanIds = await fetchLikedPlanIds(planIds, userId)
  if (likedPlanIds) recordFetchedLikes(planIds, likedPlanIds, fetchedAt)
  return likedPlanIds
}

async function syncLike(planId: string, entry: LikeEntry) {
  if (entry.syncing) return
  entry.syncing = true
  try {
    // Taps made while a request is in flight are folded into the next pass.
    while (entry.liked !== entry.server) {
      const target = entry.liked
      await (target ? likePlan(planId) : unlikePlan(planId))
      entry.server = target
    }
  } catch (err) {
    console.error('[likeStore] toggle', err)
    entry.liked = entry.server
    emit()
  } finally {
    entry.syncing = false
    entry.touchedAt = Date.now()
  }
}

export function toggleLike(planId: string, currentLiked: boolean) {
  let entry = entries.get(planId)
  if (!entry) {
    entry = { liked: currentLiked, server: currentLiked, syncing: false, touchedAt: 0 }
    entries.set(planId, entry)
  }
  entry.liked = !entry.liked
  entry.touchedAt = Date.now()
  emit()
  void syncLike(planId, entry)
}

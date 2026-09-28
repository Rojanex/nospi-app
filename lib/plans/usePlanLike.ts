import { getStoredLike, subscribeLikes, toggleLike } from '@/lib/plans/likeStore'
import { Plan } from '@/types'
import { useCallback, useSyncExternalStore } from 'react'

export function usePlanLike(plan: Pick<Plan, 'id' | 'like_count' | 'user_liked'>) {
  const stored = useSyncExternalStore(subscribeLikes, () => getStoredLike(plan.id))
  const liked = stored ?? plan.user_liked

  // like_count and user_liked come from the same fetch, so others' likes stay consistent
  // even when the store has moved on since then.
  const likedAtFetch = plan.user_liked ?? stored ?? false
  const othersCount = Math.max(0, plan.like_count - (likedAtFetch ? 1 : 0))

  const toggle = useCallback(() => {
    if (liked === null) return
    toggleLike(plan.id, liked)
  }, [plan.id, liked])

  return {
    /** `null` while the liked state is unknown; the toggle is a no-op then. */
    liked,
    count: othersCount + (liked ? 1 : 0),
    toggle,
  }
}

import {
  fetchPlanMessagePreviewCard,
  fetchPlanMessagePreviewModal,
  getCachedPlanMessagePreviewCard,
  getCachedPlanMessagePreviewModal,
  getPlanMessagePreviewModalSeed,
} from '@/lib/plans/messagePreview'
import { PlanMessagePreview } from '@/types'
import { useEffect, useState } from 'react'

/**
 * Card preview rows plus how many more the modal will show. The card RPC doesn't
 * return a total, so the overflow count comes from the modal RPC's row count.
 */
export function usePlanCardMessagePreview(planId: string) {
  const [messages, setMessages] = useState<PlanMessagePreview[] | null>(() =>
    getCachedPlanMessagePreviewCard(planId),
  )
  const [modalCount, setModalCount] = useState<number | null>(
    () => getCachedPlanMessagePreviewModal(planId)?.length ?? null,
  )
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    const cachedCard = getCachedPlanMessagePreviewCard(planId)
    const cachedModal = getCachedPlanMessagePreviewModal(planId)
    setMessages(cachedCard)
    setModalCount(cachedModal?.length ?? null)
    setFailed(false)

    if (!cachedCard) {
      fetchPlanMessagePreviewCard(planId)
        .then(rows => {
          if (!cancelled) setMessages(rows)
        })
        .catch(() => {
          if (!cancelled) setFailed(true)
        })
    }
    if (!cachedModal) {
      fetchPlanMessagePreviewModal(planId)
        .then(rows => {
          if (!cancelled) setModalCount(rows.length)
        })
        .catch(() => {})
    }

    return () => {
      cancelled = true
    }
  }, [planId])

  const moreCount =
    messages && modalCount != null ? Math.max(0, modalCount - messages.length) : 0

  return { messages, moreCount, failed }
}

/**
 * Always refetches while `enabled`. Seeded from cache (falling back to the card's rows)
 * so the list renders immediately.
 */
export function usePlanModalMessagePreview(planId: string, enabled: boolean) {
  const [messages, setMessages] = useState<PlanMessagePreview[] | null>(() =>
    getPlanMessagePreviewModalSeed(planId),
  )
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    setMessages(getPlanMessagePreviewModalSeed(planId))
    setFailed(false)

    fetchPlanMessagePreviewModal(planId)
      .then(rows => {
        if (!cancelled) setMessages(rows)
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
    }
  }, [planId, enabled])

  return { messages, failed }
}

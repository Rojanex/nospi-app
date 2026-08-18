import { TabScreen } from '@/components/layout/TabScreen'
import { PlanCard } from '@/components/plans/PlanCard'
import { PlanCardSkeleton } from '@/components/plans/PlanCardSkeleton'
import {
  PlanDetailModal,
  PlanDetailModalHandle,
} from '@/components/plans/PlanDetailModal'
import { PlansHeader } from '@/components/plans/PlansHeader'
import { PlansHeaderSkeleton } from '@/components/plans/PlansHeaderSkeleton'
import { strings } from '@/constants/strings'
import { fetchChatList, getChatListCache, prefetchMessages } from '@/lib/chats/api'
import { fetchNextJoinedPlan, fetchPlansPage } from '@/lib/plans/api'
import { joinPlan } from '@/lib/plans/lifecycle'
import { subscribePlansChanged } from '@/lib/plans/plansEvents'
import { Plan } from '@/types'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, {
  runOnUI,
  scrollTo,
  useAnimatedRef,
} from 'react-native-reanimated'

function markPlanJoined(plan: Plan): Plan {
  if (plan.user_joined) return plan
  return {
    ...plan,
    user_joined: true,
    extra_attendees: plan.extra_attendees + 1,
    spots_left: Math.max(0, plan.spots_left - 1),
  }
}

export default function IndexScreen() {
  const router = useRouter()
  const listRef = useAnimatedRef<Animated.FlatList<Plan | string>>()
  const aboveFeedHeightRef = useRef(0)
  const peekRef = useRef<PlanDetailModalHandle>(null)
  const joiningIdsRef = useRef(new Set<string>())
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [activeFilter, setActiveFilter] = useState(strings.plansFeed.filterAll)
  const [nextPlan, setNextPlan] = useState<Plan | null>(null)
  const [peekPlan, setPeekPlan] = useState<Plan | null>(null)

  const fetchInitialData = useCallback(async () => {
    try {
      const [coming, pageResult] = await Promise.all([
        fetchNextJoinedPlan(),
        fetchPlansPage(0),
      ])
      setNextPlan(coming)
      setPlans(pageResult.plans)
      setPage(0)
      setHasMore(pageResult.more)
    } catch (err) {
      console.error('[plans feed] load', err)
    }
  }, [])

  useEffect(() => {
    fetchInitialData().finally(() => setLoading(false))
  }, [fetchInitialData])

  useEffect(() => {
    return subscribePlansChanged(() => {
      void fetchInitialData()
    })
  }, [fetchInitialData])

  useEffect(() => {
    if (!getChatListCache()) void fetchChatList().catch(() => {})
  }, [])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    const minDelay = new Promise(resolve => setTimeout(resolve, 600))
    await Promise.all([fetchInitialData(), minDelay])
    setRefreshing(false)
  }, [fetchInitialData])

  async function handleLoadMore() {
    if (loadingMore || !hasMore || loading || refreshing) return
    setLoadingMore(true)

    try {
      const nextPage = page + 1
      const { plans: newPlans, more } = await fetchPlansPage(nextPage)
      setPlans(prev => [...prev, ...newPlans])
      setPage(nextPage)
      setHasMore(more)
    } catch (err) {
      console.error('[plans feed] load more', err)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleOpenChat = useCallback((id: string) => {
    const cached = getChatListCache()?.find(item => item.id === id) ?? null
    if (cached) prefetchMessages(id)
    router.push({
      pathname: '/chats/[id]',
      params: cached ? { id, chat: JSON.stringify(cached) } : { id },
    })
  }, [router])

  const handleJoin = useCallback(async (id: string) => {
    if (joiningIdsRef.current.has(id)) return

    const current = plans.find(p => p.id === id) ?? (peekPlan?.id === id ? peekPlan : null)
    if (current?.user_joined) {
      handleOpenChat(id)
      return
    }

    joiningIdsRef.current.add(id)
    setPlans(prev => prev.map(p => (p.id === id ? markPlanJoined(p) : p)))
    setPeekPlan(prev => (prev?.id === id ? markPlanJoined(prev) : prev))
    if (nextPlan?.id === id) setNextPlan(markPlanJoined(nextPlan))

    try {
      await joinPlan(id)
      void fetchChatList().catch(() => {})
      handleOpenChat(id)
    } catch (err) {
      console.error('[plans feed] join', err)
      setPlans(prev => prev.map(p => (p.id === id && current ? current : p)))
      setPeekPlan(prev => (prev?.id === id ? current : prev))
      if (nextPlan?.id === id) setNextPlan(current)
    } finally {
      joiningIdsRef.current.delete(id)
    }
  }, [handleOpenChat, nextPlan, peekPlan, plans])

  const handleAboveFeedHeightChange = useCallback((height: number) => {
    aboveFeedHeightRef.current = height
  }, [])

  const handleScrollToFeed = useCallback(() => {
    const y = aboveFeedHeightRef.current
    if (y <= 0) return

    runOnUI(() => {
      'worklet'
      scrollTo(listRef, 0, y, true)
    })()
  }, [listRef])

  const handlePeekStart = useCallback((plan: Plan) => {
    setPeekPlan(plan)
  }, [])

  const handlePeekEnd = useCallback(() => {
    if (peekRef.current) {
      peekRef.current.dismiss()
      return
    }
    // Long-press ended before the overlay mounted — drop it immediately.
    setPeekPlan(null)
  }, [])

  const filteredPlans = activeFilter === strings.plansFeed.filterToday
    ? plans.filter(p =>
        p.date_time.toLowerCase().includes(strings.dates.today.toLowerCase()),
      )
    : plans

  const listData: readonly (Plan | string)[] = loading ? ['sk-1', 'sk-2', 'sk-3', 'sk-4'] : filteredPlans

  const listHeader = loading ? (
    <PlansHeaderSkeleton />
  ) : (
    <PlansHeader
      nextPlan={nextPlan}
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      onOpenChat={handleOpenChat}
      onScrollToFeed={handleScrollToFeed}
      onAboveFeedHeightChange={handleAboveFeedHeightChange}
    />
  )

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Plan | string>) => {
      if (loading || typeof item === 'string') {
        return <PlanCardSkeleton />
      }
      return (
        <PlanCard
          plan={item}
          onJoin={handleJoin}
          onPeekStart={handlePeekStart}
          onPeekEnd={handlePeekEnd}
        />
      )
    },
    [loading, handleJoin, handlePeekStart, handlePeekEnd],
  )

  const keyExtractor = useCallback(
    (item: Plan | string) => (typeof item === 'string' ? item : item.id),
    [],
  )

  const renderEmptyComponent = useCallback(() => (
    <View className="items-center px-6 py-12">
      <Text className="text-[15px] font-semibold text-neutral-hint text-center">
        {strings.plansFeed.emptyFeed}
      </Text>
    </View>
  ), [])

  const renderFooter = useCallback(() => {
    if (loadingMore) {
      return <PlanCardSkeleton />
    }
    if (!hasMore && plans.length > 0) {
      return (
        <View className="items-center px-6 py-12">
          <Text className="text-[15px] font-semibold text-neutral-hint text-center">
            {strings.plansFeed.endOfFeed}
          </Text>
        </View>
      )
    }
    return null
  }, [loadingMore, hasMore, plans.length])

  return (
    <TabScreen>
      <View style={styles.feedRoot}>
        <Animated.FlatList
          ref={listRef}
          data={listData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={!loading && filteredPlans.length === 0 ? renderEmptyComponent : undefined}
          ListFooterComponent={renderFooter}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            !loading ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
              />
            ) : undefined
          }
          extraData={
            loading
              ? 'loading'
              : `${activeFilter}-${refreshing}-${plans.filter(p => p.user_joined).map(p => p.id).join(',')}`
          }
          showsVerticalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
        {peekPlan ? (
          <PlanDetailModal
            ref={peekRef}
            visible
            plan={peekPlan}
            presentation="hosted"
            interactive={false}
            onClose={() => setPeekPlan(null)}
            onJoin={handleJoin}
          />
        ) : null}
      </View>
    </TabScreen>
  )
}

const styles = StyleSheet.create({
  feedRoot: {
    flex: 1,
  },
})

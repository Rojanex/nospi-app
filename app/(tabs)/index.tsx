import { TabScreen } from '@/components/layout/TabScreen'
import { PlanCard } from '@/components/plans/PlanCard'
import { PlanCardSkeleton } from '@/components/plans/PlanCardSkeleton'
import { PlansHeader } from '@/components/plans/PlansHeader'
import { PlansHeaderSkeleton } from '@/components/plans/PlansHeaderSkeleton'
import { strings } from '@/constants/strings'
import { fetchNextJoinedPlan, fetchPlansPage } from '@/lib/plans/api'
import { joinPlan } from '@/lib/plans/lifecycle'
import { subscribePlansChanged } from '@/lib/plans/plansEvents'
import { Plan } from '@/types'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ListRenderItemInfo,
  RefreshControl,
  Text,
  View,
} from 'react-native'
import Animated, {
  runOnUI,
  scrollTo,
  useAnimatedRef,
} from 'react-native-reanimated'

export default function IndexScreen() {
  const router = useRouter()
  const listRef = useAnimatedRef<Animated.FlatList<Plan | string>>()
  const aboveFeedHeightRef = useRef(0)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [activeFilter, setActiveFilter] = useState(strings.plansFeed.filterAll)
  const [nextPlan, setNextPlan] = useState<Plan | null>(null)

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

  async function handleJoin(id: string) {
    try {
      await joinPlan(id)
    } catch (err) {
      console.error('[plans feed] join', err)
    }
  }

  function handleOpenChat(id: string) {
    router.push({
      pathname: '/chats/[id]',
      params: { id },
    })
  }

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
          onOpenChat={handleOpenChat}
        />
      )
    },
    [loading],
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
        extraData={loading ? 'loading' : `${activeFilter}-${refreshing}`}
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </TabScreen>
  )
}

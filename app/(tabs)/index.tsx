import { TabScreen } from '@/components/layout/TabScreen'
import { PlanCard } from '@/components/plans/PlanCard'
import { PlanCardSkeleton } from '@/components/plans/PlanCardSkeleton'
import {
  PlanDetailModal,
  PlanDetailModalHandle,
} from '@/components/plans/PlanDetailModal'
import { FeedFilter, PlansHeader } from '@/components/plans/PlansHeader'
import { PlansHeaderSkeleton } from '@/components/plans/PlansHeaderSkeleton'
import { strings } from '@/constants/strings'
import { fetchChatList, getChatListCache, prefetchMessages } from '@/lib/chats/api'
import { fetchNextJoinedPlan, fetchPlansPage, NearMeParams } from '@/lib/plans/api'
import { getFreshDeviceCoords } from '@/lib/plans/deviceLocation'
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
  const [searchInput, setSearchInput] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [activeDateFilter, setActiveDateFilter] = useState<Exclude<FeedFilter, 'cerca'>>(null)
  const [nearMe, setNearMe] = useState<NearMeParams | null>(null)
  const [locationHint, setLocationHint] = useState<string | null>(null)
  const [nextPlan, setNextPlan] = useState<Plan | null>(null)
  const [peekPlan, setPeekPlan] = useState<Plan | null>(null)
  const feedRequestIdRef = useRef(0)
  const hasLoadedFeedRef = useRef(false)
  const [isFiltering, setIsFiltering] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setSearchQuery(searchInput), 300)
    return () => clearTimeout(timeout)
  }, [searchInput])

  const fetchInitialData = useCallback(async () => {
    const requestId = ++feedRequestIdRef.current
    setPage(0)
    try {
      const [coming, pageResult] = await Promise.all([
        fetchNextJoinedPlan(),
        fetchPlansPage(0, {
          searchQuery: searchQuery || undefined,
          dateFilter: activeDateFilter,
          nearMe,
        }),
      ])
      if (requestId !== feedRequestIdRef.current) return
      setNextPlan(coming)
      setPlans(pageResult.plans)
      setHasMore(pageResult.more)
    } catch (err) {
      console.error('[plans feed] load', err)
    }
  }, [searchQuery, activeDateFilter, nearMe])

  useEffect(() => {
    const isFilterFetch = hasLoadedFeedRef.current
    if (isFilterFetch) setIsFiltering(true)

    let cancelled = false
    fetchInitialData().finally(() => {
      if (cancelled) return
      hasLoadedFeedRef.current = true
      setLoading(false)
      setIsFiltering(false)
    })
    return () => {
      cancelled = true
    }
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
    if (loadingMore || !hasMore || loading || refreshing || isFiltering) return
    setLoadingMore(true)

    const requestId = feedRequestIdRef.current
    try {
      const nextPage = page + 1
      const { plans: newPlans, more } = await fetchPlansPage(nextPage, {
        searchQuery: searchQuery || undefined,
        dateFilter: activeDateFilter,
        nearMe,
      })
      if (requestId !== feedRequestIdRef.current) return
      setPlans(prev => [...prev, ...newPlans])
      setPage(nextPage)
      setHasMore(more)
    } catch (err) {
      console.error('[plans feed] load more', err)
    } finally {
      if (requestId === feedRequestIdRef.current) setLoadingMore(false)
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

  const activeFilter: FeedFilter = nearMe ? 'cerca' : activeDateFilter

  const handleFilterChange = useCallback(async (next: FeedFilter) => {
    setLocationHint(null)

    if (next === 'cerca') {
      if (nearMe) {
        setNearMe(null)
        return
      }
      const coords = await getFreshDeviceCoords()
      if (!coords) {
        setLocationHint(strings.plansFeed.nearbyLocationRequired)
        return
      }
      setActiveDateFilter(null)
      setNearMe({ lat: coords.lat, lng: coords.lng })
      return
    }

    setNearMe(null)
    setActiveDateFilter(next)
  }, [nearMe])

  const showCardSkeletons = loading || isFiltering
  const listData: readonly (Plan | string)[] = showCardSkeletons
    ? ['sk-1', 'sk-2', 'sk-3', 'sk-4']
    : plans

  const handleToggleSearch = useCallback(() => {
    if (searchOpen) {
      setSearchOpen(false)
      setSearchInput('')
      setSearchQuery('')
      return
    }
    setSearchOpen(true)
  }, [searchOpen])

  const listHeader = loading ? (
    <PlansHeaderSkeleton />
  ) : (
    <PlansHeader
      nextPlan={nextPlan}
      activeFilter={activeFilter}
      onFilterChange={next => { void handleFilterChange(next) }}
      locationHint={locationHint}
      searchOpen={searchOpen}
      searchText={searchInput}
      onToggleSearch={handleToggleSearch}
      onSearchTextChange={setSearchInput}
      onOpenChat={handleOpenChat}
      onScrollToFeed={handleScrollToFeed}
      onAboveFeedHeightChange={handleAboveFeedHeightChange}
    />
  )

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Plan | string>) => {
      if (loading || typeof item === 'string') {
        return <PlanCardSkeleton pulse={isFiltering} />
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
    [loading, isFiltering, handleJoin, handlePeekStart, handlePeekEnd],
  )

  const keyExtractor = useCallback(
    (item: Plan | string) => (typeof item === 'string' ? item : item.id),
    [],
  )

  const emptyFeedMessage =
    activeFilter === 'hoy'
      ? strings.plansFeed.emptyFeedToday
      : activeFilter === 'finde'
        ? strings.plansFeed.emptyFeedWeekend
        : strings.plansFeed.emptyFeed

  const endOfFeedMessage =
    activeFilter === null
      ? strings.plansFeed.endOfFeedAll
      : strings.plansFeed.endOfFeed

  const renderEmptyComponent = useCallback(() => (
    <View className="items-center px-6 py-12">
      <Text className="text-lead font-semibold text-neutral-hint text-center">
        {emptyFeedMessage}
      </Text>
    </View>
  ), [emptyFeedMessage])

  const renderFooter = useCallback(() => {
    if (isFiltering) return null
    if (loadingMore) {
      return <PlanCardSkeleton />
    }
    if (!hasMore && plans.length > 0) {
      return (
        <View className="items-center px-6 py-12">
          <Text className="text-lead font-semibold text-neutral-hint text-center">
            {endOfFeedMessage}
          </Text>
        </View>
      )
    }
    return null
  }, [isFiltering, loadingMore, hasMore, plans.length, endOfFeedMessage])

  return (
    <TabScreen>
      <View style={styles.feedRoot}>
        <Animated.FlatList
          ref={listRef}
          data={listData}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={!loading && !isFiltering && plans.length === 0 ? renderEmptyComponent : undefined}
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
              : `${searchQuery}-${activeDateFilter}-${nearMe ? `${nearMe.lat},${nearMe.lng}` : ''}-${searchOpen}-${refreshing}-${isFiltering}-${plans.filter(p => p.user_joined).map(p => p.id).join(',')}`
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

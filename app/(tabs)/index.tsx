import { Colors } from '@/assets/constants/Colors'
import { PlansHeader } from '@/components/plans/PlansHeader'
import { PlansHeaderSkeleton } from '@/components/plans/PlansHeaderSkeleton'
import { TabScreen } from '@/components/layout/TabScreen'
import { PlanCard } from '@/components/plans/PlanCard'
import { PlanCardSkeleton } from '@/components/plans/PlanCardSkeleton'
import { strings } from '@/constants/strings'
import { mapRowToPlan } from '@/lib/plans/mapRowToPlan'
import { supabase } from '@/lib/supabase'
import { Plan, PlanRow } from '@/types'
import React, { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const PAGE_SIZE = 20

export default function IndexScreen() {
  const insets = useSafeAreaInsets()
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(0)
  const [activeFilter, setActiveFilter] = useState(strings.planes.filterAll)
  const [nextPlan, setNextPlan] = useState<Plan | null>(null)

  async function fetchPlansPage(pageNum: number, currentUserId: string) {
    const { data, error } = await supabase
      .from('plans')
      .select('*, plan_members(user_id, profiles(display_name, avatar_url)), profiles!created_by(display_name, avatar_url, role)')
      .order('date_time', { ascending: true })
      .range(pageNum * PAGE_SIZE, pageNum * PAGE_SIZE + PAGE_SIZE - 1)

    if (error) {
      console.error(error)
      return { rows: [], more: false }
    }

    const rows = (data as PlanRow[]) ?? []
    const more = rows.length === PAGE_SIZE
    return { rows, more }
  }

  const fetchData = useCallback(async () => {
    const currentUserId = (await supabase.auth.getUser()).data.user?.id ?? ''

    const { data: comingPlan, error: comingPlanError } = await supabase
      .from('plans')
      .select('*, plan_members!inner(user_id, profiles(display_name, avatar_url)), profiles!created_by(display_name, avatar_url, role)')
      .eq('plan_members.user_id', currentUserId)
      .gt('date_time', new Date().toISOString())
      .order('date_time', { ascending: true })
      .limit(1)

    if (comingPlanError) {
      console.error(comingPlanError)
      setNextPlan(null)
    } else if (comingPlan?.[0]) {
      const row = comingPlan[0] as PlanRow
      setNextPlan(mapRowToPlan(row, currentUserId, row.profiles ?? undefined))
    } else {
      setNextPlan(null)
    }

    const { rows, more } = await fetchPlansPage(0, currentUserId)
    setPlans(
      rows.map(row =>
        mapRowToPlan(row, currentUserId, row.profiles ?? undefined)
      )
    )
    setPage(0)
    setHasMore(more)
  }, [])

  useEffect(() => {
    fetchData().finally(() => setLoading(false))
  }, [fetchData])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    const minDelay = new Promise(resolve => setTimeout(resolve, 600))
    await Promise.all([fetchData(), minDelay])
    setRefreshing(false)
  }, [fetchData])

  async function handleLoadMore() {
    if (loadingMore || !hasMore || loading || refreshing) return
    setLoadingMore(true)

    const currentUserId = (await supabase.auth.getUser()).data.user?.id ?? ''
    const nextPage = page + 1
    const { rows, more } = await fetchPlansPage(nextPage, currentUserId)

    const newPlans = rows.map(row =>
      mapRowToPlan(row, currentUserId, row.profiles ?? undefined)
    )

    setPlans(prev => [...prev, ...newPlans])
    setPage(nextPage)
    setHasMore(more)
    setLoadingMore(false)
  }

  function handleJoin(id: string) {
    setPlans(prev =>
      prev.map(p => p.id === id ? { ...p, user_joined: !p.user_joined } : p)
    )
  }

  const filteredPlans = activeFilter === strings.planes.filterToday
    ? plans.filter(p => p.date_time.toLowerCase().includes('hoy'))
    : plans

  const listData: readonly (Plan | string)[] = loading ? ['sk-1', 'sk-2', 'sk-3', 'sk-4'] : filteredPlans

  const renderListHeader = useCallback(
    () => (
      <View>
        {refreshing && (
          <View className="items-center py-3">
            <ActivityIndicator color={Colors.buttons.orange} />
          </View>
        )}
        {loading ? (
          <PlansHeaderSkeleton />
        ) : (
          <PlansHeader
            nextPlan={nextPlan}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        )}
      </View>
    ),
    [loading, nextPlan, activeFilter, refreshing]
  )

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Plan | string>) => {
      if (loading || typeof item === 'string') {
        return <PlanCardSkeleton />
      }
      return <PlanCard plan={item} onJoin={handleJoin} />
    },
    [loading]
  )

  const keyExtractor = useCallback(
    (item: Plan | string) => (typeof item === 'string' ? item : item.id),
    []
  )

  const renderEmptyComponent = useCallback(() => (
    <View className="items-center px-6 py-12">
      <Text className="text-[15px] font-semibold text-neutral-hint text-center">
        {strings.planes.emptyFeed}
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
            {strings.planes.endOfFeed}
          </Text>
        </View>
      )
    }
    return null
  }, [loadingMore, hasMore, plans.length])

  return (
    <TabScreen contentInsetTop={false}>
      <FlatList
        data={listData}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={!loading && filteredPlans.length === 0 ? renderEmptyComponent : undefined}
        ListFooterComponent={renderFooter}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          !loading ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Colors.buttons.orange}
              colors={[Colors.buttons.orange]}
              progressViewOffset={insets.top}
            />
          ) : undefined
        }
        extraData={loading ? 'loading' : `${activeFilter}-${refreshing}`}
        showsVerticalScrollIndicator={false}
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: 100}}
      />
    </TabScreen>
  )
}

import { TabScreen } from '@/components/layout/TabScreen'
import SplashAnimation from '@/components/SplashAnimation'
import { FeedListHeader } from '@/components/feed/FeedListHeader'
import { PlanCard } from '@/components/plans/PlanCard'
import { strings } from '@/constants/strings'
import { supabase } from '@/lib/supabase'
import { Plan } from '@/types'
import { useScrollToTop } from '@react-navigation/native'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { FlatList, StyleSheet } from 'react-native'

// TODO - la hora y las vainas de iphone cuando haga scroll mantenerse en un recuadro, (como en ig) no que las cosas se pongan detras de (como en tiktok)
// TODO - no funciona que cuando le doy click a la casita me lleve a otra vez arriba (maybe do a reload like every other app) (probably is not re-rending when its already in the tab)
// TODO - the splash maybe is not the right chose? ahora se muestra doble cuando hago reload in the simulator, and it shows with the tabs bar, that looks bad
const MOCK_PLANS: Plan[] = [
  {
    id: '1',
    title: 'Tarde en Playa Blanca',
    activity_type: 'playa',
    location_name: 'Playa Blanca, Bolívar',
    date_time: 'Hoy · 2:00 pm',
    spots_left: 7,
    is_plan_del_dia: true,
    attendees: ['A', 'M', 'J'],
    extra_attendees: 4,
    host_name: 'Mariana',
    host_initials: 'Ma',
    host_type: 'local',
    posted_ago: 'hace 23 min',
    user_joined: false,
  },
  {
    id: '2',
    title: 'Tereré y charla random',
    activity_type: 'social',
    location_name: 'Parque del Centenario',
    date_time: 'Hoy · 5:00 pm',
    spots_left: 2,
    is_plan_del_dia: false,
    attendees: ['S', 'L'],
    extra_attendees: 0,
    host_name: 'Ricardo',
    host_initials: 'Ri',
    host_type: 'turista',
    posted_ago: 'hace 1 h',
    user_joined: false,
  },
  {
    id: '3',
    title: 'Salsa en La Habana bar',
    activity_type: 'salsa',
    location_name: 'Getsemaní, Cartagena',
    date_time: 'Vie · 9:00 pm',
    spots_left: 3,
    is_plan_del_dia: false,
    attendees: ['V', 'C'],
    extra_attendees: 6,
    host_name: 'Vale',
    host_initials: 'Va',
    host_type: 'local',
    posted_ago: 'hace 3 h',
    user_joined: true,
  },
  {
    id: '4',
    title: 'Salsa en La Habana bar',
    activity_type: 'salsa',
    location_name: 'Getsemaní, Cartagena',
    date_time: 'Vie · 9:00 pm',
    spots_left: 3,
    is_plan_del_dia: false,
    attendees: ['V', 'C'],
    extra_attendees: 6,
    host_name: 'Vale',
    host_initials: 'Va',
    host_type: 'local',
    posted_ago: 'hace 3 h',
    user_joined: true,
  },
  {
    id: '5',
    title: 'Salsa en La Habana bar',
    activity_type: 'salsa',
    location_name: 'Getsemaní, Cartagena',
    date_time: 'Vie · 9:00 pm',
    spots_left: 3,
    is_plan_del_dia: false,
    attendees: ['V', 'C'],
    extra_attendees: 6,
    host_name: 'Vale',
    host_initials: 'Va',
    host_type: 'local',
    posted_ago: 'hace 3 h',
    user_joined: true,
  },
  {
    id: '6',
    title: 'Salsa en La Habana bar',
    activity_type: 'salsa',
    location_name: 'Getsemaní, Cartagena',
    date_time: 'Vie · 9:00 pm',
    spots_left: 3,
    is_plan_del_dia: false,
    attendees: ['V', 'C'],
    extra_attendees: 6,
    host_name: 'Vale',
    host_initials: 'Va',
    host_type: 'local',
    posted_ago: 'hace 3 h',
    user_joined: true,
  },
]

export default function IndexScreen() {
  const listRef = useRef<FlatList<Plan>>(null)
  useScrollToTop(listRef)

  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState(strings.planes.filterAll)
  const [nextPlan, setNextPlan] = useState<Plan | null>(null)

  useEffect(() => {
    async function fetchData() {
      const { data: nextData } = await supabase
        .from('plans')
        .select('*')
        .gt('date_time', new Date().toISOString())
        .order('date_time', { ascending: true })
        .limit(1)

      setNextPlan(nextData?.[0] ?? null)

      const { data: feedData, error } = await supabase
        .from('plans')
        .select('*, plan_members(user_id)')
        .order('date_time', { ascending: true })

      setPlans(!error && feedData?.length ? feedData : MOCK_PLANS)
      setLoading(false)
    }

    fetchData()
  }, [])

  function handleJoin(id: string) {
    setPlans(prev =>
      prev.map(p => p.id === id ? { ...p, user_joined: !p.user_joined } : p)
    )
  }

  const filteredPlans = activeFilter === strings.planes.filterToday
    ? plans.filter(p => p.date_time.toLowerCase().includes('hoy'))
    : plans

  const renderListHeader = useCallback(
    () => (
      <FeedListHeader
        nextPlan={nextPlan}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        planCount={filteredPlans.length}
      />
    ),
    [nextPlan, activeFilter, filteredPlans.length]
  )

  if (loading) {
    return <SplashAnimation loop onFinish={() => {}} />
  }

  return (
    <TabScreen contentInsetTop={false}>
      <FlatList
        ref={listRef}
        data={filteredPlans}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <PlanCard plan={item} onJoin={handleJoin} />}
        ListHeaderComponent={renderListHeader}
        extraData={activeFilter}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={styles.listContent}
      />
    </TabScreen>
  )
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
  },
})

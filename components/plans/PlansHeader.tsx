import { Colors } from '@/assets/constants/Colors'
import { TabIndexHeader } from '@/components/tabs/TabIndexHeader'
import { getActivityMeta } from '@/constants/activityMeta'
import { strings } from '@/constants/strings'
import { Plan } from '@/types'
import { useRef } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

const FILTERS = [
  strings.plansFeed.filterAll,
  strings.plansFeed.filterToday,
  strings.plansFeed.filterNearby,
  strings.plansFeed.filterFree,
]

type PlansHeaderProps = {
  nextPlan: Plan | null
  activeFilter: string
  onFilterChange: (filter: string) => void
  onOpenChat: (id: string) => void
  onScrollToFeed: () => void
  onAboveFeedHeightChange: (height: number) => void
}

export function PlansHeader({
  nextPlan,
  activeFilter,
  onFilterChange,
  onOpenChat,
  onScrollToFeed,
  onAboveFeedHeightChange,
}: PlansHeaderProps) {
  const lastHeightRef = useRef(0)

  return (
    <View>
      <View
        onLayout={e => {
          const height = e.nativeEvent.layout.height
          if (height > 0 && height !== lastHeightRef.current) {
            lastHeightRef.current = height
            onAboveFeedHeightChange(height)
          }
        }}
      >
        <View className="pt-3">
          <TabIndexHeader />
        </View>

        {nextPlan ? (
          <TouchableOpacity
            className="mx-4 mb-5 rounded-[18px] bg-black-100 p-4"
            activeOpacity={0.85}
            onPress={() => onOpenChat(nextPlan.id)}
          >
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-xl bg-white/[0.12]">
                <Text className="text-[22px]">
                  {getActivityMeta(nextPlan.activity_type.split('|')[0].trim()).emoji}
                </Text>
              </View>
              <View className="flex-1 gap-0.5">
                <Text className="text-[10px] font-bold tracking-[1px] text-buttons-orange">
                  {strings.plansFeed.nextPlanLabel}
                </Text>
                <Text className="text-[15px] font-bold text-white">
                  {nextPlan.title}
                </Text>
                <Text className="text-xs text-white/55">
                  {nextPlan.date_time} · {nextPlan.location_name}
                </Text>
              </View>
              <View className="h-9 w-9 items-center justify-center rounded-full bg-buttons-orange">
                <Text className="text-base font-bold text-white">→</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View className="mx-4 mb-5 gap-2 rounded-[18px] bg-neutral-gray p-[18px]">
            <Text className="text-[15px] font-semibold text-black-100">
              {strings.plansFeed.noNextPlan}
            </Text>
            <TouchableOpacity
              onPress={onScrollToFeed}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Text className="text-sm font-bold text-buttons-orange">
                {strings.plansFeed.noNextPlanCta}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View className="mb-2 px-5">
        <Text className="tab-section-title">{strings.plansFeed.feedHeader}</Text>
      </View>

      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        className="mb-4"
        contentContainerClassName="flex-row gap-2 px-5"
      >
        {FILTERS.map(filter => (
          <Pressable
            key={filter}
            style={[styles.chip, activeFilter === filter && styles.chipActive]}
            onPress={() => onFilterChange(filter)}
          >
            <Text style={[styles.chipText, activeFilter === filter && styles.chipTextActive]}>
              {filter}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.black[400],
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: Colors.neutral.gray,
  },
  chipActive: {
    backgroundColor: Colors.black[100],
  },
  chipTextActive: {
    color: Colors.white,
  },
})

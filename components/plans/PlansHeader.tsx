import { Colors } from '@/assets/constants/Colors'
import { TabIndexHeader } from '@/components/tabs/TabIndexHeader'
import { getActivityMeta } from '@/constants/activityMeta'
import { strings } from '@/constants/strings'
import { FontSize } from '@/constants/typography'
import { Plan } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { useRef } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'

export type FeedFilter = 'hoy' | 'finde' | 'cerca' | null

const FEED_PILLS: { label: string; value: FeedFilter }[] = [
  { label: strings.plansFeed.filterToday, value: 'hoy' },
  { label: strings.plansFeed.filterAll, value: null },
  { label: strings.plansFeed.filterWeekend, value: 'finde' },
  { label: strings.plansFeed.filterNearby, value: 'cerca' },
]

type PlansHeaderProps = {
  nextPlan: Plan | null
  activeFilter: FeedFilter
  onFilterChange: (filter: FeedFilter) => void
  locationHint: string | null
  searchOpen: boolean
  searchText: string
  onToggleSearch: () => void
  onSearchTextChange: (text: string) => void
  onOpenChat: (id: string) => void
  onScrollToFeed: () => void
  onAboveFeedHeightChange: (height: number) => void
}

export function PlansHeader({
  nextPlan,
  activeFilter,
  onFilterChange,
  locationHint,
  searchOpen,
  searchText,
  onToggleSearch,
  onSearchTextChange,
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
                <Text className="text-label font-bold tracking-[1px] text-buttons-orange">
                  {strings.plansFeed.nextPlanLabel}
                </Text>
                <Text className="text-lead font-bold text-white">
                  {nextPlan.title}
                </Text>
                <Text className="text-caption text-white/55">
                  {nextPlan.date_time} · {nextPlan.location_name}
                </Text>
              </View>
              <View className="h-9 w-9 items-center justify-center rounded-full bg-buttons-orange">
                <Text className="text-lead font-bold text-white">→</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : (
          <View className="mx-4 mb-5 gap-2 rounded-[18px] bg-neutral-gray p-[18px]">
            <Text className="text-lead font-semibold text-black-100">
              {strings.plansFeed.noNextPlan}
            </Text>
            <TouchableOpacity
              onPress={onScrollToFeed}
              activeOpacity={0.7}
              hitSlop={8}
            >
              <Text className="text-body font-bold text-buttons-orange">
                {strings.plansFeed.noNextPlanCta}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View className="mb-2 px-5">
        <Text className="tab-section-title">{strings.plansFeed.feedHeader}</Text>
      </View>

      <View className={`${searchOpen ? 'mb-3' : 'mb-4'} flex-row items-center gap-2 pl-5 pr-4`}>
        <ScrollView
          horizontal
          nestedScrollEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          contentContainerClassName="flex-row gap-2"
        >
          {FEED_PILLS.map(pill => {
            const selected = activeFilter === pill.value
            return (
              <Pressable
                key={pill.label}
                style={[styles.chip, selected && styles.chipActive]}
                onPress={() => {
                  if (pill.value === null) {
                    onFilterChange(null)
                    return
                  }
                  onFilterChange(activeFilter === pill.value ? null : pill.value)
                }}
              >
                <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                  {pill.label}
                </Text>
              </Pressable>
            )
          })}
        </ScrollView>
        <TouchableOpacity
          className="tab-icon-btn"
          hitSlop={8}
          activeOpacity={0.7}
          onPress={onToggleSearch}
        >
          <Ionicons
            name={searchOpen ? 'close-outline' : 'search-outline'}
            size={22}
            color={Colors.black[300]}
          />
        </TouchableOpacity>
      </View>

      {locationHint ? (
        <Text className="mb-3 px-5 text-body font-semibold text-neutral-hint">
          {locationHint}
        </Text>
      ) : null}

      {searchOpen ? (
        <View className="mb-4 px-5">
          <TextInput
            autoFocus
            value={searchText}
            onChangeText={onSearchTextChange}
            placeholder="Buscar planes"
            placeholderTextColor={Colors.neutral.label}
            returnKeyType="search"
            autoCorrect={false}
            style={styles.searchInput}
          />
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  chipText: {
    fontSize: FontSize.body,
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
  searchInput: {
    backgroundColor: Colors.neutral.gray,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: FontSize.lead,
    fontWeight: '600',
    color: Colors.black[100],
  },
})

import { Colors } from '@/assets/constants/Colors'
import { TabIndexHeader } from '@/components/tabs/TabIndexHeader'
import { strings } from '@/constants/strings'
import { Plan } from '@/types'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

const FILTERS = [
  strings.planes.filterAll,
  strings.planes.filterToday,
  strings.planes.filterNearby,
  strings.planes.filterFree,
]

const ACTIVITY_EMOJI: Record<string, string> = {
  playa: '🏖️', social: '🥥', rumba: '🎵', salsa: '🎵',
  deporte: '⚽', comida: '🍽️',
}

function getPlanEmoji(type: string): string {
  return ACTIVITY_EMOJI[type.toLowerCase()] ?? '✨'
}

type PlansHeaderProps = {
  nextPlan: Plan | null
  activeFilter: string
  onFilterChange: (filter: string) => void
}

export function PlansHeader({
  nextPlan,
  activeFilter,
  onFilterChange,
}: PlansHeaderProps) {
  return (
    <View>
      <View className="pt-3">
        <TabIndexHeader />
      </View>

      {nextPlan ? (
        <TouchableOpacity
          className="mx-4 mb-5 rounded-[18px] bg-black-100 p-4"
          activeOpacity={0.85}
        >
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-white/[0.12]">
              <Text className="text-[22px]">
                {getPlanEmoji(nextPlan.activity_type)}
              </Text>
            </View>
            <View className="flex-1 gap-0.5">
              <Text className="text-[10px] font-bold tracking-[1px] text-buttons-orange">
                {strings.planes.nextPlanLabel}
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
            {strings.planes.noNextPlan}
          </Text>
          <TouchableOpacity>
            <Text className="text-sm font-bold text-buttons-orange">
              {strings.planes.noNextPlanCta}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View className="mb-2 px-5">
        <Text className="tab-section-title">{strings.planes.feedHeader}</Text>
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
    color: '#ffffff',
  },
})

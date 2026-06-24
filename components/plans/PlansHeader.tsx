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
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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
  const insets = useSafeAreaInsets()

  return (
    <View>
      <View style={{ paddingTop: insets.top + 12 }}>
        <TabIndexHeader />
      </View>

      {nextPlan ? (
        <TouchableOpacity
          className="mx-4 mb-5"
          style={styles.nextPlanCard}
          activeOpacity={0.85}
        >
          <View className="flex-row items-center gap-3">
            <View style={styles.nextPlanEmoji}>
              <Text className="text-[22px]">
                {getPlanEmoji(nextPlan.activity_type)}
              </Text>
            </View>
            <View className="flex-1 gap-0.5">
              <Text style={styles.nextPlanLabel}>{strings.planes.nextPlanLabel}</Text>
              <Text style={styles.nextPlanTitle}>{nextPlan.title}</Text>
              <Text style={styles.nextPlanSub}>
                {nextPlan.date_time} · {nextPlan.location_name}
              </Text>
            </View>
            <View style={styles.nextPlanArrow}>
              <Text style={styles.nextPlanArrowText}>→</Text>
            </View>
          </View>
        </TouchableOpacity>
      ) : (
        <View className="mx-4 mb-5 gap-2 rounded-[18px] p-[18px]" style={{
          backgroundColor: Colors.neutral.gray,
        }}>
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

      <View className="px-5 mb-2">
        <Text className="tab-section-title">{strings.planes.feedHeader}</Text>
      </View>

      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        className="mb-4"
        contentContainerClassName="px-5 gap-2 flex-row"
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
  nextPlanCard: {
    backgroundColor: Colors.black[100],
    borderRadius: 18,
    padding: 16,
  },
  nextPlanEmoji: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextPlanLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.buttons.orange,
    letterSpacing: 1,
  },
  nextPlanTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
  },
  nextPlanSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
  },
  nextPlanArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.buttons.orange,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextPlanArrowText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '700',
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
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.black[400],
  },
  chipTextActive: {
    color: '#ffffff',
  },
})

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

type FeedListHeaderProps = {
  nextPlan: Plan | null
  activeFilter: string
  onFilterChange: (filter: string) => void
  planCount: number
}

export function FeedListHeader({
  nextPlan,
  activeFilter,
  onFilterChange,
  planCount,
}: FeedListHeaderProps) {
  const insets = useSafeAreaInsets()

  return (
    <View>
      <View style={{ paddingTop: insets.top + 12 }}>
        <TabIndexHeader />
      </View>

      {nextPlan ? (
        <TouchableOpacity style={styles.nextPlanCard} activeOpacity={0.85}>
          <View style={styles.nextPlanRow}>
            <View style={styles.nextPlanEmoji}>
              <Text style={styles.nextPlanEmojiText}>
                {getPlanEmoji(nextPlan.activity_type)}
              </Text>
            </View>
            <View style={styles.nextPlanCenter}>
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
        <View style={styles.noNextPlanCard}>
          <Text style={styles.noNextPlanText}>{strings.planes.noNextPlan}</Text>
          <TouchableOpacity>
            <Text style={styles.noNextPlanCta}>{strings.planes.noNextPlanCta}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.feedHeader}>
        <Text style={styles.feedHeaderTitle}>{strings.planes.feedHeader}</Text>
        <Text style={styles.feedHeaderCount}>{strings.planes.planCount(planCount)}</Text>
      </View>

      <ScrollView
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={styles.filterScroll}
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
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#2A2520',
    borderRadius: 18,
    padding: 16,
  },
  nextPlanRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nextPlanEmoji: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextPlanEmojiText: {
    fontSize: 22,
  },
  nextPlanCenter: {
    flex: 1,
    gap: 2,
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
  noNextPlanCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: '#EDEBE5',
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
  noNextPlanText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.black[100],
  },
  noNextPlanCta: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.buttons.orange,
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  feedHeaderTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.black[100],
  },
  feedHeaderCount: {
    fontSize: 13,
    color: Colors.black[400],
  },
  filterScroll: {
    marginBottom: 16,
  },
  filterRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    backgroundColor: '#EDEBE5',
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

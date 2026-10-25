import { Colors } from '@/assets/constants/Colors'
import { getActivityMeta } from '@/constants/activityMeta'
import { strings } from '@/constants/strings'
import { getLikesVersion, getStoredLike, subscribeLikes } from '@/lib/plans/likeStore'
import { Plan } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import React, { useSyncExternalStore } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

type LikedPlansSectionProps = {
  plans: Plan[]
  onPlanPress: (plan: Plan) => void
}

function LikedPlanRow({ plan, onPress }: { plan: Plan; onPress: () => void }) {
  const meta = getActivityMeta(plan.activity_type.split('|')[0].trim())

  return (
    <TouchableOpacity
      className="flex-row items-center gap-3 px-4 py-3"
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
    >
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: meta.surface }}
      >
        <Text className="text-title">{meta.emoji}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-body font-bold text-ink" numberOfLines={1}>
          {plan.title}
        </Text>
        <Text className="text-caption text-black-400" numberOfLines={1}>
          {plan.date_time} · {plan.location_name}
        </Text>
      </View>
      <Ionicons name="heart" size={16} color={Colors.buttons.orange} />
    </TouchableOpacity>
  )
}

export function LikedPlansSection({ plans, onPlanPress }: LikedPlansSectionProps) {
  // Re-render on any like change so plans unliked elsewhere drop out immediately.
  useSyncExternalStore(subscribeLikes, getLikesVersion)
  const visible = plans.filter(plan => (getStoredLike(plan.id) ?? plan.user_liked) === true)

  if (visible.length === 0) return null

  return (
    <View className="mt-6">
      <Text className="mb-3 text-lead font-bold text-ink">
        {strings.profile.likedPlansTitle}
      </Text>
      <View className="overflow-hidden rounded-2xl bg-white">
        {visible.map((plan, index) => (
          <View key={plan.id}>
            {index > 0 ? <View className="mx-4 h-px bg-neutral-divider" /> : null}
            <LikedPlanRow plan={plan} onPress={() => onPlanPress(plan)} />
          </View>
        ))}
      </View>
    </View>
  )
}

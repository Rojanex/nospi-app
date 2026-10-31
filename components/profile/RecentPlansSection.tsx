import { getActivityMeta } from '@/constants/activityMeta'
import { strings } from '@/constants/strings'
import type { ProfileRecentPlan } from '@/lib/profiles/api'
import React, { useState } from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const COLS = 3
const GAP = 10

type RecentPlansSectionProps = {
  plans: ProfileRecentPlan[]
  onSeeAll: () => void
  onPlanPress: (planId: string) => void
  onEmptyCtaPress: () => void
}

function formatTileDate(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()

  if (sameDay) return strings.dates.today
  return `${date.getDate()} ${strings.dates.months[date.getMonth()]}`
}

function PlanTile({
  plan,
  onPress,
  width,
}: {
  plan: ProfileRecentPlan
  onPress: () => void
  width?: number
}) {
  const meta = getActivityMeta(plan.activity_type)

  return (
    <TouchableOpacity
      className="overflow-hidden rounded-2xl"
      style={{ width, backgroundColor: meta.surface }}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View className="items-center px-2 pb-2.5 pt-3">
        <View
          className="mb-2 h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: meta.surfaceStrong }}
        >
          <Text className="text-title">{meta.emoji}</Text>
        </View>
        <Text
          className="mb-0.5 text-center text-caption font-bold leading-[17px]"
          style={{ color: meta.accent }}
          numberOfLines={2}
        >
          {plan.title}
        </Text>
        <Text className="text-center text-label font-medium text-black-400">
          {formatTileDate(plan.date_time)}
        </Text>
      </View>
    </TouchableOpacity>
  )
}

export function RecentPlansSection({
  plans,
  onSeeAll,
  onPlanPress,
  onEmptyCtaPress,
}: RecentPlansSectionProps) {
  const tiles = plans.slice(0, 6)
  const showEmpty = tiles.length === 0
  const [rowWidth, setRowWidth] = useState(0)
  const tileWidth =
    rowWidth > 0 ? (rowWidth - GAP * (COLS - 1)) / COLS : undefined

  return (
    <View>
      <View className="mb-3 flex-row items-end justify-between">
        <Text className="text-lead font-bold text-ink">
          {strings.profile.recentPlansTitle}
        </Text>
        <TouchableOpacity onPress={onSeeAll} hitSlop={8}>
          <Text className="pb-0.5 text-body font-semibold text-buttons-orange">
            {strings.profile.seeAll}
          </Text>
        </TouchableOpacity>
      </View>

      {tiles.length > 0 ? (
        <View
          className="flex-row flex-wrap"
          style={{ justifyContent: 'center', gap: GAP }}
          onLayout={e => setRowWidth(e.nativeEvent.layout.width)}
        >
          {tiles.map(plan => (
            <PlanTile
              key={plan.id}
              plan={plan}
              width={tileWidth}
              onPress={() => onPlanPress(plan.id)}
            />
          ))}
        </View>
      ) : null}

      {showEmpty ? (
        <View className="mt-2 items-center rounded-2xl bg-white px-5 py-6">
          <Text className="mb-3 text-center text-body text-black-400">
            {strings.profile.emptyPlans}
          </Text>
          <TouchableOpacity onPress={onEmptyCtaPress} hitSlop={8} activeOpacity={0.7}>
            <Text
              className="text-body font-semibold text-primary-100"
              style={{ textDecorationLine: 'underline' }}
            >
              {strings.profile.emptyPlansCta}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  )
}

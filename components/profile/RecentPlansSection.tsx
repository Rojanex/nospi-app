import { getActivityMeta } from '@/constants/activityMeta'
import { strings } from '@/constants/strings'
import type { PlanActivityType } from '@/types'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

export type ProfileRecentPlan = {
  id: string
  title: string
  activity_type: PlanActivityType
  date_time: string
}

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
}: {
  plan: ProfileRecentPlan
  onPress: () => void
}) {
  const meta = getActivityMeta(plan.activity_type)

  return (
    <TouchableOpacity
      className="mb-2.5 overflow-hidden rounded-2xl"
      style={{ width: '31.5%', backgroundColor: meta.bg }}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View className="items-center px-2 pb-2.5 pt-3">
        <View
          className="mb-2 h-10 w-10 items-center justify-center rounded-full"
          style={{ backgroundColor: meta.circle }}
        >
          <Text className="text-lg">{meta.emoji}</Text>
        </View>
        <Text
          className="mb-0.5 text-center text-[12px] font-bold leading-4"
          style={{ color: meta.accent }}
          numberOfLines={2}
        >
          {plan.title}
        </Text>
        <Text className="text-center text-[10px] font-medium text-black-400">
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
  const showEmpty = tiles.length < 3

  return (
    <View>
      <View className="mb-3 flex-row items-end justify-between">
        <Text className="text-base font-bold text-ink">
          {strings.profile.recentPlansTitle}
        </Text>
        <TouchableOpacity onPress={onSeeAll} hitSlop={8}>
          <Text className="pb-0.5 text-sm font-semibold text-buttons-orange">
            {strings.profile.seeAll}
          </Text>
        </TouchableOpacity>
      </View>

      {tiles.length > 0 ? (
        <View className="flex-row flex-wrap justify-between">
          {tiles.map(plan => (
            <PlanTile
              key={plan.id}
              plan={plan}
              onPress={() => onPlanPress(plan.id)}
            />
          ))}
        </View>
      ) : null}

      {showEmpty ? (
        <View className="mt-2 items-center rounded-2xl bg-white px-5 py-6">
          <Text className="mb-3 text-center text-sm text-black-400">
            {strings.profile.emptyPlans}
          </Text>
          <TouchableOpacity
            className="btn-primary px-8"
            style={{ height: 44, borderRadius: 22 }}
            onPress={onEmptyCtaPress}
            activeOpacity={0.85}
          >
            <Text className="btn-primary-text text-[13px]">
              {strings.profile.emptyPlansCta}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  )
}

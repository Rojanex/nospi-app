import { Colors } from '@/assets/constants/Colors'
import { getActivityMeta } from '@/constants/activityMeta'
import { strings } from '@/constants/strings'
import { Plan } from '@/types'
import { Image } from 'expo-image'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

const AVATAR_PASTEL_COLORS = ['#FFD6D6', '#D6F5D6', '#D6E8FF', '#FFF3D6', '#F5D6FF', '#D6F5F5']

function getAvatarPastelColor(initial: string): string {
  return AVATAR_PASTEL_COLORS[initial.charCodeAt(0) % AVATAR_PASTEL_COLORS.length]
}

interface Props {
  plan: Plan
  onJoin: (id: string) => void
}

export function PlanCard({ plan, onJoin }: Props) {
  const primaryType = plan.activity_type.split('|')[0].trim().toLowerCase()
  const meta = getActivityMeta(primaryType)
  const tags = plan.activity_type.split('|').map(t => t.trim().toUpperCase()).join(' · ')

  const statusLine = plan.spots_left <= 2
    ? strings.plansFeed.soloSpots(plan.spots_left)
    : strings.plansFeed.spotsInfo(plan.extra_attendees, plan.spots_left)

  const statusColor = plan.spots_left <= 2 ? Colors.activity.orange : Colors.black[400]

  const joinBg = plan.user_joined
    ? Colors.black[100]
    : plan.spots_left === 0
      ? Colors.neutral.gray
      : Colors.buttons.orange

  const joinLabel = plan.user_joined
    ? strings.plansFeed.joinedCta
    : plan.spots_left === 0
      ? strings.plansFeed.fullCta
      : strings.plansFeed.joinCta

  const overflowCount = plan.extra_attendees - plan.attendees.length
  const hostDotColor =
    plan.host_type === 'local' ? Colors.buttons.orange : Colors.primary[100]

  return (
    <View className="mx-4 mb-3 flex-row overflow-hidden rounded-[18px] bg-white">
      <View className="w-[3px]" style={{ backgroundColor: meta.accent }} />

      <View className="flex-1">
        <View className="p-3.5">
          <View className="flex-row items-start gap-2.5">
            <View
              className="h-11 w-11 items-center justify-center rounded-xl"
              style={{ backgroundColor: meta.bg }}
            >
              <Text className="text-[22px]">{meta.emoji}</Text>
            </View>
            <View className="flex-1 gap-0.5">
              <Text
                className="text-[10px] font-bold tracking-wide"
                style={{ color: meta.accent }}
              >
                {tags}
              </Text>
              <Text className="text-base font-bold text-black-100">{plan.title}</Text>
              <Text className="text-xs text-black-400">📍 {plan.location_name}</Text>
            </View>
          </View>
        </View>

        <View className="mx-3.5 border-b border-dashed border-neutral-tinted" />

        <View className="p-3.5">
          <View className="flex-row items-start justify-between">
            <View>
              <Text className="text-[15px] font-bold text-black-100">{plan.date_time}</Text>
              <Text className="mt-0.5 text-xs" style={{ color: statusColor }}>
                {statusLine}
              </Text>
            </View>

            <View className="items-end gap-1.5">
              <View className="flex-row items-center">
                {plan.attendees.map((attendee, i) =>
                  attendee.avatar_url ? (
                    <Image
                      key={attendee.user_id}
                      source={{ uri: attendee.avatar_url }}
                      className={`h-[26px] w-[26px] items-center justify-center rounded-full border-[1.5px] border-white ${i > 0 ? '-ml-[7px]' : ''}`}
                      cachePolicy="memory-disk"
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      key={attendee.user_id}
                      className={`h-[26px] w-[26px] items-center justify-center rounded-full border-[1.5px] border-white ${i > 0 ? '-ml-[7px]' : ''}`}
                      style={{ backgroundColor: getAvatarPastelColor(attendee.user_id) }}
                    >
                      <Text className="text-[9px] font-bold text-black-500">
                        {attendee.initials}
                      </Text>
                    </View>
                  )
                )}
                {overflowCount > 0 && (
                  <View className="-ml-[7px] h-[26px] w-[26px] items-center justify-center rounded-full border-[1.5px] border-white bg-neutral-tinted">
                    <Text className="text-[9px] font-bold text-black-500">
                      +{overflowCount}
                    </Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                className="rounded-full px-[18px] py-2.5"
                style={{ backgroundColor: joinBg }}
                onPress={() => onJoin(plan.id)}
                disabled={plan.spots_left === 0}
              >
                <Text className="text-[13px] font-bold text-white">{joinLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="flex-row items-center gap-1.5 bg-neutral-softTint px-3.5 py-3">
          {plan.host_avatar_url ? (
            <Image
              source={{ uri: plan.host_avatar_url }}
              className="h-[22px] w-[22px] items-center justify-center rounded-full"
              cachePolicy="memory-disk"
              contentFit="cover"
            />
          ) : (
            <View
              className="h-[22px] w-[22px] items-center justify-center rounded-full"
              style={{ backgroundColor: getAvatarPastelColor(plan.host_initials) }}
            >
              <Text className="text-[9px] font-bold text-black-500">
                {plan.host_initials}
              </Text>
            </View>
          )}
          <View
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: hostDotColor }}
          />
          <Text className="flex-1 text-xs text-black-400">
            {strings.plansFeed.hostPrefix} {plan.host_name} ·{' '}
            {plan.host_type === 'local'
              ? strings.plansFeed.hostLocal
              : strings.plansFeed.hostVisitor}
          </Text>
          <Text className="text-xs text-neutral-hint">{plan.posted_ago}</Text>
        </View>
      </View>
    </View>
  )
}

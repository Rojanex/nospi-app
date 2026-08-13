import { Colors } from '@/assets/constants/Colors'
import { PlanDetailModal } from '@/components/plans/PlanDetailModal'
import { getActivityMeta } from '@/constants/activityMeta'
import { strings } from '@/constants/strings'
import { avatarColorsForId } from '@/lib/utils/avatar'
import { Plan } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Image } from 'expo-image'
import React, { useState } from 'react'
import { Pressable, Text, TouchableOpacity, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'

interface Props {
  plan: Plan
  onJoin: (id: string) => void
  onOpenChat: (id: string) => void
}

export function PlanCard({ plan, onJoin, onOpenChat }: Props) {
  const [detailOpen, setDetailOpen] = useState(false)
  const pressScale = useSharedValue(1)
  const pressY = useSharedValue(0)

  const primaryType = plan.activity_type.split('|')[0].trim().toLowerCase()
  const meta = getActivityMeta(primaryType)
  const tags = plan.activity_type.split('|').map(t => t.trim().toUpperCase()).join(' · ')

  const statusLine =
    plan.spots_left <= 0
      ? strings.plansFeed.spotsFull
      : plan.spots_left <= 2
        ? strings.plansFeed.soloSpots(plan.spots_left)
        : strings.plansFeed.spotsInfo(plan.extra_attendees, plan.spots_left)

  const statusColor = plan.spots_left <= 2 ? Colors.activity.orange : Colors.black[400]

  const joined = plan.user_joined
  const joinBg = joined ? Colors.black[100] : Colors.buttons.orange
  const joinLabel = joined ? strings.plansFeed.joinedCta : strings.plansFeed.joinCta

  const avatarPeople =
    plan.attendees.length > 0
      ? plan.attendees
      : [
          {
            user_id: plan.host_id,
            initials: plan.host_initials,
            avatar_url: plan.host_avatar_url,
          },
        ]
  const overflowCount = Math.max(0, plan.extra_attendees - avatarPeople.length)
  const hostDotColor =
    plan.host_type === 'local' ? Colors.buttons.orange : Colors.primary[100]

  const cardPressStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressY.value }, { scale: pressScale.value }],
  }))

  function openDetailFromLongPress() {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    pressScale.value = withSequence(
      withTiming(0.97, { duration: 90 }),
      withSpring(1, { damping: 18, stiffness: 260 }),
    )
    pressY.value = withSequence(
      withTiming(5, { duration: 90 }),
      withSpring(0, { damping: 18, stiffness: 260 }),
    )
    setDetailOpen(true)
  }

  return (
    <View>
      <Animated.View className="mx-4 mb-3" style={cardPressStyle}>
      <Pressable
        className="flex-row overflow-hidden rounded-[18px] bg-white"
        delayLongPress={350}
        onLongPress={openDetailFromLongPress}
        android_ripple={{ color: 'transparent' }}
      >
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
                <View className="flex-row items-center">
                  <Text
                    className="flex-1 text-[10px] font-bold tracking-wide"
                    style={{ color: meta.accent }}
                  >
                    {tags}
                  </Text>
                  <Pressable
                    hitSlop={10}
                    onPress={() => setDetailOpen(true)}
                    accessibilityRole="button"
                    accessibilityLabel={strings.plansFeed.planDetailMore}
                    android_ripple={{ color: 'transparent' }}
                  >
                    <Ionicons name="ellipsis-horizontal" size={16} color={Colors.neutral.hint} />
                  </Pressable>
                </View>
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

              <TouchableOpacity
                className="rounded-full px-[18px] py-2.5"
                style={{ backgroundColor: joinBg }}
                onPress={() => (joined ? onOpenChat(plan.id) : onJoin(plan.id))}
              >
                <Text className="text-[13px] font-bold text-white">{joinLabel}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="flex-row items-center gap-1.5 bg-neutral-softTint px-3.5 py-3">
            <View className="flex-row items-center">
              {avatarPeople.map((attendee, i) => {
                const colors = avatarColorsForId(attendee.user_id)
                return attendee.avatar_url ? (
                  <Image
                    key={attendee.user_id}
                    source={{ uri: attendee.avatar_url }}
                    className={`h-[22px] w-[22px] items-center justify-center rounded-full ${i > 0 ? '-ml-[10px]' : ''}`}
                    cachePolicy="memory-disk"
                    contentFit="cover"
                  />
                ) : (
                  <View
                    key={attendee.user_id}
                    className={`h-[22px] w-[22px] items-center justify-center rounded-full ${i > 0 ? '-ml-[10px]' : ''}`}
                    style={{ backgroundColor: colors.bg }}
                  >
                    <Text className="text-[9px] font-bold" style={{ color: colors.text }}>
                      {attendee.initials}
                    </Text>
                  </View>
                )
              })}
              {overflowCount > 0 && (
                <View className="-ml-[10px] h-[22px] w-[22px] items-center justify-center rounded-full bg-neutral-tinted">
                  <Text className="text-[9px] font-bold text-black-500">
                    +{overflowCount}
                  </Text>
                </View>
              )}
            </View>
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
      </Pressable>
      </Animated.View>
      <PlanDetailModal
        visible={detailOpen}
        plan={plan}
        onClose={() => setDetailOpen(false)}
        onJoin={onJoin}
        onOpenChat={onOpenChat}
      />
    </View>
  )
}

import { Colors } from '@/assets/constants/Colors'
import { getActivityMeta } from '@/constants/activityMeta'
import { strings } from '@/constants/strings'
import { avatarColorsForId } from '@/lib/utils/avatar'
import { Plan } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import React, { useEffect, useRef, useState } from 'react'
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

const ENTER_MS = 200
const EXIT_MS = 160
const BACKDROP = 'rgba(28, 27, 25, 0.45)'

type PlanDetailModalProps = {
  visible: boolean
  plan: Plan
  onClose: () => void
  onJoin: (id: string) => void
  onOpenChat: (id: string) => void
}

export function PlanDetailModal({
  visible,
  plan,
  onClose,
  onJoin,
  onOpenChat,
}: PlanDetailModalProps) {
  const primaryType = plan.activity_type.split('|')[0].trim().toLowerCase()
  const meta = getActivityMeta(primaryType)
  const tags = plan.activity_type
    .split('|')
    .map(t => t.trim().toUpperCase())
    .join(' · ')

  const statusLine =
    plan.spots_left <= 0
      ? strings.plansFeed.spotsFull
      : plan.spots_left <= 2
        ? strings.plansFeed.soloSpots(plan.spots_left)
        : strings.plansFeed.spotsLeft(plan.spots_left)
  const statusColor = plan.spots_left <= 2 ? Colors.activity.orange : Colors.black[400]

  const description = plan.description?.trim()
  const isLocalsOnly = plan.visibility === 'locals'
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

  const [joined, setJoined] = useState(plan.user_joined)
  const closingRef = useRef(false)

  const backdropOpacity = useSharedValue(0)
  const cardOpacity = useSharedValue(0)
  const cardScale = useSharedValue(0.94)

  const joinBg = joined ? Colors.black[100] : Colors.buttons.orange
  const joinLabel = joined ? strings.plansFeed.joinedCta : strings.plansFeed.joinCta

  useEffect(() => {
    setJoined(plan.user_joined)
  }, [plan.user_joined])

  useEffect(() => {
    if (!visible) return
    closingRef.current = false
    backdropOpacity.value = 0
    cardOpacity.value = 0
    cardScale.value = 0.94
    backdropOpacity.value = withTiming(1, { duration: ENTER_MS })
    cardOpacity.value = withTiming(1, { duration: ENTER_MS })
    cardScale.value = withTiming(1, {
      duration: ENTER_MS,
      easing: Easing.out(Easing.cubic),
    })
  }, [visible, backdropOpacity, cardOpacity, cardScale])

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }))

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }))

  function dismiss() {
    if (closingRef.current) return
    closingRef.current = true
    backdropOpacity.value = withTiming(0, { duration: EXIT_MS })
    cardOpacity.value = withTiming(0, { duration: EXIT_MS })
    cardScale.value = withTiming(
      0.94,
      { duration: EXIT_MS, easing: Easing.in(Easing.cubic) },
      finished => {
        if (finished) scheduleOnRN(onClose)
      },
    )
  }

  function handleJoinPress() {
    if (joined) {
      onOpenChat(plan.id)
      dismiss()
      return
    }
    setJoined(true)
    onJoin(plan.id)
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, { backgroundColor: BACKDROP }, backdropStyle]}
        />
        <Pressable style={StyleSheet.absoluteFillObject} onPress={dismiss} />

        <Animated.View
          className="max-h-[80%] w-full overflow-hidden rounded-[22px] bg-white"
          style={[styles.card, cardStyle]}
        >
          <Pressable
            onPress={dismiss}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={strings.plansFeed.planDetailClose}
            className="absolute right-3.5 top-3.5 z-10 h-8 w-8 items-center justify-center rounded-full"
          >
            <Ionicons name="close" size={20} color={Colors.black[400]} />
          </Pressable>

          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-5 pb-5 pt-5"
          >
            <View className="mb-4 flex-row items-start gap-2.5 pr-8">
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
              </View>
            </View>

            <View className="mb-3 flex-row items-center gap-1.5">
              <Ionicons name="location-sharp" size={14} color={Colors.black[300]} />
              <Text className="flex-1 text-xs text-black-400">{plan.location_name}</Text>
            </View>

            <Text className="text-[15px] font-bold text-black-100">{plan.date_time}</Text>
            <Text className="mt-0.5 text-xs" style={{ color: statusColor }}>
              {statusLine}
            </Text>

            <View
              className="mt-4 self-start rounded-full px-2.5 py-1"
              style={{
                backgroundColor: isLocalsOnly
                  ? Colors.surface.orangeLight
                  : Colors.surface.greenLight,
              }}
            >
              <Text
                className="text-[11px] font-bold"
                style={{
                  color: isLocalsOnly ? Colors.activity.amber : Colors.activity.green,
                }}
              >
                {isLocalsOnly
                  ? strings.plansFeed.visibilityLocalBadge
                  : strings.plansFeed.visibilityOpenBadge}
              </Text>
            </View>

            <Text
              className={`mt-4 text-[13px] leading-5 ${description ? 'text-black-100' : 'text-black-400'}`}
            >
              {description || strings.plansFeed.descriptionEmpty}
            </Text>

            <View className="mt-4 flex-row items-center justify-between gap-3">
              <Text className="flex-1 text-xs text-black-400" numberOfLines={1}>
                {strings.plansFeed.hostPrefix} {plan.host_name} ·{' '}
                {plan.host_type === 'local'
                  ? strings.plansFeed.hostLocal
                  : strings.plansFeed.hostVisitor}
              </Text>

              <View className="flex-row items-center">
                {avatarPeople.map((attendee, i) => {
                  const colors = avatarColorsForId(attendee.user_id)
                  return attendee.avatar_url ? (
                    <Image
                      key={attendee.user_id}
                      source={{ uri: attendee.avatar_url }}
                      className={`h-[26px] w-[26px] rounded-full ${i > 0 ? '-ml-[10px]' : ''}`}
                      cachePolicy="memory-disk"
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      key={attendee.user_id}
                      className={`h-[26px] w-[26px] items-center justify-center rounded-full ${i > 0 ? '-ml-[10px]' : ''}`}
                      style={{ backgroundColor: colors.bg }}
                    >
                      <Text className="text-[9px] font-bold" style={{ color: colors.text }}>
                        {attendee.initials}
                      </Text>
                    </View>
                  )
                })}
                {overflowCount > 0 && (
                  <View className="-ml-[10px] h-[26px] w-[26px] items-center justify-center rounded-full bg-neutral-tinted">
                    <Text className="text-[9px] font-bold text-black-500">
                      +{overflowCount}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <Pressable
              className="mt-5 items-center rounded-full py-3"
              style={{ backgroundColor: joinBg }}
              onPress={handleJoinPress}
            >
              <Text className="text-[13px] font-bold text-white">{joinLabel}</Text>
            </Pressable>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  card: {
    elevation: 12,
    shadowColor: Colors.black.DEFAULT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
})

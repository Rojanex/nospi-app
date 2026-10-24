import { Colors } from '@/assets/constants/Colors'
import { PlanChatPanel } from '@/components/plans/PlanChatPreview'
import { PlanDetailModal } from '@/components/plans/PlanDetailModal'
import { getActivityMeta } from '@/constants/activityMeta'
import { strings } from '@/constants/strings'
import { VERIFICATION_ENABLED } from '@/lib/env_reader'
import { getPlanGradientTokens } from '@/lib/plans/gradientTokens'
import { usePlanCardMessagePreview } from '@/lib/plans/usePlanMessagePreview'
import { usePlanLike } from '@/lib/plans/usePlanLike'
import { avatarColorsForId } from '@/lib/utils/avatar'
import { Plan } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { Image } from 'expo-image'
import React, { useCallback, useMemo, useState } from 'react'
import { Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

interface Props {
  plan: Plan
  onJoin: (id: string) => void
  onPeekStart?: (plan: Plan) => void
  onPeekEnd?: () => void
}

export function PlanCard({ plan, onJoin, onPeekStart, onPeekEnd }: Props) {
  const [detailOpen, setDetailOpen] = useState(false)
  const pressScale = useSharedValue(1)
  const pressY = useSharedValue(0)

  const primaryType = plan.activity_type.split('|')[0].trim().toLowerCase()
  const meta = getActivityMeta(primaryType)
  const gradientTokens = getPlanGradientTokens(plan.activity_type)
  const tags = plan.activity_type.split('|').map(t => t.trim().toUpperCase()).join(' · ')

  const like = usePlanLike(plan)
  const chatPreview = usePlanCardMessagePreview(plan.id)

  const statusLine =
    plan.spots_left <= 0
      ? strings.plansFeed.spotsFull
      : plan.spots_left <= 2
        ? strings.plansFeed.soloSpots(plan.spots_left)
        : plan.extra_attendees > 0
          ? strings.plansFeed.spotsInfo(plan.extra_attendees, plan.spots_left)
          : strings.plansFeed.spotsLeft(plan.spots_left)

  const statusColor = plan.spots_left <= 2 ? Colors.activity.orange : Colors.black[400]

  const joined = plan.user_joined

  const avatarPeople =
    plan.attendees.length > 0
      ? plan.attendees.slice(0, 3)
      : [
          {
            user_id: plan.host_id,
            initials: plan.host_initials,
            avatar_url: plan.host_avatar_url,
            name: plan.host_name,
          },
        ]
  const overflowCount = Math.max(0, plan.extra_attendees - avatarPeople.length)
  const hostDotColor = !VERIFICATION_ENABLED
    ? Colors.neutral.hint
    : plan.host_type === 'local'
      ? Colors.buttons.orange
      : Colors.primary[100]

  const cardPressStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: pressY.value }, { scale: pressScale.value }],
  }))

  const playPeekMotion = useCallback(() => {
    pressScale.value = withSequence(
      withTiming(0.97, { duration: 90 }),
      withSpring(1, { damping: 18, stiffness: 260 }),
    )
    pressY.value = withSequence(
      withTiming(5, { duration: 90 }),
      withSpring(0, { damping: 18, stiffness: 260 }),
    )
  }, [pressScale, pressY])

  const openDetailSticky = useCallback(() => {
    setDetailOpen(true)
  }, [])

  const openDetailPeek = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    playPeekMotion()
    onPeekStart?.(plan)
  }, [onPeekStart, plan, playPeekMotion])

  const endPeek = useCallback(() => {
    onPeekEnd?.()
  }, [onPeekEnd])

  const handleJoinPress = useCallback(() => {
    if (joined) return
    onJoin(plan.id)
  }, [joined, onJoin, plan.id])

  const joinGesture = useMemo(
    () =>
      Gesture.Tap().onEnd(() => {
        scheduleOnRN(handleJoinPress)
      }),
    [handleJoinPress],
  )

  const { toggle: toggleLike } = like
  const likeUnknown = like.liked === null
  const handleLikePress = useCallback(() => {
    if (likeUnknown) return
    void Haptics.selectionAsync()
    toggleLike()
  }, [likeUnknown, toggleLike])

  const likeGesture = useMemo(
    () =>
      Gesture.Tap()
        .hitSlop(8)
        .onEnd(() => {
          scheduleOnRN(handleLikePress)
        }),
    [handleLikePress],
  )

  const gesture = useMemo(() => {
    const longPress = Gesture.LongPress()
      .minDuration(350)
      .maxDistance(9999)
      .shouldCancelWhenOutside(false)
      .requireExternalGestureToFail(joinGesture, likeGesture)
      .onStart(() => {
        scheduleOnRN(openDetailPeek)
      })
      .onFinalize((_e, success) => {
        if (success) scheduleOnRN(endPeek)
      })

    const tap = Gesture.Tap()
      .requireExternalGestureToFail(joinGesture, likeGesture)
      .onEnd(() => {
        scheduleOnRN(openDetailSticky)
      })

    return Gesture.Exclusive(longPress, tap)
  }, [endPeek, joinGesture, likeGesture, openDetailPeek, openDetailSticky])

  return (
    <View>
      <GestureDetector gesture={gesture}>
        <Animated.View
          className="mx-4 mb-3 flex-row overflow-hidden rounded-[18px] bg-white"
          style={cardPressStyle}
          collapsable={false}
          accessible
          accessibilityRole="button"
          accessibilityLabel={strings.plansFeed.planDetailMore}
          accessibilityActions={
            likeUnknown ? [] : [{ name: 'like', label: strings.plansFeed.likeA11y(like.count) }]
          }
          onAccessibilityAction={e => {
            if (e.nativeEvent.actionName === 'like') handleLikePress()
          }}
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
                  <Text
                    className="text-label font-bold tracking-wide"
                    style={{ color: meta.accent }}
                  >
                    {tags}
                  </Text>
                  <Text className="text-lead font-bold text-black-100">{plan.title}</Text>
                  <Text className="text-caption text-black-400">📍 {plan.location_name}</Text>
                </View>
              </View>
            </View>

            <View className="mx-3.5 border-b border-dashed border-neutral-tinted" />

            <View className="p-3.5">
              <View className="flex-row items-start justify-between">
                <View>
                  <Text className="text-lead font-bold text-black-100">{plan.date_time}</Text>
                  <Text className="mt-0.5 text-caption" style={{ color: statusColor }}>
                    {statusLine}
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <GestureDetector gesture={likeGesture}>
                    <View
                      className="flex-row items-center gap-1 rounded-full px-3 py-2.5"
                      style={{
                        backgroundColor: Colors.surface.orangeLight,
                        opacity: likeUnknown ? 0.5 : 1,
                      }}
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel={strings.plansFeed.likeA11y(like.count)}
                      accessibilityState={{ selected: like.liked === true, disabled: likeUnknown }}
                    >
                      <Ionicons
                        name={like.liked ? 'heart' : 'heart-outline'}
                        size={16}
                        color={Colors.buttons.orange}
                      />
                      {like.count > 0 ? (
                        <Text
                          className="text-body font-bold"
                          style={{ color: Colors.buttons.orange }}
                        >
                          {like.count}
                        </Text>
                      ) : null}
                    </View>
                  </GestureDetector>

                  <GestureDetector gesture={joinGesture}>
                    <View
                      accessibilityRole="button"
                      accessibilityLabel={strings.plansFeed.joinCta}
                      accessibilityState={{ disabled: joined }}
                      style={{
                        backgroundColor: joined ? Colors.white : Colors.buttons.orange,
                        borderColor: joined ? Colors.neutral.border : Colors.buttons.orange,
                        borderWidth: 1,
                        borderRadius: 9999,
                        paddingHorizontal: 18,
                        paddingVertical: 9,
                      }}
                    >
                      <Text
                        className="text-body font-bold"
                        style={{ color: joined ? Colors.neutral.hint : Colors.white }}
                      >
                        {strings.plansFeed.joinCta}
                      </Text>
                    </View>
                  </GestureDetector>
                </View>
              </View>
            </View>

            {chatPreview.failed ? null : (
              <View className="px-3.5 pb-3.5">
                <PlanChatPanel
                  tokens={gradientTokens}
                  hostId={plan.host_id}
                  messages={chatPreview.messages}
                  moreCount={chatPreview.moreCount}
                  showSeeAll
                  compact
                />
              </View>
            )}

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
                      <Text className="text-micro font-bold" style={{ color: colors.text }}>
                        {attendee.initials}
                      </Text>
                    </View>
                  )
                })}
                {overflowCount > 0 && (
                  <View className="-ml-[10px] h-[22px] w-[22px] items-center justify-center rounded-full bg-neutral-tinted">
                    <Text className="text-micro font-bold text-black-500">
                      +{overflowCount}
                    </Text>
                  </View>
                )}
              </View>
              <View
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: hostDotColor }}
              />
              <Text className="flex-1 text-caption text-black-400">
                {strings.plansFeed.hostPrefix} {plan.host_name}
                {VERIFICATION_ENABLED
                  ? ` · ${plan.host_type === 'local' ? strings.plansFeed.hostLocal : strings.plansFeed.hostVisitor}`
                  : null}
              </Text>
              <Text className="text-caption text-neutral-hint">{plan.posted_ago}</Text>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
      <PlanDetailModal
        visible={detailOpen}
        plan={plan}
        onClose={() => setDetailOpen(false)}
        onJoin={onJoin}
      />
    </View>
  )
}

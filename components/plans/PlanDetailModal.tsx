import { Colors } from '@/assets/constants/Colors'
import { PlanChatPanel } from '@/components/plans/PlanChatPreview'
import { getActivityMeta } from '@/constants/activityMeta'
import { strings } from '@/constants/strings'
import { VERIFICATION_ENABLED } from '@/lib/env_reader'
import { getPlanGradientTokens } from '@/lib/plans/gradientTokens'
import { usePlanModalMessagePreview } from '@/lib/plans/usePlanMessagePreview'
import { avatarColorsForId } from '@/lib/utils/avatar'
import { Plan } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
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
const BACKDROP = Colors.overlay.backdrop

export type PlanDetailModalHandle = {
  dismiss: () => void
}

type PlanDetailModalProps = {
  visible: boolean
  plan: Plan
  onClose: () => void
  onJoin: (id: string) => void
  /** `modal` = RN Modal (sticky). `hosted` = absolute overlay in parent (peek). */
  presentation?: 'modal' | 'hosted'
  /** When false, overlay ignores touches so the card can keep tracking the finger. */
  interactive?: boolean
}

export const PlanDetailModal = forwardRef<PlanDetailModalHandle, PlanDetailModalProps>(
  function PlanDetailModal(
    {
      visible,
      plan,
      onClose,
      onJoin,
      presentation = 'modal',
      interactive = true,
    },
    ref,
  ) {
    const primaryType = plan.activity_type.split('|')[0].trim().toLowerCase()
    const meta = getActivityMeta(primaryType)
    const gradientTokens = getPlanGradientTokens(plan.activity_type)
    const chatPreview = usePlanModalMessagePreview(plan.id, visible)
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
    const statusColor = plan.spots_left <= 2 ? Colors.tone.orange : Colors.black[400]

    const description = plan.description?.trim()
    const isLocalsOnly = plan.visibility === 'locals'
    const people =
      plan.attendees.length > 0
        ? plan.attendees
        : [
            {
              user_id: plan.host_id,
              initials: plan.host_initials,
              avatar_url: plan.host_avatar_url,
              name: plan.host_name,
            },
          ]

    const [joined, setJoined] = useState(plan.user_joined)
    const closingRef = useRef(false)

    const backdropOpacity = useSharedValue(0)
    const cardOpacity = useSharedValue(0)
    const cardScale = useSharedValue(0.94)

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

    useImperativeHandle(ref, () => ({ dismiss }))

    function handleJoinPress() {
      if (joined) return
      setJoined(true)
      onJoin(plan.id)
      dismiss()
    }

    const body = (
      <View
        className="flex-1 items-center justify-center px-6"
        pointerEvents={interactive ? 'box-none' : 'none'}
      >
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFillObject, { backgroundColor: BACKDROP }, backdropStyle]}
        />
        {interactive ? (
          <Pressable style={StyleSheet.absoluteFillObject} onPress={dismiss} />
        ) : (
          <View style={StyleSheet.absoluteFillObject} pointerEvents="none" />
        )}

        <Animated.View
          className="max-h-[80%] w-full overflow-hidden rounded-[22px] bg-white"
          style={[styles.card, cardStyle]}
          pointerEvents={interactive ? 'auto' : 'none'}
        >
          {interactive ? (
            <Pressable
              onPress={dismiss}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={strings.plansFeed.planDetailClose}
              className="absolute right-3.5 top-3.5 z-10 h-8 w-8 items-center justify-center rounded-full"
            >
              <Ionicons name="close" size={20} color={Colors.black[400]} />
            </Pressable>
          ) : null}

          <ScrollView
            bounces={false}
            scrollEnabled={interactive}
            showsVerticalScrollIndicator={false}
            contentContainerClassName="px-5 pb-5 pt-5"
          >
            <View className={`mb-4 flex-row items-start gap-2.5 ${interactive ? 'pr-8' : ''}`}>
              <View
                className="h-11 w-11 items-center justify-center rounded-xl"
                style={{ backgroundColor: meta.surface }}
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
              </View>
            </View>

            <View className="mb-3 flex-row items-center gap-1.5">
              <Ionicons name="location-sharp" size={14} color={Colors.black[300]} />
              <Text className="flex-1 text-caption text-black-400">{plan.location_name}</Text>
            </View>

            <Text className="text-lead font-bold text-black-100">{plan.date_time}</Text>
            <Text className="mt-0.5 text-caption" style={{ color: statusColor }}>
              {statusLine}
            </Text>

            {VERIFICATION_ENABLED ? (
              <View
                className="mt-4 self-start rounded-full px-2.5 py-1"
                style={{
                  backgroundColor: isLocalsOnly
                    ? Colors.surface.orangeLight
                    : Colors.surface.greenLight,
                }}
              >
                <Text
                  className="text-caption font-bold"
                  style={{
                    color: isLocalsOnly ? Colors.tone.amber : Colors.tone.green,
                  }}
                >
                  {isLocalsOnly
                    ? strings.plansFeed.visibilityLocalBadge
                    : strings.plansFeed.visibilityOpenBadge}
                </Text>
              </View>
            ) : null}

            <View className="mt-4 rounded-[14px] bg-neutral-softTint px-3.5 py-3">
              <Text className="mb-1 text-label font-bold tracking-wide text-neutral-label">
                {strings.plansFeed.descriptionTitle}
              </Text>
              <Text
                className={`text-body ${description ? 'text-black-100' : 'text-black-400'}`}
              >
                {description || strings.plansFeed.descriptionEmpty}
              </Text>
            </View>

            {chatPreview.failed ? null : (
              <View className="mt-4">
                <PlanChatPanel
                  tokens={gradientTokens}
                  hostId={plan.host_id}
                  messages={chatPreview.messages}
                />
              </View>
            )}

            <View className="mt-4 gap-2.5">
              {people.map(person => {
                const colors = avatarColorsForId(person.user_id)
                return (
                  <View key={person.user_id} className="flex-row items-center gap-2.5">
                    {person.avatar_url ? (
                      <Image
                        source={{ uri: person.avatar_url }}
                        className="h-7 w-7 rounded-full"
                        cachePolicy="memory-disk"
                        contentFit="cover"
                      />
                    ) : (
                      <View
                        className="h-7 w-7 items-center justify-center rounded-full"
                        style={{ backgroundColor: colors.bg }}
                      >
                        <Text className="text-micro font-bold" style={{ color: colors.text }}>
                          {person.initials}
                        </Text>
                      </View>
                    )}
                    <Text className="flex-1 text-body font-medium text-black-100" numberOfLines={1}>
                      {person.name}
                    </Text>
                  </View>
                )
              })}
            </View>

            <Text className="mt-3 text-caption text-black-400" numberOfLines={1}>
              {strings.plansFeed.hostCreatedByPrefix} {plan.host_name}
              {VERIFICATION_ENABLED
                ? ` · ${plan.host_type === 'local' ? strings.plansFeed.hostLocal : strings.plansFeed.hostVisitor}`
                : null}
            </Text>

            {interactive ? (
              <Pressable
                className="mt-5 items-center rounded-full border py-3"
                style={{
                  backgroundColor: joined ? Colors.white : Colors.buttons.orange,
                  borderColor: joined ? Colors.neutral.border : Colors.buttons.orange,
                }}
                onPress={handleJoinPress}
                disabled={joined}
                accessibilityRole="button"
                accessibilityState={{ disabled: joined }}
              >
                <Text
                  className="text-body font-bold"
                  style={{ color: joined ? Colors.neutral.hint : Colors.white }}
                >
                  {strings.plansFeed.joinCta}
                </Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </Animated.View>
      </View>
    )

    if (presentation === 'hosted') {
      if (!visible) return null
      return (
        <View
          style={[StyleSheet.absoluteFillObject, styles.host]}
          pointerEvents={interactive ? 'box-none' : 'none'}
        >
          {body}
        </View>
      )
    }

    return (
      <Modal
        visible={visible}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={dismiss}
      >
        {body}
      </Modal>
    )
  },
)

const styles = StyleSheet.create({
  host: {
    zIndex: 100,
    elevation: 100,
  },
  card: {
    elevation: 12,
    shadowColor: Colors.black.DEFAULT,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
  },
})

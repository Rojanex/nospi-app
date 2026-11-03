import { Colors } from '@/assets/constants/Colors'
import { strings } from '@/constants/strings'
import type { MessageAnchor } from '@/components/chats/MessageActionMenu'
import { ChatMessage } from '@/types'
import * as Haptics from 'expo-haptics'
import React, { useCallback, useMemo } from 'react'
import { Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

type MessageBubbleProps = {
  message: ChatMessage
  isFirstInGroup?: boolean
  isLastInGroup?: boolean
  /** Only fires for other people's messages until other features (report / block); gets the bubble's screen position. */
  onLongPress?: (message: ChatMessage, anchor: MessageAnchor) => void
}

export function isSameMessageGroup(a: ChatMessage, b: ChatMessage | undefined): boolean {
  if (!b || a.type === 'system' || b.type === 'system') return false
  if (!!a.isOwn !== !!b.isOwn) return false
  if (a.isOwn) return true
  return a.sender?.name === b.sender?.name
}

export function MessageBubble({
  message,
  isFirstInGroup = true,
  isLastInGroup = true,
  onLongPress,
}: MessageBubbleProps) {
  const scale = useSharedValue(1)
  const bubbleWidth = useSharedValue(0)
  const bubbleHeight = useSharedValue(0)

  const openMenu = useCallback(
    (x: number, y: number, width: number, height: number) => {
      if (!onLongPress) return
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      onLongPress(message, { x, y, width, height })
    },
    [message, onLongPress],
  )

  const longPress = useMemo(
    () =>
      Gesture.LongPress()
        .enabled(!!onLongPress)
        .minDuration(350)
        .maxDistance(12)
        .onBegin(() => {
          scale.value = withTiming(0.96, { duration: 150 })
        })
        .onStart(e => {
          scheduleOnRN(
            openMenu,
            e.absoluteX - e.x,
            e.absoluteY - e.y,
            bubbleWidth.value,
            bubbleHeight.value,
          )
        })
        .onFinalize(() => {
          scale.value = withTiming(1, { duration: 150 })
        }),
    [onLongPress, openMenu, scale, bubbleWidth, bubbleHeight],
  )

  const bubbleScaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const stackSpacing = isLastInGroup ? 'mb-2' : 'mb-0.5'

  if (message.type === 'system') {
    return (
      <View className={`items-center py-1 ${stackSpacing}`}>
        <View
          className="rounded-full px-3 py-1.5"
          style={{ backgroundColor: Colors.neutral.tinted }}
        >
          <Text className="text-body text-ink-50">{message.content}</Text>
        </View>
      </View>
    )
  }

  if (message.isOwn) {
    return (
      <View className={`items-end ${stackSpacing}`}>
        <View
          className="max-w-[78%] rounded-2xl px-3.5 py-2.5"
          style={{
            backgroundColor: Colors.buttons.brown,
            borderTopRightRadius: isFirstInGroup ? 16 : 6,
            borderBottomRightRadius: isLastInGroup ? 16 : 6,
          }}
        >
          <Text className="text-title text-white">{message.content}</Text>
        </View>
      </View>
    )
  }

  return (
    <View className={`flex-row items-end gap-2 ${stackSpacing}`}>
      {isLastInGroup ? (
        <View
          className="h-7 w-7 items-center justify-center rounded-full"
          style={{ backgroundColor: message.sender!.bg }}
        >
          <Text
            className="text-label font-bold"
            style={{ color: message.sender!.text }}
          >
            {message.sender!.initials}
          </Text>
        </View>
      ) : (
        <View className="h-7 w-7" />
      )}

      <View className="max-w-[72%]">
        {isFirstInGroup ? (
          <Text className="mb-1 text-caption text-ink-40">{message.sender!.name}</Text>
        ) : null}
        <GestureDetector gesture={longPress}>
          <Animated.View
            onLayout={e => {
              bubbleWidth.value = e.nativeEvent.layout.width
              bubbleHeight.value = e.nativeEvent.layout.height
            }}
            accessible
            accessibilityHint={onLongPress ? strings.moderation.moreActions : undefined}
            className="rounded-2xl bg-white px-3.5 py-2.5"
            style={[
              {
                borderBottomLeftRadius: isLastInGroup ? 16 : 6,
                borderTopLeftRadius: isFirstInGroup ? 16 : 6,
              },
              bubbleScaleStyle,
            ]}
          >
            <Text className="text-title text-ink">{message.content}</Text>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  )
}

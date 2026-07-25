import { Colors } from '@/assets/constants/Colors'
import { ACTIVITY_META } from '@/constants/activityMeta'
import { isChatArchived, isPlanActive, isPlanExpired } from '@/constants/planStatus'
import { strings } from '@/constants/strings'
import { ChatListItem } from '@/lib/chats/mockChats'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useRef } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

const ACTION_WIDTH = 78
const OPEN_X = -ACTION_WIDTH
const SPRING = { damping: 20, stiffness: 200 }

type SwipeAction = {
  label: string
  backgroundColor: string
  onPress: () => void
}

type ChatRowProps = {
  item: ChatListItem
  isSwipeOpen: boolean
  onSwipeOpenChange: (open: boolean) => void
  onPress: () => void
  onLeave: () => void
  onArchive: () => void
  onUnarchive: () => void
}

export function ChatRow({
  item,
  isSwipeOpen,
  onSwipeOpenChange,
  onPress,
  onLeave,
  onArchive,
  onUnarchive,
}: ChatRowProps) {
  const meta = ACTIVITY_META[item.activityType]
  const expired = isPlanExpired(item.status)
  const cardBg = expired ? Colors.neutral.gray : meta.bg
  const circleBg = expired ? Colors.neutral.tinted : meta.circle

  const swipeAction: SwipeAction = isPlanActive(item.status)
    ? {
        label: strings.losMios.leaveAction,
        backgroundColor: Colors.buttons.brown,
        onPress: onLeave,
      }
    : isChatArchived(item)
      ? {
          label: strings.losMios.unarchiveAction,
          backgroundColor: Colors.neutral.body,
          onPress: onUnarchive,
        }
      : {
          label: strings.losMios.archiveAction,
          backgroundColor: Colors.activity.orangeDark,
          onPress: onArchive,
        }

  return (
    <SwipeableRow
      action={swipeAction}
      isOpen={isSwipeOpen}
      onOpenChange={onSwipeOpenChange}
      onPress={onPress}
    >
      <View
        className="overflow-hidden rounded-2xl px-4 py-3"
        style={{ backgroundColor: cardBg }}
      >
        <View className="flex-row items-start gap-3">
          <View
            className="h-11 w-11 items-center justify-center rounded-full"
            style={{ backgroundColor: circleBg, opacity: expired ? 0.55 : 1 }}
          >
            <Text className="text-[22px]" style={{ opacity: expired ? 0.7 : 1 }}>
              {meta.emoji}
            </Text>
          </View>

          <View className="min-w-0 flex-1">
            <View className="flex-row items-start justify-between gap-2">
              <Text className="flex-1 text-base font-bold text-ink" numberOfLines={1}>
                {item.title}
              </Text>
              <View className="flex-row items-center gap-1 pt-0.5">
                {expired ? (
                  <Ionicons name="lock-closed" size={10} color={Colors.ink[40]} />
                ) : null}
                <Text className="text-xs text-ink-40">{item.timeLabel}</Text>
              </View>
            </View>
            <View className="mt-0.5 flex-row items-center gap-2">
              <Text className="min-w-0 flex-1 text-sm text-ink-60" numberOfLines={1}>
                {item.previewText}
              </Text>
              {item.isHost ? (
                <View className="shrink-0 rounded-full bg-activity-orangeDark px-2.5 py-1">
                  <Text className="text-[10px] font-bold text-white">
                    {strings.losMios.hostBadge}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </SwipeableRow>
  )
}

type SwipeableRowProps = {
  action: SwipeAction
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onPress: () => void
  children: React.ReactNode
}

function SwipeableRow({ action, isOpen, onOpenChange, onPress, children }: SwipeableRowProps) {
  const translateX = useSharedValue(0)
  const dragStartX = useSharedValue(0)
  const isOpenRef = useRef(isOpen)

  useEffect(() => {
    isOpenRef.current = isOpen
    if (!isOpen) {
      translateX.value = withSpring(0, SPRING)
    }
  }, [isOpen, translateX])

  const setOpen = (open: boolean) => {
    isOpenRef.current = open
    onOpenChange(open)
  }

  const closeRow = () => {
    if (!isOpenRef.current) return
    setOpen(false)
  }

  const handleTap = () => {
    if (isOpenRef.current) {
      closeRow()
      return
    }
    onPress()
  }

  const handleActionPress = () => {
    closeRow()
    action.onPress()
  }

  const pan = Gesture.Pan()
    .activeOffsetX([-8, 8])
    .failOffsetY([-12, 12])
    .onBegin(() => {
      dragStartX.value = translateX.value
    })
    .onUpdate(e => {
      const next = dragStartX.value + e.translationX
      translateX.value = Math.min(0, Math.max(OPEN_X, next))
    })
    .onEnd(() => {
      const shouldOpen = translateX.value < OPEN_X / 2
      translateX.value = withSpring(shouldOpen ? OPEN_X : 0, SPRING)
      scheduleOnRN(setOpen, shouldOpen)
    })

  const tap = Gesture.Tap().onEnd(() => {
    scheduleOnRN(handleTap)
  })

  const gesture = Gesture.Exclusive(pan, tap)

  const rowStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))

  return (
    <View style={styles.swipeContainer}>
      <View style={styles.actionTrack} pointerEvents="box-none">
        <Pressable
          pointerEvents={isOpen ? 'auto' : 'none'}
          onPress={handleActionPress}
          style={[styles.actionButton, { backgroundColor: action.backgroundColor }]}
        >
          <Text style={styles.actionText}>{action.label}</Text>
        </Pressable>
      </View>

      <GestureDetector gesture={gesture}>
        <Animated.View style={rowStyle} collapsable={false}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  )
}

const styles = StyleSheet.create({
  swipeContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
  },
  actionTrack: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  actionButton: {
    width: ACTION_WIDTH,
    height: '100%',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
})

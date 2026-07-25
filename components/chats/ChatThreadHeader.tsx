import { Colors } from '@/assets/constants/Colors'
import { ACTIVITY_META } from '@/constants/activityMeta'
import { isPlanExpired } from '@/constants/planStatus'
import { strings } from '@/constants/strings'
import { ChatListItem } from '@/lib/chats/mockChats'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

type ChatThreadHeaderProps = {
  item: ChatListItem
  onBack: () => void
  onPressMembers: () => void
}

export function ChatThreadHeader({ item, onBack, onPressMembers }: ChatThreadHeaderProps) {
  const meta = ACTIVITY_META[item.activityType]
  const expired = isPlanExpired(item.status)
  const headerBg = expired ? Colors.neutral.gray : meta.bg
  const circleBg = expired ? Colors.neutral.tinted : meta.circle

  return (
    <View
      className="flex-row items-center gap-3 px-4 py-3"
      style={{ backgroundColor: headerBg }}
    >
      <Pressable
        onPress={onBack}
        hitSlop={8}
        className="h-9 w-9 items-center justify-center"
      >
        <Ionicons name="chevron-back" size={24} color={Colors.ink.DEFAULT} />
      </Pressable>

      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: circleBg, opacity: expired ? 0.55 : 1 }}
      >
        <Text className="text-xl" style={{ opacity: expired ? 0.7 : 1 }}>
          {meta.emoji}
        </Text>
      </View>

      <Pressable onPress={onPressMembers} className="min-w-0 flex-1">
        <Text className="text-base font-bold text-ink" numberOfLines={1}>
          {item.title}
        </Text>
        <Text className="mt-0.5 text-xs text-ink-50">
          {strings.losMios.threadSubtitle(item.memberCount, item.timeLabel)}
        </Text>
      </Pressable>

      {item.isHost && !expired ? (
        <View className="shrink-0 rounded-full bg-activity-orangeDark px-2.5 py-1">
          <Text className="text-[10px] font-bold text-white">
            {strings.losMios.hostBadge}
          </Text>
        </View>
      ) : expired ? (
        <Ionicons name="lock-closed" size={14} color={Colors.ink[40]} />
      ) : null}
    </View>
  )
}

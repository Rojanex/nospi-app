import { Colors } from '@/assets/constants/Colors'
import { ChatMessage } from '@/lib/chats/mockMessages'
import React from 'react'
import { Text, View } from 'react-native'

type MessageBubbleProps = {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  if (message.type === 'system') {
    return (
      <View className="items-center py-1">
        <View
          className="rounded-full px-3 py-1.5"
          style={{ backgroundColor: Colors.neutral.tinted }}
        >
          <Text className="text-xs text-ink/50">{message.content}</Text>
        </View>
      </View>
    )
  }

  if (message.isOwn) {
    return (
      <View className="items-end py-1">
        <View
          className="max-w-[78%] rounded-2xl px-3.5 py-2.5"
          style={{
            backgroundColor: Colors.buttons.brown,
            borderBottomRightRadius: 6,
          }}
        >
          <Text className="text-sm text-white">{message.content}</Text>
        </View>
      </View>
    )
  }

  return (
    <View className="flex-row items-end gap-2 py-1">
      <View
        className="h-7 w-7 items-center justify-center rounded-full"
        style={{ backgroundColor: message.sender!.bg }}
      >
        <Text
          className="text-[10px] font-bold"
          style={{ color: message.sender!.text }}
        >
          {message.sender!.initials}
        </Text>
      </View>

      <View className="max-w-[72%]">
        <Text className="mb-1 text-[11px] text-ink/40">{message.sender!.name}</Text>
        <View
          className="rounded-2xl bg-white px-3.5 py-2.5"
          style={{ borderBottomLeftRadius: 6 }}
        >
          <Text className="text-sm text-ink">{message.content}</Text>
        </View>
      </View>
    </View>
  )
}

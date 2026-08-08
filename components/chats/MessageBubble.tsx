import { Colors } from '@/assets/constants/Colors'
import { ChatMessage } from '@/types'
import React from 'react'
import { Text, View } from 'react-native'

type MessageBubbleProps = {
  message: ChatMessage
  isFirstInGroup?: boolean
  isLastInGroup?: boolean
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
}: MessageBubbleProps) {
  const stackSpacing = isLastInGroup ? 'mb-2' : 'mb-0.5'

  if (message.type === 'system') {
    return (
      <View className={`items-center py-1 ${stackSpacing}`}>
        <View
          className="rounded-full px-3 py-1.5"
          style={{ backgroundColor: Colors.neutral.tinted }}
        >
          <Text className="text-sm text-ink-50">{message.content}</Text>
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
          <Text className="text-lg text-white">{message.content}</Text>
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
            className="text-[10px] font-bold"
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
          <Text className="mb-1 text-[11px] text-ink-40">{message.sender!.name}</Text>
        ) : null}
        <View
          className="rounded-2xl bg-white px-3.5 py-2.5"
          style={{
            borderBottomLeftRadius: isLastInGroup ? 16 : 6,
            borderTopLeftRadius: isFirstInGroup ? 16 : 6,
          }}
        >
          <Text className="text-lg text-ink">{message.content}</Text>
        </View>
      </View>
    </View>
  )
}

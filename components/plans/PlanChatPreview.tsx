import { Colors } from '@/assets/constants/Colors'
import { strings } from '@/constants/strings'
import { PlanGradientTokens } from '@/lib/plans/gradientTokens'
import { avatarColorsForId, initialsFromName } from '@/lib/utils/avatar'
import { PlanMessagePreview } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

type BubbleProps = {
  message: PlanMessagePreview
  isHost: boolean
  tokens: PlanGradientTokens
  compact: boolean
}

function SenderAvatar({ message, userId }: { message: PlanMessagePreview; userId: string }) {
  const colors = avatarColorsForId(userId)
  return (
    <View
      className="z-10 -mb-1 h-6 w-6 items-center justify-center overflow-hidden rounded-full border-2 border-white"
      style={{ backgroundColor: colors.bg }}
      accessible
      accessibilityLabel={message.senderName}
    >
      {message.avatarUrl ? (
        <Image
          source={{ uri: message.avatarUrl }}
          style={StyleSheet.absoluteFill}
          cachePolicy="memory-disk"
          contentFit="cover"
        />
      ) : (
        <Text className="text-micro font-bold" style={{ color: colors.text }}>
          {initialsFromName(message.senderName)}
        </Text>
      )}
    </View>
  )
}

function ChatPreviewBubble({ message, isHost, tokens, compact }: BubbleProps) {
  if (message.userId === null) {
    return (
      <Text className="self-center text-caption italic text-black-400" numberOfLines={1}>
        {message.content}
      </Text>
    )
  }

  const userId = message.userId

  return (
    <View
      className={`flex-row items-end ${isHost ? 'justify-end' : 'justify-start'}`}
    >
      {isHost ? null : <SenderAvatar message={message} userId={userId} />}
      <View
        className={`max-w-[80%] rounded-[14px] border px-3 py-1.5 ${isHost ? '-mr-2' : '-ml-2'}`}
        style={{
          backgroundColor: isHost ? tokens.hostBubbleBg : Colors.white,
          borderColor: isHost ? tokens.hostBubbleBorder : Colors.neutral.border,
        }}
      >
        <Text
          className="text-body leading-[19px] text-black-100"
          numberOfLines={compact ? 1 : undefined}
        >
          {message.content}
        </Text>
      </View>
      {isHost ? <SenderAvatar message={message} userId={userId} /> : null}
    </View>
  )
}

type PanelProps = {
  tokens: PlanGradientTokens
  hostId: string
  /** null while loading */
  messages: PlanMessagePreview[] | null
  moreCount?: number
  showSeeAll?: boolean
  /** Clamp message text for the feed card; the modal shows it in full. */
  compact?: boolean
}

export function PlanChatPanel({
  tokens,
  hostId,
  messages,
  moreCount = 0,
  showSeeAll = false,
  compact = false,
}: PanelProps) {
  return (
    <View
      className="rounded-2xl border px-3 py-2.5"
      style={{
        experimental_backgroundImage: tokens.panelGradient,
        borderColor: tokens.panelBorder,
      }}
    >
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5">
          <View
            className="h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: tokens.accentColor }}
          />
          <Text className="text-label font-bold tracking-widest text-neutral-body">
            {strings.plansFeed.chatPreviewTitle}
          </Text>
        </View>
        {showSeeAll ? (
          <View className="flex-row items-center gap-0.5">
            <Text className="text-caption font-bold" style={{ color: tokens.accentColor }}>
              {strings.plansFeed.chatPreviewSeeAll}
            </Text>
            <Ionicons name="chevron-forward" size={12} color={tokens.accentColor} />
          </View>
        ) : null}
      </View>

      {messages === null ? (
        <View className="mx-2 h-9 rounded-[14px] bg-white/70" />
      ) : messages.length === 0 ? (
        <Text className="text-caption text-black-400">{strings.plansFeed.chatPreviewEmpty}</Text>
      ) : (
        <View className="gap-1.5">
          {messages.map(message => (
            <ChatPreviewBubble
              key={message.id}
              message={message}
              isHost={message.userId === hostId}
              tokens={tokens}
              compact={compact}
            />
          ))}
        </View>
      )}

      {moreCount > 0 ? (
        <View
          className="z-10 -mt-1.5 self-center rounded-full bg-white px-3 py-0.5"
          style={styles.morePill}
        >
          <Text
            className="text-label font-bold tracking-wide"
            style={{ color: tokens.accentColor }}
          >
            {strings.plansFeed.chatPreviewMore(moreCount).toUpperCase()}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  morePill: {
    elevation: 1,
    shadowColor: Colors.black.DEFAULT,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
})

import { Colors } from '@/assets/constants/Colors'
import { ACTIVITY_META } from '@/constants/activityMeta'
import { isPlanExpired } from '@/constants/planStatus'
import { strings } from '@/constants/strings'
import { ChatListItem } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import * as SystemUI from 'expo-system-ui'
import React, { useEffect } from 'react'
import { Pressable, StatusBar, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type ChatThreadHeaderProps = {
  item: ChatListItem
  onBack: () => void
  onPressMembers: () => void
}

export function ChatThreadHeader({ item, onBack, onPressMembers }: ChatThreadHeaderProps) {
  const insets = useSafeAreaInsets()
  const meta = ACTIVITY_META[item.activityType]
  const expired = isPlanExpired(item.status)
  const headerBg = expired ? Colors.neutral.gray : meta.bg
  const circleBg = expired ? Colors.neutral.tinted : meta.circle

  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(headerBg)
    return () => {
      void SystemUI.setBackgroundColorAsync(Colors.primary[300])
    }
  }, [headerBg])

  return (
    <View style={{ backgroundColor: headerBg, paddingTop: insets.top }}>
      <StatusBar translucent backgroundColor={headerBg} barStyle="dark-content" />
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
          backgroundColor: headerBg,
        }}
      >
        <Pressable
          onPress={onBack}
          hitSlop={8}
          style={{
            height: 36,
            width: 36,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.ink.DEFAULT} />
        </Pressable>

        <View
          style={{
            height: 40,
            width: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 12,
            backgroundColor: circleBg,
            opacity: expired ? 0.55 : 1,
          }}
        >
          <Text style={{ fontSize: 20, opacity: expired ? 0.7 : 1 }}>{meta.emoji}</Text>
        </View>

        <Pressable onPress={onPressMembers} style={{ minWidth: 0, flex: 1 }}>
          <Text
            style={{ fontSize: 16, fontWeight: '700', color: Colors.ink.DEFAULT }}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={{ marginTop: 2, fontSize: 12, color: Colors.ink[50] }}>
            {strings.losMios.threadSubtitle(item.memberCount, item.timeLabel)}
          </Text>
        </Pressable>

        {item.isHost && !expired ? (
          <View
            style={{
              flexShrink: 0,
              borderRadius: 999,
              backgroundColor: Colors.activity.orangeDark,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ fontSize: 10, fontWeight: '700', color: Colors.white }}>
              {strings.losMios.hostBadge}
            </Text>
          </View>
        ) : expired ? (
          <Ionicons name="lock-closed" size={14} color={Colors.ink[40]} />
        ) : null}
      </View>
    </View>
  )
}

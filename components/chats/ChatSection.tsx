import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, View } from 'react-native'

type ChatSectionProps = {
  label: string
  locked?: boolean
  children: React.ReactNode
}

export function ChatSection({ label, locked = false, children }: ChatSectionProps) {
  return (
    <View className="gap-2.5">
      <View className="flex-row items-center gap-1.5">
        <Text className="text-xs font-semibold uppercase tracking-wide text-ink/50">
          {label}
        </Text>
        {locked ? (
          <Ionicons name="lock-closed" size={11} color="#1C1B1980" />
        ) : null}
      </View>
      <View className="gap-2.5">{children}</View>
    </View>
  )
}

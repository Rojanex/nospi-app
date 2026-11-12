import { Colors } from '@/assets/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React from 'react'
import { Pressable, Text, View } from 'react-native'

/** Back chevron + title, same as the archived chats screen. */
export function SettingsHeader({ title }: { title: string }) {
  const router = useRouter()

  return (
    <View className="flex-row items-center gap-2 px-4 py-3">
      <Pressable
        onPress={() => router.back()}
        hitSlop={8}
        accessibilityRole="button"
        className="h-9 w-9 items-center justify-center"
      >
        <Ionicons name="chevron-back" size={24} color={Colors.ink.DEFAULT} />
      </Pressable>
      <Text className="text-xl font-bold text-ink">{title}</Text>
    </View>
  )
}

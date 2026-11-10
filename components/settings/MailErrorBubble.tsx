import React from 'react'
import { Text, View } from 'react-native'

/** Shown for a few seconds when the device has no mail app (see useSupportMail). */
export function MailErrorBubble({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <View className="mb-4 rounded-2xl bg-neutral-softTint px-4 py-3">
      <Text className="text-center text-caption text-ink">{message}</Text>
    </View>
  )
}

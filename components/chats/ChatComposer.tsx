import { Colors } from '@/assets/constants/Colors'
import { isPlanExpired, PlanStatus } from '@/constants/planStatus'
import { strings } from '@/constants/strings'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Pressable, Text, TextInput, View } from 'react-native'

type ChatComposerProps = {
  status: PlanStatus
  value: string
  onChangeValue: (value: string) => void
  onSend: () => void
}

export function ChatComposer({
  status,
  value,
  onChangeValue,
  onSend,
}: ChatComposerProps) {
  const canSend = value.trim().length > 0

  if (isPlanExpired(status)) {
    return (
      <View className="flex-row items-center justify-center gap-2 border-t border-neutral-border px-5 py-3.5">
        <Ionicons name="lock-closed" size={14} color={Colors.ink[40]} />
        <Text className="text-sm text-ink-50">{strings.losMios.readOnlyBanner}</Text>
      </View>
    )
  }

  return (
    <View className="flex-row items-center gap-2.5 border-t border-neutral-border px-4 py-3">
      <TextInput
        className="flex-1 rounded-full bg-neutral-softTint px-4 py-2.5 text-sm text-ink"
        placeholder={strings.losMios.messagePlaceholder}
        placeholderTextColor={Colors.ink[25]}
        value={value}
        onChangeText={onChangeValue}
        multiline
      />
      <Pressable
        onPress={onSend}
        disabled={!canSend}
        className="h-10 w-10 items-center justify-center rounded-full"
        style={{
          backgroundColor: Colors.buttons.brown,
          opacity: canSend ? 1 : 0.4,
        }}
      >
        <Ionicons name="arrow-up" size={20} color={Colors.white} />
      </Pressable>
    </View>
  )
}

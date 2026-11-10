import { Colors } from '@/assets/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Pressable, Text } from 'react-native'

type SettingsRowProps = {
  icon: React.ComponentProps<typeof Ionicons>['name']
  label: string
  value?: string
  /**
   * chevron: opens a screen in the app · external: opens a browser or the mail app
   * lock: read-only value (changes go through soporte)
   */
  trailing?: 'chevron' | 'external' | 'lock' | 'none'
  tone?: 'default' | 'danger'
  /** Omit for an info-only row (e.g. name, phone, app version). */
  onPress?: () => void
}

export function SettingsRow({
  icon,
  label,
  value,
  trailing = 'chevron',
  tone = 'default',
  onPress,
}: SettingsRowProps) {
  const isDanger = tone === 'danger'

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      className={`flex-row items-center gap-4 px-5 py-[13px] ${onPress ? 'active:bg-neutral-softTint' : ''}`}
    >
      <Ionicons name={icon} size={22} color={isDanger ? Colors.danger : Colors.ink.DEFAULT} />
      <Text
        className={`text-body ${isDanger ? 'text-danger' : 'text-ink'} ${value ? '' : 'flex-1'}`}
        numberOfLines={1}
      >
        {label}
      </Text>
      {value ? (
        <Text className="flex-1 text-right text-body text-black-300" numberOfLines={1}>
          {value}
        </Text>
      ) : null}
      {trailing === 'chevron' ? (
        <Ionicons name="chevron-forward" size={18} color={Colors.neutral.hint} />
      ) : null}
      {trailing === 'external' ? (
        <Ionicons name="open-outline" size={16} color={Colors.neutral.hint} />
      ) : null}
      {trailing === 'lock' ? (
        <Ionicons name="lock-closed-outline" size={15} color={Colors.neutral.hint} />
      ) : null}
    </Pressable>
  )
}

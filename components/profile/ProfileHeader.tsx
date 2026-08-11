import { Colors } from '@/assets/constants/Colors'
import { Icon } from '@/assets/icons'
import { IconSquare } from '@/components/plans/IconSquare'
import { strings } from '@/constants/strings'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

type ProfileHeaderProps = {
  onSettingsPress: () => void
}

export function ProfileHeader({ onSettingsPress }: ProfileHeaderProps) {
  return (
    <View className="mb-6 flex-row items-center justify-between gap-3">
      <View className="flex-row items-center gap-2.5">
        <Text className="text-3xl font-extrabold text-ink">
          {strings.profile.title}
        </Text>
      </View>
      <TouchableOpacity
        className="tab-icon-btn"
        onPress={onSettingsPress}
        accessibilityRole="button"
        accessibilityLabel="Settings"
      >
        <Ionicons name="settings-outline" size={22} color={Colors.black[300]} />
      </TouchableOpacity>
    </View>
  )
}

import { Colors } from '@/assets/constants/Colors'
import { strings } from '@/constants/strings'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'

type OnboardingBannerProps = {
  onPress: () => void 
}

/** Warm banner matching ACTIVITY_META comida tones (amber). */
export function OnboardingBanner({ onPress }: OnboardingBannerProps) {
  return (
    <View
      className="mb-4 overflow-hidden rounded-2xl px-4 py-4"
      style={{ backgroundColor: '#FAEEDA' }}
    >
      <View className="mb-3 flex-row items-start gap-2.5">
        <View
          className="mt-0.5 h-8 w-8 items-center justify-center rounded-xl"
          style={{ backgroundColor: '#F0E1CC' }}
        >
          <Ionicons name="shield-checkmark-outline" size={16} color={Colors.activity.amber} />
        </View>
        <Text
          className="flex-1 text-[13px] leading-[18px] font-medium"
          style={{ color: Colors.activity.amber }}
        >
          {strings.profile.onboardingBannerBody}
        </Text>
      </View>
      <TouchableOpacity
        className="items-center justify-center rounded-full py-3"
        style={{ backgroundColor: Colors.activity.amber }}
        onPress={onPress}
        activeOpacity={0.85}
      >
        <Text className="text-[13px] font-bold text-white">
          {strings.profile.onboardingBannerCta}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

import { Colors } from '@/assets/constants/Colors'
import { HatCowboySide } from '@/assets/icons'
import { strings } from '@/constants/strings'
import {
  verificationBadgeForRole,
  verificationLabelForRole,
} from '@/lib/profiles/verification'
import { avatarColorsForId, initialsFromName } from '@/lib/utils/avatar'
import type { UserRole } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import React from 'react'
import { Text, View } from 'react-native'

export type ProfileIdentityData = {
  id: string
  display_name: string | null
  avatar_url: string | null
  home_city: string | null
  role: UserRole
  is_founder: boolean
}

type ProfileIdentityProps = {
  profile: ProfileIdentityData
}

export function ProfileIdentity({ profile }: ProfileIdentityProps) {
  const name = profile.display_name?.trim() || strings.common.userFallback
  const initials = initialsFromName(name)
  const colors = avatarColorsForId(profile.id)
  const badge = verificationBadgeForRole(profile.role)
  const statusLabel = verificationLabelForRole(profile.role)

  return (
    <View className="mb-6 items-center">
      <View className="relative mb-3 h-24 w-24">
        {profile.avatar_url ? (
          <Image
            source={{ uri: profile.avatar_url }}
            className="h-24 w-24 rounded-full"
            cachePolicy="memory-disk"
            contentFit="cover"
          />
        ) : (
          <View
            className="h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.bg }}
          >
            <Text className="text-2xl font-bold" style={{ color: colors.text }}>
              {initials}
            </Text>
          </View>
        )}

        <View
          className="absolute bottom-0 right-0 h-7 w-7 items-center justify-center rounded-full border-2 border-primary-300"
          style={{ backgroundColor: badge.bg }}
        >
          {badge.kind === 'cowboy' ? (
            <HatCowboySide size={12} color={Colors.white} />
          ) : (
            <Ionicons name="checkmark" size={14} color={Colors.white} />
          )}
        </View>
      </View>

      <View className="mb-1 flex-row items-center justify-center gap-2">
        <Text className="text-xl font-bold text-ink">{name}</Text>
        {profile.is_founder ? (
          <View className="rounded-full bg-surface-orangeLight px-2.5 py-1">
            <Text className="text-[11px] font-bold text-buttons-orange">
              {strings.profile.founderPill}
            </Text>
          </View>
        ) : null}
      </View>

      <Text className="mb-2 text-sm font-medium text-black-400">{statusLabel}</Text>

      {profile.home_city?.trim() ? (
        <View className="flex-row items-center gap-1">
          <Ionicons name="location-sharp" size={14} color={Colors.black[300]} />
          <Text className="text-sm text-black-300">{profile.home_city.trim()}</Text>
        </View>
      ) : null}
    </View>
  )
}

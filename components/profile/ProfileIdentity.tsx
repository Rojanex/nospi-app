import { Colors } from '@/assets/constants/Colors'
import { FounderMark } from '@/components/profile/FounderMark'
import { strings } from '@/constants/strings'
import { instagramProfileUrl } from '@/lib/profiles/instagram'
import { avatarColorsForId, initialsFromName } from '@/lib/utils/avatar'
import { Ionicons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import React from 'react'
import { Linking, Pressable, Text, View } from 'react-native'

export type ProfileIdentityData = {
  id: string
  display_name: string | null
  avatar_url: string | null
  is_founder: boolean
  instagram_handle: string | null
}

type ProfileIdentityProps = {
  profile: ProfileIdentityData
}

export function ProfileIdentity({ profile }: ProfileIdentityProps) {
  const name = profile.display_name?.trim() || strings.common.userFallback
  const initials = initialsFromName(name)
  const colors = avatarColorsForId(profile.id)
  const instagram = profile.instagram_handle

  function openInstagram() {
    if (!instagram) return
    Linking.openURL(instagramProfileUrl(instagram)).catch(err => {
      console.error('[profile] open instagram', err)
    })
  }

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

        {profile.is_founder ? (
          <FounderMark size="md" className="absolute bottom-0 right-0 border-2 border-primary-300" />
        ) : null}
      </View>

      <Text className="mb-1 text-xl font-bold text-ink">{name}</Text>

      {/* Founder pill | Instagram logo, on one compact row. Either one can be missing. */}
      {profile.is_founder || instagram ? (
        <View className="mt-1 flex-row items-center gap-2.5">
          {profile.is_founder ? (
            <View
              className="rounded-full px-3 py-1"
              style={{ backgroundColor: Colors.surface.orangeLight }}
            >
              <Text
                className="text-caption font-bold tracking-[0.3px]"
                style={{ color: Colors.tone.orangeDark }}
              >
                {strings.profile.founderPill}
              </Text>
            </View>
          ) : null}

          {profile.is_founder && instagram ? (
            <View className="h-4 w-px" style={{ backgroundColor: Colors.neutral.border }} />
          ) : null}

          {instagram ? (
            <Pressable
              onPress={openInstagram}
              hitSlop={10}
              accessibilityRole="link"
              accessibilityLabel={strings.profile.instagramOpen(instagram)}
              className="active:opacity-60"
            >
              <Ionicons name="logo-instagram" size={20} color={Colors.ink.DEFAULT} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  )
}

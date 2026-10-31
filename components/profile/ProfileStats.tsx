import { strings } from '@/constants/strings'
import React from 'react'
import { Text, View } from 'react-native'

type ProfileStatsProps = {
  created: number
  attended: number
}

export function ProfileStats({ created, attended }: ProfileStatsProps) {
  return (
    <View className="mb-5 flex-row overflow-hidden rounded-2xl bg-white">
      <View className="flex-1 items-center py-4">
        <Text className="text-2xl font-extrabold text-ink">{created}</Text>
        <Text className="mt-0.5 text-caption font-medium text-black-400">
          {strings.profile.statsCreated}
        </Text>
      </View>
      <View className="w-px self-stretch bg-neutral-divider" />
      <View className="flex-1 items-center py-4">
        <Text className="text-2xl font-extrabold text-ink">{attended}</Text>
        <Text className="mt-0.5 text-caption font-medium text-black-400">
          {strings.profile.statsAttended}
        </Text>
      </View>
    </View>
  )
}

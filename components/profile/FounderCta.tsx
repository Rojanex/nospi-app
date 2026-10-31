import { strings } from '@/constants/strings'
import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

type FounderCtaProps = {
  onPress: () => void
}

export function FounderCta({ onPress }: FounderCtaProps) {
  return (
    <TouchableOpacity
      className="mb-5 items-center justify-center rounded-full border border-neutral-border bg-white py-3.5"
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text className="text-body font-bold text-ink">
        {strings.profile.founderCta}
      </Text>
    </TouchableOpacity>
  )
}

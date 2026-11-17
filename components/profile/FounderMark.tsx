import { Colors } from '@/assets/constants/Colors'
import { strings } from '@/constants/strings'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { View } from 'react-native'

const SIZES = {
  /** Next to the host name on plan cards and the plan detail */
  sm: { box: 16, icon: 10 },
  /** Avatar corner on profiles */
  md: { box: 28, icon: 16 },
} as const

type FounderMarkProps = {
  size?: keyof typeof SIZES
  className?: string
}

/**
 * Rocket seal shown for founders (profiles.is_founder): they were here from the launch.
 */
export function FounderMark({ size = 'sm', className = '' }: FounderMarkProps) {
  const { box, icon } = SIZES[size]

  return (
    <View
      accessible
      accessibilityLabel={strings.profile.founderPill}
      className={`items-center justify-center rounded-full ${className}`}
      style={{ width: box, height: box, backgroundColor: Colors.buttons.orange }}
    >
      <Ionicons name="rocket" size={icon} color={Colors.white} />
    </View>
  )
}

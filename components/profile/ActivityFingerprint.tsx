import { getActivityMeta } from '@/constants/activityMeta'
import { strings } from '@/constants/strings'
import type { ActivityFingerprintItem } from '@/lib/profiles/api'
import React, { useMemo } from 'react'
import { Text, View } from 'react-native'

type ActivityFingerprintProps = {
  fingerprint: ActivityFingerprintItem[]
}

export function ActivityFingerprint({ fingerprint }: ActivityFingerprintProps) {
  const items = useMemo(
    () =>
      [...fingerprint]
        .filter(item => item.count > 0)
        .sort((a, b) => b.count - a.count),
    [fingerprint],
  )

  if (items.length === 0) return null

  return (
    <View className="mb-5">
      <Text className="mb-3 text-lead font-bold text-ink">
        {strings.profile.activityFingerprintLabel}
      </Text>
      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        {items.map(item => {
          const meta = getActivityMeta(item.activity_type)
          return (
            <View
              key={item.activity_type}
              className="flex-row items-center rounded-full px-3 py-1.5"
              style={{ backgroundColor: meta.bg }}
            >
              <Text className="mr-1.5 text-body">{meta.emoji}</Text>
              <Text className="text-body font-semibold" style={{ color: meta.accent }}>
                {meta.label} · {item.count}
              </Text>
            </View>
          )
        })}
      </View>
    </View>
  )
}

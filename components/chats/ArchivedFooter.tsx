import { strings } from '@/constants/strings'
import React from 'react'
import { Text, TouchableOpacity } from 'react-native'

type ArchivedFooterProps = {
  count: number
  onPress: () => void
}

export function ArchivedFooter({ count, onPress }: ArchivedFooterProps) {
  return (
    <TouchableOpacity onPress={onPress} className="items-center py-4" activeOpacity={0.6}>
      <Text className="text-sm font-medium text-ink/40">
        {strings.losMios.archivedFooter(count)}
      </Text>
    </TouchableOpacity>
  )
}

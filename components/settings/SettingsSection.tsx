import React from 'react'
import { Text, View } from 'react-native'

type SettingsSectionProps = {
  title?: string
  /** Small grey text under the rows (e.g. why a value can't be edited). */
  footer?: React.ReactNode
  /** Hide the thin line above the section (first section on a screen). */
  first?: boolean
  children: React.ReactNode
}

/**
 * Flat list section (Instagram / Rappi style): no card, rows run edge to edge,
 * sections are separated by a thin line instead of boxes.
 */
export function SettingsSection({ title, footer, first = false, children }: SettingsSectionProps) {
  return (
    <View>
      {first ? null : <View className="mx-5 my-2 h-px bg-neutral-divider" />}
      {title ? (
        <Text className="px-5 pb-1 pt-3 text-caption font-semibold text-black-300">{title}</Text>
      ) : null}
      {children}
      {footer ? <View className="px-5 pb-3 pt-1">{footer}</View> : null}
    </View>
  )
}

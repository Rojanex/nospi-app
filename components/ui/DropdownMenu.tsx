import { Colors } from '@/assets/constants/Colors'
import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

export type DropdownMenuItem = {
  key: string
  label: string
  icon: React.ComponentProps<typeof Ionicons>['name']
  /** Red text and icon (report, block). */
  destructive?: boolean
  onPress: () => void
}

type DropdownMenuProps = {
  open: boolean
  onClose: () => void
  items: DropdownMenuItem[]
  /** Position of the box inside the parent, e.g. "right-3.5 top-12". */
  positionClassName: string
}

type MenuListProps = {
  items: DropdownMenuItem[]
  onClose: () => void
  className?: string
  style?: StyleProp<ViewStyle>
  backgroundClassName?: string
}

export function MenuList({
  items,
  onClose,
  className = '',
  style,
  backgroundClassName = 'bg-white',
}: MenuListProps) {
  return (
    <View
      className={`min-w-[230px] overflow-hidden rounded-2xl ${backgroundClassName} ${className}`}
      style={[styles.menu, style]}
      accessibilityRole="menu"
    >
      {items.map((item, index) => {
        const color = item.destructive ? Colors.danger : Colors.ink.DEFAULT
        return (
          <View key={item.key}>
            {index > 0 ? <View className="h-px bg-neutral-divider" /> : null}
            <Pressable
              onPress={() => {
                onClose()
                item.onPress()
              }}
              accessibilityRole="menuitem"
              className="flex-row items-center gap-3 px-4 py-3.5 active:bg-neutral-softTint"
            >
              <Ionicons name={item.icon} size={18} color={color} />
              <Text className="shrink text-body font-semibold" style={{ color }} numberOfLines={1}>
                {item.label}
              </Text>
            </Pressable>
          </View>
        )
      })}
    </View>
  )
}


export function DropdownMenu({ open, onClose, items, positionClassName }: DropdownMenuProps) {
  if (!open) return null

  return (
    <>
      <Pressable style={StyleSheet.absoluteFillObject} className="z-20" onPress={onClose} />
      <MenuList
        items={items}
        onClose={onClose}
        className={`absolute z-30 ${positionClassName}`}
      />
    </>
  )
}

const styles = StyleSheet.create({
  menu: {
    elevation: 16,
    shadowColor: Colors.black.DEFAULT,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
})

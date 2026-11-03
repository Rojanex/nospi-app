import { MenuList, type DropdownMenuItem } from '@/components/ui/DropdownMenu'
import { ChatMessage } from '@/types'
import React, { useRef } from 'react'
import { Modal, Platform, Pressable, Text, useWindowDimensions, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/** Bubble position on screen, from measureInWindow. */
export type MessageAnchor = {
  x: number
  y: number
  width: number
  height: number
}

type MessageActionMenuProps = {
  /** null = closed */
  message: ChatMessage | null
  anchor: MessageAnchor | null
  items: DropdownMenuItem[]
  onClose: () => void
}

const GAP = 14
const ITEM_HEIGHT = 52
const SCREEN_MARGIN = 12

/**
 * WhatsApp-style long-press menu: dims the chat, keeps the held bubble lit in place,
 * and opens the menu right under it (or above it when there's no room below).
 * Item actions run after the overlay is fully gone, so they can open another
 * Modal or Alert on iOS.
 */
export function MessageActionMenu({ message, anchor, items, onClose }: MessageActionMenuProps) {
  const { height: screenHeight, width: screenWidth } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const pendingActionRef = useRef<(() => void) | null>(null)

  function runPending() {
    const action = pendingActionRef.current
    pendingActionRef.current = null
    action?.()
  }

  const deferredItems = items.map(item => ({
    ...item,
    onPress: () => {
      pendingActionRef.current = item.onPress
      if (Platform.OS !== 'ios') runPending()
    },
  }))

  const visible = message !== null && anchor !== null
  const menuHeight = items.length * ITEM_HEIGHT
  let menuTop = 0
  if (anchor) {
    const below = anchor.y + anchor.height + GAP
    const above = anchor.y - GAP - menuHeight
    const bottomLimit = screenHeight - insets.bottom - SCREEN_MARGIN
    menuTop =
      below + menuHeight <= bottomLimit
        ? below
        : above >= insets.top + SCREEN_MARGIN
          ? above
          : bottomLimit - menuHeight
  }
  const menuLeft = anchor
    ? Math.min(anchor.x, screenWidth - 230 - SCREEN_MARGIN)
    : 0

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
      onDismiss={runPending}
    >
      <Pressable className="flex-1 bg-black/60" onPress={onClose}>
        {message && anchor ? (
          <>
            <View
              pointerEvents="none"
              className="absolute rounded-2xl bg-white px-3.5 py-2.5"
              style={{ top: anchor.y, left: anchor.x, width: anchor.width }}
            >
              <Text className="text-title text-ink">{message.content}</Text>
            </View>

            <MenuList
              items={deferredItems}
              onClose={onClose}
              className="absolute"
              backgroundClassName="bg-primary-200"
              style={{ top: menuTop, left: menuLeft }}
            />
          </>
        ) : null}
      </Pressable>
    </Modal>
  )
}

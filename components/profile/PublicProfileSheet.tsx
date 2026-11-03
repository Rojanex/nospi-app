import { Colors } from '@/assets/constants/Colors'
import { PublicProfileView } from '@/components/profile/PublicProfileView'
import { strings } from '@/constants/strings'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useRef } from 'react'
import { Modal, Platform, Pressable, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type PublicProfileSheetProps = {
  userId: string | null
  onClose: () => void
  onBlockChange?: (userId: string, blocked: boolean) => void
  deferRefresh?: boolean
  onDismissed?: () => void
}

/**
 * Bottom sheet with someone else's profile (e.g. a plan's host).
 * Render it inside the screen or Modal that opens it, so iOS can stack it on top.
 */
export function PublicProfileSheet({
  userId,
  onClose,
  onBlockChange,
  deferRefresh = false,
  onDismissed,
}: PublicProfileSheetProps) {
  const insets = useSafeAreaInsets()

  const wasOpenRef = useRef(false)
  useEffect(() => {
    if (userId !== null) {
      wasOpenRef.current = true
      return
    }
    if (wasOpenRef.current && Platform.OS !== 'ios') onDismissed?.()
    wasOpenRef.current = false
  }, [userId, onDismissed])

  return (
    <Modal
      visible={userId !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
      onDismiss={onDismissed}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="absolute inset-0" onPress={onClose} />

        <View
          className="max-h-[85%] w-full rounded-t-3xl bg-primary-200 pt-4"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          {userId ? (
            <PublicProfileView
              key={userId}
              userId={userId}
              showModerationActions
              onBlockChange={onBlockChange}
              deferRefresh={deferRefresh}
              headerRight={
                <Pressable
                  onPress={onClose}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={strings.plansFeed.planDetailClose}
                  className="h-8 w-8 items-center justify-center"
                >
                  <Ionicons name="close" size={20} color={Colors.black[400]} />
                </Pressable>
              }
            />
          ) : null}
        </View>
      </View>
    </Modal>
  )
}

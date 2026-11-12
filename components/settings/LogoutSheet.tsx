import { Colors } from '@/assets/constants/Colors'
import { strings } from '@/constants/strings'
import { signOut } from '@/lib/profiles/account'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type LogoutSheetProps = {
  visible: boolean
  onClose: () => void
}

/** Confirm sheet for logging out (same look as BlockSheet). Runs the sign-out itself. */
export function LogoutSheet({ visible, onClose }: LogoutSheetProps) {
  const insets = useSafeAreaInsets()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!visible) return
    setBusy(false)
    setError(null)
  }, [visible])

  async function handleConfirm() {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      // On success the root layout swaps to the auth screens and unmounts this sheet.
      await signOut()
    } catch {
      setError(strings.settings.logoutError)
      setBusy(false)
    }
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="absolute inset-0" onPress={busy ? undefined : onClose} />

        <View
          className="w-full rounded-t-3xl bg-primary-200 px-5 pt-5"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="mb-1 flex-row items-start justify-between gap-3">
            <Text className="shrink text-xl font-extrabold text-ink">
              {strings.settings.logoutConfirmTitle}
            </Text>
            <Pressable
              onPress={onClose}
              disabled={busy}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={strings.settings.cancel}
              className="h-8 w-8 items-center justify-center"
            >
              <Ionicons name="close" size={20} color={Colors.black[400]} />
            </Pressable>
          </View>

          <Text className="text-body text-ink-50">{strings.settings.logoutConfirmBody}</Text>

          {error ? (
            <Text className="mt-3 text-center text-body text-danger">{error}</Text>
          ) : null}

          <Pressable
            onPress={handleConfirm}
            disabled={busy}
            accessibilityRole="button"
            accessibilityState={{ disabled: busy }}
            className="mt-5 w-full items-center rounded-full bg-buttons-brown py-[15px]"
          >
            {busy ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text className="text-body font-bold text-white">{strings.settings.logout}</Text>
            )}
          </Pressable>

          <Pressable onPress={onClose} disabled={busy} className="mt-1 w-full items-center py-3">
            <Text className="text-body font-semibold text-ink-50">{strings.settings.cancel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

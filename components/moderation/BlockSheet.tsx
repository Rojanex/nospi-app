import { Colors } from '@/assets/constants/Colors'
import { strings } from '@/constants/strings'
import { blockUser, unblockUser } from '@/lib/moderation/api'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Modal, Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export type BlockSheetTarget = {
  userId: string
  name: string
  block: boolean
}

type BlockSheetProps = {
  target: BlockSheetTarget | null
  onClose: () => void
  onDone?: (userId: string, blocked: boolean) => void
  deferRefresh?: boolean
}

/**
 * Confirm sheet for blocking or unblocking someone. Runs the action itself.
 * Render it inside the screen or Modal that opens it, so iOS can stack it on top.
 */
export function BlockSheet({ target, onClose, onDone, deferRefresh = false }: BlockSheetProps) {
  const insets = useSafeAreaInsets()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!target) return
    setBusy(false)
    setError(null)
  }, [target])

  async function handleConfirm() {
    if (!target || busy) return

    setBusy(true)
    setError(null)
    try {
      const options = { refresh: !deferRefresh }
      if (target.block) {
        await blockUser(target.userId, options)
      } else {
        await unblockUser(target.userId, options)
      }
      onDone?.(target.userId, target.block)
      onClose()
    } catch {
      setError(strings.moderation.blockError)
    } finally {
      setBusy(false)
    }
  }

  const isBlock = target?.block ?? true

  return (
    <Modal
      visible={target !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <Pressable className="absolute inset-0" onPress={onClose} />

        <View
          className="w-full rounded-t-3xl bg-primary-200 px-5 pt-5"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="mb-1 flex-row items-start justify-between gap-3">
            <Text className="shrink text-xl font-extrabold text-ink">
              {target
                ? isBlock
                  ? strings.moderation.blockConfirmTitle(target.name)
                  : strings.moderation.unblockConfirmTitle(target.name)
                : ''}
            </Text>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={strings.moderation.cancel}
              className="h-8 w-8 items-center justify-center"
            >
              <Ionicons name="close" size={20} color={Colors.black[400]} />
            </Pressable>
          </View>

          {isBlock ? (
            <Text className="text-body text-ink-50">{strings.moderation.blockConfirmBody}</Text>
          ) : null}

          {error ? (
            <Text className="mt-3 text-center text-body text-danger">{error}</Text>
          ) : null}

          <Pressable
            onPress={handleConfirm}
            disabled={busy}
            accessibilityRole="button"
            accessibilityState={{ disabled: busy }}
            className={`mt-5 w-full items-center rounded-full py-[15px] ${isBlock ? 'bg-danger' : 'bg-buttons-brown'}`}
          >
            {busy ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text className="text-body font-bold text-white">
                {isBlock ? strings.moderation.block : strings.moderation.unblock}
              </Text>
            )}
          </Pressable>

          <Pressable onPress={onClose} className="mt-1 w-full items-center py-3">
            <Text className="text-body font-semibold text-ink-50">{strings.moderation.cancel}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  )
}

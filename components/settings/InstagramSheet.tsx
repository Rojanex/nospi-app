import { Colors } from '@/assets/constants/Colors'
import { strings } from '@/constants/strings'
import {
  isValidInstagramHandle,
  normalizeInstagramHandle,
  updateInstagramHandle,
} from '@/lib/profiles/instagram'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

/** Room for a pasted profile link; it is cut down to the bare handle as soon as it lands. */
const INPUT_MAX_LENGTH = 120

type InstagramSheetProps = {
  visible: boolean
  userId: string
  /** Saved handle without "@", or null */
  currentHandle: string | null
  onClose: () => void
  onSaved: (handle: string | null) => void
}

/** Add, edit or remove the optional Instagram handle (same look as LogoutSheet). */
export function InstagramSheet({
  visible,
  userId,
  currentHandle,
  onClose,
  onSaved,
}: InstagramSheetProps) {
  const insets = useSafeAreaInsets()
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!visible) return
    setDraft(currentHandle ?? '')
    setBusy(false)
    setError(null)
  }, [visible, currentHandle])

  const handle = normalizeInstagramHandle(draft)
  const isValid = isValidInstagramHandle(handle)
  const showInvalid = draft.trim().length > 0 && !isValid
  const canSave = isValid && handle !== currentHandle && !busy

  function handleChange(text: string) {
    // Pasted links and a typed "@" are cleaned right away; plain typing is only lowercased.
    const looksPasted = text.includes('instagram.com') || text.includes('instagr.am')
    setDraft(looksPasted || text.startsWith('@') ? normalizeInstagramHandle(text) : text.toLowerCase())
    setError(null)
  }

  async function save(next: string | null) {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      await updateInstagramHandle(userId, next)
      onSaved(next)
      onClose()
    } catch {
      setError(strings.settings.instagramError)
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
      <KeyboardAvoidingView
        className="flex-1 justify-end bg-black/40"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable className="absolute inset-0" onPress={busy ? undefined : onClose} />

        <View
          className="w-full rounded-t-3xl bg-primary-200 px-5 pt-5"
          style={{ paddingBottom: Math.max(insets.bottom, 16) }}
        >
          <View className="mb-1 flex-row items-start justify-between gap-3">
            <Text className="shrink text-xl font-extrabold text-ink">
              {strings.settings.instagramSheetTitle}
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

          <Text className="text-body text-ink-50">{strings.settings.instagramSheetBody}</Text>

          <View className="mt-4 flex-row items-center rounded-2xl bg-white px-4">
            <Ionicons name="logo-instagram" size={18} color={Colors.black[400]} />
            <Text className="ml-2 text-body font-semibold text-black-400">@</Text>
            <TextInput
              className="flex-1 py-3.5 pl-0.5 text-body text-ink"
              placeholder={strings.settings.instagramPlaceholder}
              placeholderTextColor={Colors.ink[25]}
              value={draft}
              onChangeText={handleChange}
              maxLength={INPUT_MAX_LENGTH}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
              returnKeyType="done"
              onSubmitEditing={() => {
                if (canSave) void save(handle)
              }}
              editable={!busy}
              autoFocus
            />
          </View>

          {showInvalid ? (
            <Text className="mt-2 text-caption text-danger">
              {strings.settings.instagramInvalid}
            </Text>
          ) : null}

          {error ? (
            <Text className="mt-3 text-center text-body text-danger">{error}</Text>
          ) : null}

          <Pressable
            onPress={() => void save(handle)}
            disabled={!canSave}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canSave }}
            className="mt-5 w-full items-center rounded-full py-[15px]"
            style={{ backgroundColor: canSave ? Colors.buttons.orange : Colors.neutral.hint }}
          >
            {busy ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text className="text-body font-bold text-white">
                {strings.settings.instagramSave}
              </Text>
            )}
          </Pressable>

          {currentHandle ? (
            <Pressable
              onPress={() => void save(null)}
              disabled={busy}
              accessibilityRole="button"
              className="mt-1 w-full items-center py-3"
            >
              <Text className="text-body font-semibold text-danger">
                {strings.settings.instagramRemove}
              </Text>
            </Pressable>
          ) : (
            <Pressable onPress={onClose} disabled={busy} className="mt-1 w-full items-center py-3">
              <Text className="text-body font-semibold text-ink-50">{strings.settings.cancel}</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

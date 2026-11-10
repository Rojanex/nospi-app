import { Colors } from '@/assets/constants/Colors'
import { TabScreen } from '@/components/layout/TabScreen'
import { SettingsHeader } from '@/components/settings/SettingsHeader'
import { strings } from '@/constants/strings'
import { deleteAccount } from '@/lib/profiles/account'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'

export default function DeleteAccountScreen() {
  const [confirmText, setConfirmText] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // The word is shown in lower case; any case the user types still counts.
  const confirmed = confirmText.trim().toLowerCase() === strings.settings.deleteConfirmWord
  const disabled = !confirmed || busy

  async function handleDelete() {
    if (disabled) return
    setBusy(true)
    setError(null)
    try {
      await deleteAccount()
    } catch (err) {
      console.error('[delete-account]', err)
      setError(strings.settings.deleteError)
      setBusy(false)
    }
  }

  return (
    <TabScreen>
      <SettingsHeader title={strings.settings.deleteAccount} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 pt-2 pb-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text className="mb-3 text-body font-semibold text-ink">
            {strings.settings.deleteIntro}
          </Text>

          <View className="mb-6 gap-2">
            {strings.settings.deleteBullets.map(item => (
              <View key={item} className="flex-row gap-2">
                <Text className="text-body text-ink-50">•</Text>
                <Text className="flex-1 text-body text-ink-50">{item}</Text>
              </View>
            ))}
          </View>

          <Text className="mb-2 text-caption font-semibold text-black-300">
            {strings.settings.deleteTypeLabel}
          </Text>
          <TextInput
            value={confirmText}
            onChangeText={text => {
              setConfirmText(text)
              setError(null)
            }}
            placeholder={strings.settings.deleteConfirmWord}
            placeholderTextColor={Colors.neutral.hint}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!busy}
            textAlignVertical="center"
            // Fixed height and no lineHeight (text-body adds one): iOS draws TextInput text
            // low when a lineHeight is set, so the typing would sit below the center.
            style={{ fontSize: 15 }}
            className="h-12 rounded-2xl border border-neutral-border bg-white px-4 text-ink"
          />

          {error ? (
            <Text className="mt-3 text-center text-body text-danger">{error}</Text>
          ) : null}

          <Pressable
            onPress={handleDelete}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            className={`mt-6 w-full items-center rounded-full py-[15px] ${disabled ? 'bg-danger/40' : 'bg-danger'}`}
          >
            {busy ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text className="text-body font-bold text-white">
                {strings.settings.deleteButton}
              </Text>
            )}
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </TabScreen>
  )
}

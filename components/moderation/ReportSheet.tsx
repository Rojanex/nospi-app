import { Colors } from '@/assets/constants/Colors'
import { strings } from '@/constants/strings'
import {
  REPORT_REASONS,
  reportContent,
  type ReportReason,
  type ReportTarget,
} from '@/lib/moderation/api'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const DETAILS_MAX = 500
/** How long the "Gracias por avisarnos" bubble stays before the sheet closes itself. */
const SENT_TOAST_MS = 2000

type ReportSheetProps = {
  /** null = closed */
  target: ReportTarget | null
  onClose: () => void
}

/**
 * Reason picker for reporting a user, plan or message.
 * Render it inside the screen or Modal that opens it, so iOS can stack it on top.
 */
export function ReportSheet({ target, onClose }: ReportSheetProps) {
  const insets = useSafeAreaInsets()
  const [reason, setReason] = useState<ReportReason | null>(null)
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    if (!target) return
    setReason(null)
    setDetails('')
    setSubmitting(false)
    setError(null)
    setSent(false)
  }, [target])

  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!sent) return
    const timer = setTimeout(() => onCloseRef.current(), SENT_TOAST_MS)
    return () => clearTimeout(timer)
  }, [sent])

  async function handleSubmit() {
    if (!target || !reason || submitting) return

    setSubmitting(true)
    setError(null)
    try {
      await reportContent(target, reason, details)
      Keyboard.dismiss()
      setSent(true)
    } catch {
      setError(strings.moderation.reportError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      visible={target !== null}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      {sent ? (
        <Pressable
          className="flex-1 items-center justify-end px-6"
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 24 }}
          onPress={onClose}
        >
          <Animated.View
            entering={FadeIn.duration(180)}
            exiting={FadeOut.duration(180)}
            className="flex-row items-center gap-3 rounded-2xl bg-buttons-brown px-4 py-3.5"
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
          >
            <Ionicons name="checkmark-circle" size={22} color={Colors.buttons.orange} />
            <View className="shrink">
              <Text className="text-body font-bold text-white">
                {strings.moderation.reportSentTitle}
              </Text>
            </View>
          </Animated.View>
        </Pressable>
      ) : (
        <KeyboardAvoidingView
          className="flex-1 justify-end bg-black/40"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <Pressable className="absolute inset-0" onPress={onClose} />

          <View
            className="max-h-[85%] w-full rounded-t-3xl bg-primary-200 px-5 pt-5"
            style={{ paddingBottom: Math.max(insets.bottom, 16) }}
          >
            <View className="mb-1 flex-row items-center justify-between">
              <Text className="text-xl font-extrabold text-ink">
                {target ? strings.moderation.reportSheetTitle[target.type] : ''}
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
            <Text className="mb-4 text-body text-ink-50">
              {strings.moderation.reportSheetSubtitle}
            </Text>

            <ScrollView
              className="flex-grow-0"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              <View className="gap-2">
                {REPORT_REASONS.map(option => {
                  const selected = reason === option
                  return (
                    <Pressable
                      key={option}
                      onPress={() => setReason(option)}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      className="flex-row items-center justify-between rounded-2xl bg-white px-4 py-3.5"
                      style={{
                        borderWidth: 1.5,
                        borderColor: selected ? Colors.buttons.orange : 'transparent',
                      }}
                    >
                      <Text className="text-lead font-semibold text-ink">
                        {strings.moderation.reasons[option]}
                      </Text>
                      {selected ? (
                        <Ionicons name="checkmark-circle" size={20} color={Colors.buttons.orange} />
                      ) : null}
                    </Pressable>
                  )
                })}
              </View>

              <TextInput
                className="mt-3 min-h-[80px] rounded-2xl bg-white px-4 py-3 text-body text-ink"
                placeholder={strings.moderation.detailsPlaceholder}
                placeholderTextColor={Colors.ink[25]}
                value={details}
                onChangeText={setDetails}
                maxLength={DETAILS_MAX}
                multiline
                textAlignVertical="top"
              />

              {error ? (
                <Text className="mt-3 text-center text-body text-danger">{error}</Text>
              ) : null}
            </ScrollView>

            <Pressable
              onPress={handleSubmit}
              disabled={!reason || submitting}
              accessibilityRole="button"
              accessibilityState={{ disabled: !reason || submitting }}
              className="mt-4 w-full items-center rounded-full py-[15px]"
              style={{
                backgroundColor: reason ? Colors.buttons.orange : Colors.neutral.hint,
              }}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text className="text-body font-bold text-white">{strings.moderation.submit}</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      )}
    </Modal>
  )
}

import { strings } from '@/constants/strings'
import { Colors } from '@/assets/constants/Colors'
import { OTP_LENGTH, RESEND_COUNTDOWN_IN_SECONDS } from '@/lib/env_reader'
import { supabase } from '@/lib/supabase'
import { Ionicons } from '@expo/vector-icons'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

function formatCountdown(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function Verify() {
  const { phone, mode } = useLocalSearchParams<{ phone: string; mode: string }>()
  const [otp, setOtp] = useState<string[]>(() => Array(OTP_LENGTH).fill(''))
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [secondsLeft, setSecondsLeft] = useState(RESEND_COUNTDOWN_IN_SECONDS)
  const router = useRouter()
  const hiddenInputRef = useRef<TextInput>(null)

  const OTP_FIRST_HALF = OTP_LENGTH / 2
  const filledCount = otp.filter(d => d !== '').length
  const activeBox = Math.min(filledCount, OTP_LENGTH - 1)

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((prev) => (prev <= 0 ? 0 : prev - 1))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  const handleChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, OTP_LENGTH)
    const next = digits.split('').concat(Array(OTP_LENGTH - digits.length).fill(''))
    setOtp(next)
  }

  const handleBoxPress = (i: number) => {
    setOtp(otp.slice(0, i).concat(Array(OTP_LENGTH - i).fill('')))
    hiddenInputRef.current?.focus()
  }

  const handleResend = async () => {
    if (secondsLeft > 0 || resendLoading || !phone) return

    setResendLoading(true)
    setError(null)

    const { error: resendError } = await supabase.auth.signInWithOtp({ phone })

    setResendLoading(false)

    if (resendError) {
      setError(resendError.message)
      return
    }

    setSecondsLeft(RESEND_COUNTDOWN_IN_SECONDS)
    setOtp(Array(OTP_LENGTH).fill(''))
    hiddenInputRef.current?.focus()
  }

  const handleVerifyOTP = async () => {
    const token = otp.join('')

    if (token.length < OTP_LENGTH) {
      setError('Ingresa el código completo')
      return
    }

    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    if (mode === 'signup') {
      router.replace('/(onboarding)/name')
    } else {
      router.replace('/')
    }
  }

  const renderBox = (digit: string, i: number) => (
    <TouchableOpacity key={i} onPress={() => handleBoxPress(i)}>
      <View
        className={`h-14 w-[46px] items-center justify-center rounded-[14px] bg-white ${
          i === activeBox ? 'border-2 border-primary-100' : ''
        }`}
      >
        <Text className="font-extrabold text-2xl text-black-100">{digit}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <KeyboardAvoidingView
      className="screen-root"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <SafeAreaView className="screen-safe">
        <View className="back-bar">
          <TouchableOpacity onPress={router.back}>
            <Ionicons name="chevron-back" size={24} color={Colors.black[400]} />
          </TouchableOpacity>
        </View>

        <View className="auth-content">
          <Text className="auth-title mb-2">{strings.onboarding.verifyTitle}</Text>
          <Text className="auth-subtitle mb-8">
            {strings.onboarding.verifySubtitle} {phone}
          </Text>

          {/* Single hidden input captures all keystrokes */}
          <TextInput
            ref={hiddenInputRef}
            autoFocus
            keyboardType="number-pad"
            textContentType="oneTimeCode"
            autoComplete="sms-otp"
            value={otp.join('')}
            onChangeText={handleChange}
            style={{ position: 'absolute', width: 1, height: 1, opacity: 0 }}
            caretHidden
          />

          <View className="mb-2 flex-row items-center justify-center gap-2.5">
            {otp.slice(0, OTP_FIRST_HALF).map((digit, i) => renderBox(digit, i))}
            <Text className="mx-0.5 text-[22px] font-extrabold leading-[56px] text-neutral-hint">
              -
            </Text>
            {otp.slice(OTP_FIRST_HALF, OTP_LENGTH).map((digit, i) => renderBox(digit, i + OTP_FIRST_HALF))}
          </View>

          <Text className="mb-4 text-center text-[13px] text-neutral-hint">
            {strings.onboarding.verifyExplanation}
          </Text>

          <View className="mb-5 items-center gap-2">
            {secondsLeft > 0 ? (
              <Text className="text-sm text-black-400">
                {strings.onboarding.verifyResendIn} {formatCountdown(secondsLeft)}
              </Text>
            ) : (
              <TouchableOpacity
                onPress={handleResend}
                disabled={resendLoading}
                className={`px-3 py-2 ${resendLoading ? 'opacity-50' : ''}`}
              >
                {resendLoading ? (
                  <ActivityIndicator color={Colors.buttons.orange} size="small" />
                ) : (
                  <Text className="text-[15px] font-semibold text-buttons-orange">
                    {strings.onboarding.verifyResendCode}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            className={`btn-primary mb-4 ${loading ? 'btn-primary--disabled' : ''}`}
            onPress={handleVerifyOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="btn-primary-text">{strings.onboarding.verifyButton}</Text>
            )}
          </TouchableOpacity>

          {error ? <Text className="form-error-text">{error}</Text> : null}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

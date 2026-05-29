import { supabase } from '@/lib/supabase'
import { strings } from '@/constants/strings'
import { Colors } from '@/assets/constants/Colors'
import { useFocusEffect, useRouter } from 'expo-router'
import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import CountryPicker, { CountryCode } from 'react-native-country-picker-modal'
import { SIGN_IN_PHONE_MIN_DIGITS } from '@/lib/env_reader'

export default function SignIn() {
  const [countryCode, setCountryCode] = useState<CountryCode>('CO')
  const [callingCode, setCallingCode] = useState('57')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const hasEnoughDigits = phoneNumber.length >= SIGN_IN_PHONE_MIN_DIGITS

  useFocusEffect(
    useCallback(() => {
      setLoading(false)
      setPhoneNumber('')
      setError(null)
      setResetKey(k => k + 1)
    }, [])
  )

  const handleSendOTP = async () => {
    if (!hasEnoughDigits) {
      setError(strings.onboarding.signInPhoneTooShort)
      return
    }

    setLoading(true)
    setError(null)

    const fullPhone = `+${callingCode}${phoneNumber}`
    const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push({ pathname: '/(auth)/otp-verify', params: { phone: fullPhone } })
  }

  return (
    <KeyboardAvoidingView
      className="screen-root"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="screen-safe">
          <View className="back-bar">
            <TouchableOpacity onPress={router.back}>
              <Ionicons name="chevron-back" size={24} color={Colors.neutral.hint} />
            </TouchableOpacity>
          </View>

          <View className="auth-content">
            <Text className="auth-title mb-5">{strings.onboarding.signInTitle}</Text>

            <Text className="auth-subtitle mb-6">{strings.onboarding.signInSubtitle}</Text>

            <View className="z-[999] mb-10 flex-row gap-4">
              <TouchableOpacity className="z-[999] h-14 flex-row items-center overflow-visible rounded-2xl bg-white px-4">
                <CountryPicker
                  theme={{ flagSizeButton: 23 }}
                  countryCode={countryCode}
                  withFlag
                  withCallingCode
                  withFilter
                  withEmoji
                  onSelect={(country) => {
                    setCountryCode(country.cca2)
                    setCallingCode(country.callingCode[0])
                  }}
                />
                <Text className="ml-2 font-semibold text-base text-black-100">+{callingCode}</Text>
              </TouchableOpacity>

              <TextInput
                className="h-14 flex-1 rounded-2xl bg-white text-[17px] px-5 text-black-100"
                placeholder="300 000 0000"
                placeholderTextColor={Colors.neutral.hint}
                keyboardType="phone-pad"
                textAlignVertical="center"
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text.replace(/\D/g, ''))}
              />
            </View>

            <TouchableOpacity
              key={resetKey}
              className={`btn-primary mb-4 ${!hasEnoughDigits || loading ? 'btn-primary--disabled' : ''}`}
              onPress={handleSendOTP}
              disabled={loading || !hasEnoughDigits}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-primary-text">{strings.onboarding.signInButton}</Text>
              )}
            </TouchableOpacity>
            {error ? <Text className="form-error-text">{error}</Text> : null}
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

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
import { ConsentCheckbox } from '@/components/ui/ConsentCheckbox'
import { markTermsAcceptedPending } from '@/lib/profiles/onboarding'

export default function SignIn() {
  const [countryCode, setCountryCode] = useState<CountryCode>('CO')
  const [callingCode, setCallingCode] = useState('57')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetKey, setResetKey] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const router = useRouter()
  const hasEnoughDigits = phoneNumber.length >= SIGN_IN_PHONE_MIN_DIGITS
  const canSubmit = hasEnoughDigits && termsAccepted

  useFocusEffect(
    useCallback(() => {
      setLoading(false)
      setPhoneNumber('')
      setError(null)
      setResetKey(k => k + 1)
    }, [])
  )

  const handleSendOTP = async () => {
    if (!termsAccepted) return
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

    // Saved to the profile by the root layout once the OTP signs the user in.
    markTermsAcceptedPending()
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

            <View className="z-[999] mb-6 flex-row gap-4">
              <TouchableOpacity className="z-[999] h-14 flex-row items-center overflow-visible rounded-2xl bg-white px-4">
                <CountryPicker
                  theme={{
                    flagSizeButton: 23,
                    backgroundColor: Colors.white,
                    onBackgroundTextColor: Colors.ink.DEFAULT,
                    primaryColor: Colors.neutral.border,
                    primaryColorVariant: Colors.neutral.gray,
                    filterPlaceholderTextColor: Colors.neutral.hint,
                  }}
                  filterProps={{
                    placeholderTextColor: Colors.neutral.hint,
                  }}
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
                <Text className="ml-2 font-semibold text-lead text-black-100">+{callingCode}</Text>
              </TouchableOpacity>

              <TextInput
                className="h-14 flex-1 rounded-2xl bg-white text-title px-5 text-black-100"
                placeholder="300 000 0000"
                placeholderTextColor={Colors.neutral.hint}
                keyboardType="phone-pad"
                textAlignVertical="center"
                value={phoneNumber}
                onChangeText={(text) => setPhoneNumber(text.replace(/\D/g, ''))}
              />
            </View>

            <View className="mb-8">
              <ConsentCheckbox checked={termsAccepted} onChange={setTermsAccepted} />
            </View>

            <TouchableOpacity
              key={`${resetKey}-${canSubmit && !loading}`}
              className={`btn-primary mb-4 ${!canSubmit || loading ? 'btn-primary--disabled' : ''}`}
              onPress={handleSendOTP}
              disabled={loading || !canSubmit}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
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

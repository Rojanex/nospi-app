import { Colors } from "@/assets/constants/Colors";
import { strings } from "@/constants/strings";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import * as Crypto from 'expo-crypto';
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
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
} from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { SafeAreaView } from 'react-native-safe-area-context';

type DocType = 'CC' | 'DNI'

// TODO: call Supabase Edge Function 'verify-rnec' with the hashed document
async function triggerRNECVerification(dni: string): Promise<void> {
  // const { error } = await supabase.functions.invoke('verify-rnec', {
  //   body: { dni }
  // })
}

export default function DniVerify() {
  const [dni, setDni] = useState('')
  const [docType, setDocType] = useState<DocType>('CC')
  const [loading, setLoading] = useState(false)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const progress = useSharedValue(0)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      setKeyboardVisible(true)
      progress.value = withTiming(1, { duration: 400 })
    })
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardVisible(false)
      progress.value = withTiming(0, { duration: 400 })
    })

    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  const largeStyle = useAnimatedStyle(() => ({ opacity: 1 - progress.value }))
  const smallStyle = useAnimatedStyle(() => ({ opacity: progress.value }))

  const handleDocTypeChange = (type: DocType) => {
    setDocType(type)
    setDni('')
    setError(null)
  }

  const handleTextChange = (text: string) => {
    if (docType === 'CC') {
      setDni(text.replace(/\D/g, ''))
    } else {
      setDni(text.replace(/[^a-zA-Z0-9]/g, ''))
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const dniHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, dni.trim())

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('dni_hash', dniHash)
      .maybeSingle()

    if (existing) {
      setError(strings.onboarding.dniErrorAlreadyRegistered)
      setLoading(false)
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError(strings.onboarding.nameError)
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        dni_hash: dniHash,
        dni_type: docType,
        dni_verified: false,
        dni_verified_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    if (docType === 'CC') {
      await triggerRNECVerification(dni.trim())
    }

    setLoading(false)
    router.push('/(onboarding)/selfie' as never)
  }

  const isDisabled = (() => {
    if (loading) return true
    const trimmed = dni.trim()
    if (docType === 'CC') return !/^\d{6,10}$/.test(trimmed)
    return trimmed.length < 2 || trimmed.length > 20
  })()

  return (
    <KeyboardAvoidingView
      className="screen-root"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="screen-safe">

          <View className="back-bar">
            <TouchableOpacity onPress={router.back}>
              <Ionicons name='chevron-back' size={24} color={Colors.neutral.hint} />
            </TouchableOpacity>
          </View>

          <View className='px-[28px] mb-[16px]' style={{ marginTop: 10 }}>
            <View className={`relative ${keyboardVisible ? 'min-h-0' : 'min-h-[220px]'}`}>
              <Text className='auth-title text-[37px]' style={{ zIndex: 1, lineHeight: 60 }}>
                {strings.onboarding.dniTitle}
              </Text>

              <Animated.Image
                source={require('@/assets/images/dni-enter-screen.png')}
                resizeMode='contain'
                style={[{
                  position: 'absolute',
                  right: -65,
                  top: -60,
                  width: 290,
                  height: 390,
                  zIndex: 0,
                }, largeStyle]}
              />
              <Animated.Image
                source={require('@/assets/images/dni-enter-screen.png')}
                resizeMode='contain'
                style={[{
                  position: 'absolute',
                  right: -65,
                  top: -85,
                  width: 200,
                  height: 300,
                  zIndex: 0,
                }, smallStyle]}
              />
            </View>
          </View>

          <View className='px-[28px]' style={{ marginTop: 18 }}>
            <Text className='auth-subtitle mb-[20px]'>
              {strings.onboarding.dniSubtitle}
            </Text>

            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {(['CC', 'DNI'] as DocType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => handleDocTypeChange(type)}
                  activeOpacity={1}
                  style={{
                    flex: 1,
                    height: 40,
                    borderRadius: 22,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: docType === type ? Colors.buttons.orange : 'transparent',
                    borderWidth: 1,
                    borderColor: docType === type ? Colors.buttons.orange : Colors.neutral.hint,
                  }}
                >
                  <Text style={{
                    fontSize: 13,
                    fontWeight: '600',
                    color: docType === type ? '#fff' : Colors.neutral.hint,
                  }}>
                    {type === 'CC' ? strings.onboarding.dniPillCC : strings.onboarding.dniPillInternational}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              key={docType}
              style={{ marginBottom: 16 }}
              className="h-14 w-full rounded-2xl bg-white text-[17px] px-5 text-black-100"
              placeholder={strings.onboarding.dniPlaceholder}
              placeholderTextColor={Colors.neutral.hint}
              keyboardType={docType === 'CC' ? 'numeric' : 'default'}
              maxLength={docType === 'CC' ? 10 : 20}
              onSubmitEditing={handleSubmit}
              value={dni}
              onChangeText={handleTextChange}
            />

            <TouchableOpacity
              className={`btn-primary ${isDisabled ? 'btn-primary--disabled' : ''}`}
              onPress={handleSubmit}
              disabled={isDisabled}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-primary-text">{strings.onboarding.dniContinue}</Text>
              )}
            </TouchableOpacity>

            {error ? (
              <Text className="form-error-text" style={{ marginTop: 8 }}>{error}</Text>
            ) : null}
          </View>

          <View className='mb-5 items-center gap-2'>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/' as never)}
              className='px-3 py-5'
            >
              <Text className='text-sm text-black-400' style={{ textDecorationLine: 'underline' }}>
                {strings.onboarding.dniSkip}
              </Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

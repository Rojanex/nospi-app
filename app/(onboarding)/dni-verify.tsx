import { Colors } from '@/assets/constants/Colors'
import { COLOMBIAN_CITIES, type ColombianCity } from '@/constants/colombianCities'
import { strings } from '@/constants/strings'
import { supabase } from '@/lib/supabase'
import { Ionicons } from '@expo/vector-icons'
import * as Crypto from 'expo-crypto'
import { useRouter } from 'expo-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Keyboard,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

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
  const [error, setError] = useState<string | null>(null)
  const [selectedCity, setSelectedCity] = useState<ColombianCity | null>(null)
  const [cityQuery, setCityQuery] = useState('')
  const [cityFocused, setCityFocused] = useState(false)
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const formY = useRef(0)
  const cityYInForm = useRef(0)
  const liftY = useSharedValue(0)
  const insets = useSafeAreaInsets()
  const router = useRouter()

  const filteredCities = useMemo(() => {
    const q = cityQuery.trim().toLowerCase()
    if (!q) return COLOMBIAN_CITIES
    return COLOMBIAN_CITIES.filter(
      (c) =>
        c.city.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q),
    )
  }, [cityQuery])

  const showCityOptions = cityFocused && cityQuery.trim().length > 0 && !selectedCity

  const visibleAboveKeyboard =
    Dimensions.get('window').height - keyboardHeight - insets.top - 52
  const suggestionsMaxH = Math.max(140, Math.floor(visibleAboveKeyboard - 130))

  const scrollPadBottom = cityFocused
    ? Math.max(keyboardHeight, 0) + 120
    : 40

  const liftedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -liftY.value }],
  }))

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      const kh = e.endCoordinates?.height ?? 0
      if (kh <= 0) return
      setKeyboardHeight(kh)
    })
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setKeyboardHeight(0)
    })
    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  useEffect(() => {
    const shouldLift = cityFocused && keyboardHeight > 0
    const nextY = shouldLift
      ? Math.max(0, formY.current + cityYInForm.current - 8)
      : 0
    liftY.value = withTiming(nextY, { duration: 280 })
  }, [cityFocused, keyboardHeight, showCityOptions])

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

  const handleCityChange = (text: string) => {
    setSelectedCity(null)
    setCityQuery(text)
  }

  const handleCitySelect = (city: ColombianCity) => {
    setSelectedCity(city)
    setCityQuery(`${city.city}, ${city.department}`)
    setCityFocused(false)
    Keyboard.dismiss()
  }

  const handleSubmit = async () => {
    if (!selectedCity) return

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
        home_city: selectedCity.city,
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
    if (!selectedCity) return true
    const trimmed = dni.trim()
    if (docType === 'CC') return !/^\d{6,10}$/.test(trimmed)
    return trimmed.length < 2 || trimmed.length > 20
  })()

  return (
    <View className="screen-root">
      <SafeAreaView className="screen-safe">
      <View className="back-bar">
        <TouchableOpacity onPress={router.back}>
          <Ionicons name="chevron-back" size={24} color={Colors.neutral.hint} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom: scrollPadBottom,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={false}
        contentInsetAdjustmentBehavior="never"
        scrollEnabled={!cityFocused}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={liftedStyle}>
        <View className="px-[28px] mb-[16px]" style={{ marginTop: 10 }}>
          <View className="relative min-h-[220px]">
            <Text className="auth-title text-[37px]" style={{ zIndex: 1, lineHeight: 60 }}>
              {strings.onboarding.dniTitle}
            </Text>

            <Image
              source={require('@/assets/images/dni-enter-screen.png')}
              resizeMode="contain"
              style={{
                position: 'absolute',
                right: -65,
                top: -60,
                width: 290,
                height: 390,
                zIndex: 0,
              }}
            />
          </View>
        </View>

        <View
          className="px-[28px]"
          style={{ marginTop: 30 }}
          onLayout={(e) => {
            formY.current = e.nativeEvent.layout.y
          }}
        >
          <Text className="auth-subtitle mb-[20px]">
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
            style={{ marginBottom: 25 }}
            className="h-14 w-full rounded-2xl bg-white text-[17px] px-5 text-black-100"
            placeholder={strings.onboarding.dniPlaceholder}
            placeholderTextColor={Colors.neutral.hint}
            keyboardType={docType === 'CC' ? 'numeric' : 'default'}
            maxLength={docType === 'CC' ? 10 : 20}
            onSubmitEditing={handleSubmit}
            value={dni}
            onChangeText={handleTextChange}
          />

          <View
            onLayout={(e) => {
              cityYInForm.current = e.nativeEvent.layout.y
            }}
          >
            <Text className="auth-subtitle mb-[12px]">
              {strings.onboarding.dniCityTitle}
            </Text>

            <TextInput
              className="h-14 w-full rounded-2xl bg-white text-[17px] px-5 text-black-100"
              style={{ marginBottom: showCityOptions ? 8 : 16 }}
              placeholder={strings.onboarding.dniCityPlaceholder}
              placeholderTextColor={Colors.neutral.hint}
              value={cityQuery}
              onChangeText={handleCityChange}
              onFocus={() => setCityFocused(true)}
              onBlur={() => {
                setTimeout(() => setCityFocused(false), 150)
              }}
              autoCorrect={false}
              autoCapitalize="none"
            />

            {showCityOptions ? (
              <View
                className="rounded-2xl bg-white mb-4 overflow-hidden"
                style={{ maxHeight: suggestionsMaxH }}
              >
                <ScrollView
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                  style={{ maxHeight: suggestionsMaxH }}
                >
                  {filteredCities.map((c) => (
                    <TouchableOpacity
                      key={`${c.city}-${c.department}`}
                      onPress={() => handleCitySelect(c)}
                      className="px-5 py-3 w-full"
                      activeOpacity={0.7}
                    >
                      <Text className="text-[15px] text-black-100">
                        {c.city}, {c.department}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            ) : null}
          </View>

          <TouchableOpacity
            key={isDisabled ? 'continuar-disabled' : 'continuar-enabled'}
            className={`btn-primary ${isDisabled ? 'btn-primary--disabled' : ''}`}
            onPress={handleSubmit}
            disabled={isDisabled}
          >
            {loading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text className="btn-primary-text">{strings.onboarding.dniContinue}</Text>
            )}
          </TouchableOpacity>

          {error ? (
            <Text className="form-error-text" style={{ marginTop: 8 }}>{error}</Text>
          ) : null}
        </View>

        <View className="mb-5 items-center gap-2 mt-auto">
          <TouchableOpacity
            onPress={() => router.push('/(tabs)/' as never)}
            className="px-3 py-5"
          >
            <Text className="text-sm text-black-400" style={{ textDecorationLine: 'underline' }}>
              {strings.onboarding.dniSkip}
            </Text>
          </TouchableOpacity>
        </View>
        </Animated.View>
      </ScrollView>
      </SafeAreaView>
    </View>
  )
}

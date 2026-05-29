import { supabase } from '@/lib/supabase'
import { strings } from '@/constants/strings'
import { Colors } from '@/assets/constants/Colors'
import { useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
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
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Name() {
  const [name, setName] = useState('')
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

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)

    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      setError(strings.onboarding.nameError)
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ display_name: name.trim() })
      .eq('id', data.user.id)

    if (updateError) {
      console.log(updateError)
      setError(updateError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    router.push('/(onboarding)/dni-verify')
  }

  const isDisabled = name.trim().length < 2 || loading

  return (
    <KeyboardAvoidingView
      className="screen-root"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView className="screen-safe">

          <View className='px-[28px] mb-[16px]' style={{ marginTop: 60 }}>
            <View className={`relative ${keyboardVisible ? 'min-h-0' : 'min-h-[220px]'} `}>
              <Text className='auth-title' style={{ zIndex: 1, lineHeight: 60 }}>
                {strings.onboarding.nameTitle}
              </Text>

              <Animated.Image
                source={require('@/assets/images/name-typing-screen.png')}
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
                source={require('@/assets/images/name-typing-screen.png')}
                resizeMode='contain'
                style={[{
                  position: 'absolute',
                  right: -65,
                  top: -60,
                  width: 200,
                  height: 300,
                  zIndex: 0,
                }, smallStyle]}
              />

            </View>
          </View>


          {/* Form sticks to top */}
          <View className='px-[28px]' style={{ marginTop: 50 }}>
            <Text className="auth-subtitle mb-[20px]">
              {strings.onboarding.nameSubtitle}
            </Text>

            <TextInput
              style={{ marginBottom: 16 }}
              className="h-14 w-full rounded-2xl bg-white text-[17px] px-5 text-black-100"
              placeholder={strings.onboarding.namePlaceholder}
              placeholderTextColor={Colors.neutral.hint}
              maxLength={30}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              value={name}
              onChangeText={setName}
            />

            <TouchableOpacity
              className={`btn-primary mt-2 ${isDisabled ? 'btn-primary--disabled' : ''}`}
              onPress={handleSubmit}
              disabled={isDisabled}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text className="btn-primary-text">{strings.onboarding.nameButton}</Text>
              )}
            </TouchableOpacity>

            {error ? <Text className="form-error-text" style={{ marginTop: 8 }}>{error}</Text> : null}
          </View>
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  )
}

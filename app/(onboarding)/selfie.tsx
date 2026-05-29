import { strings } from '@/constants/strings'
import { useRouter } from 'expo-router'
import { Ionicons } from "@expo/vector-icons";
import { Colors } from '@/assets/constants/Colors'
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useState } from 'react'

export default function Selfie() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = async () => {
    router.push('/(onboarding)/livessness' as never) //TODO - go to liveness SDK
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
              <Ionicons name='chevron-back' size={24} color={Colors.neutral.hint} />
            </TouchableOpacity>
          </View>

          <View className='px-[28px] mb-[16px]' style={{ marginTop: 40 }}>
            <View className={`relative min-h-[220px]`}>
              <Text className='auth-title text-[37px]' style={{ zIndex: 1, lineHeight: 60 }}>
                {strings.onboarding.livenessTitle}
              </Text>

              <Image
                source={require('@/assets/images/liveness-check-screen.png')}
                resizeMode='contain'
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


          {/* Form sticks to top */}
          <View className='px-[28px]' style={{ marginTop: 80 }}>
            <Text className="auth-subtitle mb-[20px]">
              {strings.onboarding.livenessSubtitle}
            </Text>

            <TouchableOpacity
              className={`btn-primary mt-[10px]`}
              onPress={handleSubmit}
            >
              <Text className="btn-primary-text">{strings.onboarding.livenessButton}</Text>
            </TouchableOpacity>

            {error ? <Text className="form-error-text" style={{ marginTop: 8 }}>{error}</Text> : null}
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

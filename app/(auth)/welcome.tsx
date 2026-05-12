import { useRouter } from 'expo-router'
import { ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { strings } from '@/constants/strings'
import { Colors } from '@/assets/constants/Colors'

export default function Welcome() {
  const router = useRouter()

  return (
    <SafeAreaView className="screen-root">
      <ImageBackground
        source={require('@/assets/images/welcome-cover.png')}
        style={styles.bg}
        imageStyle={styles.bgImage}
        resizeMode="cover"
      >
        <View style={styles.top}>
          <Text style={styles.label}>NOSPI CLUB</Text>
          <View style={styles.titleWrap}>
            <Text style={[styles.title, styles.titleGlowStrong]}>
              {'¿Y si nos pillamos\nhoy?'}
            </Text>
            <Text style={[styles.title, styles.titleGlowSoft]}>
              {'¿Y si nos pillamos\nhoy?'}
            </Text>
            <Text style={styles.title}>{'¿Y si nos pillamos\nhoy?'}</Text>
          </View>
        </View>

        <View className="gap-3 px-6 pb-12">
          <TouchableOpacity
            className="btn-primary mb-6"
            onPress={() => router.push({ pathname: '/(auth)/sign-in', params: { mode: 'signup' } })}
          >
            <Text className="btn-primary-text">{strings.onboarding.welcomeSignUp}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="btn-secondary"
            onPress={() => router.push({ pathname: '/(auth)/sign-in', params: { mode: 'signin' } })}
          >
            <Text className="btn-primary-text">{strings.onboarding.welcomeSignIn}</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'space-between',
  },
  bgImage: {
    transform: [{ translateY: 60 }],
  },
  top: { paddingTop: 245, paddingHorizontal: 28 },
  titleWrap: { position: 'relative' },
  titleGlowStrong: {
    position: 'absolute',
    left: 0,
    top: 0,
    color: Colors.black[100],
    textShadowColor: 'rgba(255,255,255,0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  titleGlowSoft: {
    position: 'absolute',
    left: 0,
    top: 0,
    color: Colors.black[100],
    textShadowColor: 'rgba(255,255,255,0.6)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
  },
  label: {
    color: Colors.buttons.orange,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  title: {
    color: Colors.black[100],
    fontSize: 38,
    fontWeight: '800',
    lineHeight: 44,
  },
})

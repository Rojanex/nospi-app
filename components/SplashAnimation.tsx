import LottieView from 'lottie-react-native'
import { StyleSheet, View } from 'react-native'
import { Colors } from '@/assets/constants/Colors'

interface SplashAnimationProps {
  onFinish: () => void
}

export default function SplashAnimation({ onFinish }: SplashAnimationProps) {
  return (
    <View style={styles.container}>
      <LottieView
        source={require('@/assets/animations/splash-logo.json')}
        autoPlay
        loop={false}
        onAnimationFinish={onFinish}
        style={styles.animation}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    width: 200,
    height: 200,
  },
})

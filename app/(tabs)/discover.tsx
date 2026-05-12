import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Discover() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-primary-300">
      <View className="px-4 pt-6 flex-1">
        <Text className="text-black-100 font-bold text-3xl mb-1">Discover</Text>
        <Text className="text-black-300 text-sm mb-6">
          Find what's around you
        </Text>

        {/* TODO: main discover/search content */}
      </View>
    </SafeAreaView>
  )
}

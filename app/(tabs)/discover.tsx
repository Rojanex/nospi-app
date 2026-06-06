import { Text, View } from 'react-native'
import { TabScreen } from '@/components/layout/TabScreen'

export default function Discover() {
  return (
    <TabScreen>
      <View className="px-5 pt-6 flex-1">
        <Text className="tab-section-title mb-1">Discover</Text>
        <Text className="tab-section-subtitle mb-6">
          Find what's around you
        </Text>

        {/* TODO: main discover/search content */}
      </View>
    </TabScreen>
  )
}

import { TabScreen } from '@/components/layout/TabScreen'
import { strings } from '@/constants/strings'
import { Text, View } from 'react-native'

export default function LosMios() {
  return (
    <TabScreen>
      <View className="px-5 pt-6 flex-1">
        <Text className="tab-section-title mb-1">{strings.losMios.losMiosTitle}</Text>
        <Text className="tab-section-subtitle mb-6">
          {strings.losMios.losMiosSubtitle}
        </Text>

        {/* TODO: user's plans list */}
      </View>
    </TabScreen>
  )
}

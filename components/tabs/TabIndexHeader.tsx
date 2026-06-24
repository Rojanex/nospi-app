import { Colors } from '@/assets/constants/Colors'
import { NospiHorizontalLogo } from '@/assets/icons'
import { Ionicons } from '@expo/vector-icons'
import { TouchableOpacity, View } from 'react-native'


export function TabIndexHeader() {
  return (
    <View className="tab-header">
      <NospiHorizontalLogo height={28} />
      <View className="tab-header-actions">
        <TouchableOpacity className="tab-icon-btn">
          <Ionicons name="search-outline" size={22} color={Colors.black[300]} />
        </TouchableOpacity>
        <TouchableOpacity className="tab-icon-btn">
          <View>
            <Ionicons name="notifications-outline" size={22} color={Colors.black[300]} />
            <View className="tab-notif-dot" /> 
            {/* TODO -  make notifications actually work? does this dot need a css class ? */}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

import { Text, TouchableOpacity, View } from 'react-native'
import { supabase } from '@/lib/supabase'
import { TabScreen } from '@/components/layout/TabScreen'

export default function Profile() {
  return (
    <TabScreen>
      <View className="px-5 pt-6 flex-1">
        <Text className="tab-section-title mb-1">Profile</Text>

        {/* TODO: user avatar, display name, stats */}

        <TouchableOpacity
          onPress={() => supabase.auth.signOut()}
          className="mt-2 bg-danger rounded-xl py-4 items-center"
        >
          <Text className="text-white font-bold text-base">Log out</Text>
        </TouchableOpacity>
      </View>
    </TabScreen>
  )
}

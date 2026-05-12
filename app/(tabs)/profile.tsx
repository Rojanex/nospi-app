import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'

export default function Profile() {
  return (
    <SafeAreaView edges={['top']} className="flex-1 bg-primary-300">
      <View className="px-4 pt-6 flex-1">
        <Text className="text-black-100 font-bold text-3xl mb-1">Profile</Text>

        {/* TODO: user avatar, display name, stats */}

        <TouchableOpacity
          onPress={() => supabase.auth.signOut()}
          className="mt-6 bg-danger rounded-xl py-4 items-center"
        >
          <Text className="text-white font-bold text-base">Log out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

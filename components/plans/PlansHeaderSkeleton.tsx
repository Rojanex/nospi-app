import { TabIndexHeader } from '@/components/tabs/TabIndexHeader'
import { Skeleton } from '@/components/ui/Skeleton'
import { View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export function PlansHeaderSkeleton() {
  const insets = useSafeAreaInsets()

  return (
    <View>
      <View style={{ paddingTop: insets.top + 12 }}>
        <TabIndexHeader />
      </View>

      <View className="mx-4 mb-5 rounded-[18px] bg-white p-4">
        <View className="flex-row items-center gap-3">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-full max-w-[220px]" />
          </View>
          <Skeleton className="h-9 w-9 rounded-full" />
        </View>
      </View>

      <View className="px-5 mb-2">
        <Skeleton className="h-6 w-40" />
      </View>

      <View className="mb-4 flex-row gap-2 px-5">
        <Skeleton className="h-9 w-16 rounded-full" />
        <Skeleton className="h-9 w-14 rounded-full" />
        <Skeleton className="h-9 w-20 rounded-full" />
        <Skeleton className="h-9 w-16 rounded-full" />
      </View>
    </View>
  )
}

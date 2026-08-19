import { Skeleton } from '@/components/ui/Skeleton'
import { useEffect } from 'react'
import { View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated'

type PlanCardSkeletonProps = {
  pulse?: boolean
}

export function PlanCardSkeleton({ pulse = false }: PlanCardSkeletonProps) {
  const opacity = useSharedValue(1)

  useEffect(() => {
    if (!pulse) {
      opacity.value = 1
      return
    }
    opacity.value = withRepeat(withTiming(0.5, { duration: 800 }), -1, true)
  }, [opacity, pulse])

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  return (
    <Animated.View
      style={pulse ? pulseStyle : undefined}
      className="mx-4 mb-3 flex-row overflow-hidden rounded-[18px] bg-white"
    >
      <Skeleton className="w-[3px] self-stretch rounded-none" />
      <View className="flex-1 p-3.5">
        <View className="flex-row gap-2.5">
          <Skeleton className="h-11 w-11 rounded-xl" />
          <View className="flex-1 gap-2">
            <Skeleton className="h-2.5 w-24" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-40" />
          </View>
        </View>
        <View className="my-3 border-b border-dashed border-primary-200" />
        <View className="flex-row items-start justify-between">
          <View className="gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </View>
          <View className="items-end gap-2">
            <View className="flex-row">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="-ml-1.5 h-6 w-6 rounded-full" />
              <Skeleton className="-ml-1.5 h-6 w-6 rounded-full" />
            </View>
            <Skeleton className="h-9 w-20 rounded-full" />
          </View>
        </View>
      </View>
    </Animated.View>
  )
}

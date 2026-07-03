import { View } from 'react-native'

type SkeletonProps = {
  className?: string
}

export function Skeleton({ className = '' }: SkeletonProps) {
  return <View className={`rounded-lg bg-primary-200 ${className}`} />
}

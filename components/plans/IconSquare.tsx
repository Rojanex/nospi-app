import React from 'react'
import { View } from 'react-native'

type IconSquareProps = {
  className?: string
  children: React.ReactNode
}

export function IconSquare({ className, children }: IconSquareProps) {
  return (
    <View
      className={`h-9 w-9 items-center justify-center rounded-[10px] ${className ?? ''}`}
    >
      {children}
    </View>
  )
}

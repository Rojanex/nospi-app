import React from 'react'
import { View } from 'react-native'

type IconSquareProps = {
  className?: string
  children: React.ReactNode
}

export function IconSquare({ className, children }: IconSquareProps) {
  return (
    <View
      className={`h-[30px] w-[30px] items-center justify-center rounded-[9px] ${className ?? ''}`}
    >
      {children}
    </View>
  )
}

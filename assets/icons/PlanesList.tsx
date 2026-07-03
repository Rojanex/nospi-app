import React from 'react'
import Svg, { Path, Rect } from 'react-native-svg'

type IconProps = {
  size?: number
  color?: string
}

export const PlanesList = ({ size = 24, color = '#666876' }: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="4"
        stroke={color}
        strokeWidth="1.5"
      />
      <Path
        d="M8 10h8M8 14h5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </Svg>
  )
}

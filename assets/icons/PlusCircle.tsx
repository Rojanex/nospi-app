import React from 'react'
import Svg, { Circle, Path } from 'react-native-svg'

type IconProps = {
  size?: number
  color?: string
}

export const PlusCircle = ({ size = 24, color = '#ED862F' }: IconProps) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} />
      <Path
        d="M12 8v8M8 12h8"
        stroke="#FFFFFF"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </Svg>
  )
}

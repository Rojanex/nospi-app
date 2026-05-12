import React from 'react'
import Svg, { Path } from 'react-native-svg'

type IconProps = {
    size?: number
    color?: string
}

export const Explore = ({ size = 24, color = '#F2AD78' }: IconProps) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <Path
                d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"
                stroke={color}
                strokeWidth="1.5"
                strokeLinejoin="round"
            />
        </Svg>
    )
}

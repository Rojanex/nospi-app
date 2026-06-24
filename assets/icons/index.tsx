import { Colors } from '@/assets/constants/Colors';
import React from "react";
import { Explore } from './Explore';
import { Home } from './Home';
import { Profile } from './Profile';

export { Explore } from './Explore';
export { Home } from './Home';
export { default as NospiHorizontalLogo } from './NospiHorizontalLogo';
export { Profile } from './Profile';


export type IconProps = {
    size?: number;
    color?: string;
}

export type IconName =
    | 'home'
    | 'profile'
    | 'explore';


export const IconMap: Record<IconName, React.ComponentType<IconProps>> = {
    home: Home,
    profile: Profile,
    explore: Explore,
} as const;


export const Icon = ({
    name,
    size = 24,
    color = Colors.primary[300]
}: {
    name: IconName;
    size?: number;
    color?: string;
}) => {
    const IconComponent = IconMap[name] as React.ComponentType<IconProps>;
    return <IconComponent size={size} color={color} />;
};


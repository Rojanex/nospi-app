import { Colors } from '@/assets/constants/Colors';
import React from "react";
import { HatCowboySide } from './HatCowboySide';
import { Home } from './Home';
import { PlanesList } from './PlanesList';
import { PlusCircle } from './PlusCircle';
import { Profile } from './Profile';

export { HatCowboySide } from './HatCowboySide';
export { Home } from './Home';
export { PlanesList } from './PlanesList';
export { PlusCircle } from './PlusCircle';
export { default as NospiHorizontalLogo } from './NospiHorizontalLogo';
export { Profile } from './Profile';


export type IconProps = {
    size?: number;
    color?: string;
}

export type IconName =
    | 'home'
    | 'profile'
    | 'plusCircle'
    | 'planesList'
    | 'hatCowboySide';


export const IconMap: Record<IconName, React.ComponentType<IconProps>> = {
    home: Home,
    profile: Profile,
    plusCircle: PlusCircle,
    planesList: PlanesList,
    hatCowboySide: HatCowboySide,
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


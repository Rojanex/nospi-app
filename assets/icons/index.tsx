import React from "react";

export {Home} from './Home';


export type IconProps = {
    size?: number;
    color?: string;
}

export type IconName =
    | 'home';


import { Home } from './Home';


export const IconMap: Record<IconName, React.ComponentType<IconProps>> = {
    home: Home,
} as const;


export const Icon = ({
    name,
    size= 24,
    color = "#F2AD78"
}: {
    name: IconName;
    size?: number;
    color?: string;
}) => {
    const IconComponent = IconMap[name] as React.ComponentType<IconProps>;
    return <IconComponent size={size} color={color} ></IconComponent>;
};
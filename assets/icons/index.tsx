import React from "react";
import {Home} from './Home';
import {Profile} from './Profile';
import {Explore} from './Explore';

export {Home} from './Home';
export {Profile} from './Profile';
export {Explore} from './Explore';

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
                         color = "#F2AD78"
                     }: {
    name: IconName;
    size?: number;
    color?: string;
}) => {
    const IconComponent = IconMap[name] as React.ComponentType<IconProps>;
    return <IconComponent size={size} color={color}/>;
};
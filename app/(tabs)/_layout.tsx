import React from 'react'
import {Tabs} from "expo-router";
import {Icon} from "@/assets/icons";
import {Colors} from "@/assets/constants/Colors";

const _Layout = () => {
    return (
        <Tabs
            screenOptions={{
                tabBarActiveTintColor: Colors.primary[100],
                tabBarInactiveTintColor: Colors.black[200],
                tabBarShowLabel: false,
                tabBarStyle: {
                    paddingBottom: 5,
                    paddingTop: 15,
                }
            }}>
            <Tabs.Screen
                name={"index"}
                options={{
                    title: "Home",
                    headerShown: false,
                    tabBarIcon: ({color, size}) => (
                        <Icon name="home" size={size} color={color} />
                    )
                }}/>
            <Tabs.Screen
                name={"discover"}
                options={{
                    title: "Discover",
                    headerShown: false,
                    tabBarIcon: ({color, size}) => (
                        <Icon name="explore" size={size} color={color} />
                    )
                }}/>
            <Tabs.Screen
                name={"profile"}
                options={{
                    title: "Profile",
                    headerShown: false,
                    tabBarIcon: ({color, size}) => (
                        <Icon name="profile" size={size} color={color} />
                    )
                }}/>
        </Tabs>
    )
}
export default _Layout

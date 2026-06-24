import { Colors } from "@/assets/constants/Colors";
import { Icon } from "@/assets/icons";
import { Tabs } from "expo-router";
import React from 'react';

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
                    title: "Planes",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="home" size={size} color={color} />
                    )
                }} />
            <Tabs.Screen
                name={"discover"}
                options={{
                    title: "Discover",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="explore" size={size} color={color} />
                    )
                }} />
            <Tabs.Screen
                name={"profile"}
                options={{
                    title: "Profile",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="profile" size={size} color={color} />
                    )
                }} />
        </Tabs>
    )
}
export default _Layout

import { Colors } from "@/assets/constants/Colors";
import { Icon } from "@/assets/icons";
import { NewPlanSheet } from "@/components/plans/NewPlanSheet";
import { Tabs } from "expo-router";
import React, { useState } from 'react';
import { Dimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

const SCREEN_HEIGHT = Dimensions.get('window').height

const _Layout = () => {
    const [showNewPlanSheet, setShowNewPlanSheet] = useState(false)
    const translateY = useSharedValue(SCREEN_HEIGHT)
    const overlayOpacity = useSharedValue(0)

    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }))

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }))

    const openSheet = () => {
        setShowNewPlanSheet(true)
        translateY.value = withSpring(0, { stiffness: 300 })
        overlayOpacity.value = withTiming(1, { duration: 240 })
    }

    const closeSheet = () => {
        translateY.value = withTiming(SCREEN_HEIGHT, {
            duration: 280,
            easing: Easing.out(Easing.cubic),
        }, (finished) => {
            if (finished) scheduleOnRN(setShowNewPlanSheet, false)
        })
        overlayOpacity.value = withTiming(0, { duration: 280 })
    }

    const swipeDown = Gesture.Pan()
        .activeOffsetY(8)
        .onUpdate((e) => {
            if (e.translationY > 0) {
                translateY.value = e.translationY
            }
        })
        .onEnd((e) => {
            if (e.translationY > 120 || e.velocityY > 800) {
                scheduleOnRN(closeSheet)
            } else {
                translateY.value = withSpring(0, { stiffness: 200 })
            }
        })

    return (
        <>
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
                name={"new-plan"}
                listeners={{
                    tabPress: (e) => {
                        e.preventDefault()
                        openSheet()
                    }
                }}
                options={{
                    title: "New Plan",
                    headerShown: false,
                    tabBarIcon: ({ color, size, focused }) => (
                        <Icon
                            name="plusCircle"
                            size={size}
                            color={focused ? Colors.buttons.orange : color}
                        />
                    )
                }} />
            <Tabs.Screen
                name={"los-mios"}
                options={{
                    title: "Los míos",
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Icon name="planesList" size={size} color={color} />
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
        {showNewPlanSheet && (
            <GestureHandlerRootView className="absolute inset-0">
                <Animated.View
                    className="flex-1 bg-black/40 justify-end"
                    style={overlayStyle}
                >
                    <Animated.View
                        className="bg-primary-200 rounded-t-3xl h-[92%] w-full pt-3"
                        style={sheetStyle}
                    >
                        <GestureDetector gesture={swipeDown}>
                            <View className="w-full items-center py-5 mb-1">
                                <View className="w-9 h-1 rounded-sm bg-neutral-hint" />
                            </View>
                        </GestureDetector>
                        <NewPlanSheet onClose={closeSheet} />
                    </Animated.View>
                </Animated.View>
            </GestureHandlerRootView>
        )}
        </>
    )
}
export default _Layout

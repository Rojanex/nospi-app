import { Colors } from '@/assets/constants/Colors'
import { Icon } from '@/assets/icons'
import { NewPlanSheet } from '@/components/plans/NewPlanSheet'
import { strings } from '@/constants/strings'
import { Tabs } from 'expo-router'
import React, { useMemo, useState } from 'react'
import { Dimensions, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

const SCREEN_HEIGHT = Dimensions.get('window').height
const SCROLL_TOP_EPSILON = 1
const DISMISS_PULL_THRESHOLD = 8

const _Layout = () => {
  const [showNewPlanSheet, setShowNewPlanSheet] = useState(false)
  const translateY = useSharedValue(SCREEN_HEIGHT)
  const overlayOpacity = useSharedValue(0)
  const scrollOffset = useSharedValue(0)
  const touchStartY = useSharedValue(0)

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }))

  const openSheet = () => {
    scrollOffset.value = 0
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

  const nativeScrollGesture = useMemo(() => Gesture.Native(), [])

  // Claim dismiss only when scroll is at top and the user pulls down;
  // otherwise fail so the ScrollView can scroll normally.
  const swipeDown = useMemo(
    () =>
      Gesture.Pan()
        .manualActivation(true)
        .simultaneousWithExternalGesture(nativeScrollGesture)
        .onTouchesDown((e) => {
          touchStartY.value = e.allTouches[0]?.absoluteY ?? 0
        })
        .onTouchesMove((e, state) => {
          // Off-top content is always a scroll gesture, never a dismiss gesture.
          if (scrollOffset.value > SCROLL_TOP_EPSILON) {
            state.fail()
            return
          }

          const y = e.allTouches[0]?.absoluteY ?? touchStartY.value
          const dy = y - touchStartY.value

          // Don't fail on a brief upward jitter (normal at the start of a fast
          // downward flick) — just keep waiting instead of permanently failing.
          if (dy > DISMISS_PULL_THRESHOLD) {
            state.activate()
          }
        })
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
        }),
    [nativeScrollGesture],
  )

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
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: strings.tabs.plans,
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="home" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="new-plan"
          listeners={{
            tabPress: (e) => {
              e.preventDefault()
              openSheet()
            },
          }}
          options={{
            title: strings.tabs.newPlan,
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) => (
              <Icon
                name="plusCircle"
                size={size}
                color={focused ? Colors.buttons.orange : color}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="chats"
          options={{
            title: strings.tabs.chats,
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="planesList" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: strings.tabs.profile,
            headerShown: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="profile" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
      {showNewPlanSheet && (
        <Animated.View
          className="absolute inset-0 flex-1 bg-black/40 justify-end"
          style={overlayStyle}
        >
          <GestureDetector gesture={swipeDown}>
            <Animated.View
              className="bg-primary-200 rounded-t-3xl h-[92%] w-full pt-3"
              style={sheetStyle}
            >
              <View className="mb-0 w-full items-center py-2.5">
                <View className="h-1 w-9 rounded-sm bg-neutral-hint" />
              </View>
              <NewPlanSheet
                onClose={closeSheet}
                scrollOffset={scrollOffset}
                nativeScrollGesture={nativeScrollGesture}
              />
            </Animated.View>
          </GestureDetector>
        </Animated.View>
      )}
    </>
  )
}
export default _Layout

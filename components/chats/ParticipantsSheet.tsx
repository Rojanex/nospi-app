import { Colors } from '@/assets/constants/Colors'
import { ActivityFingerprint } from '@/components/profile/ActivityFingerprint'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { isPlanActive } from '@/constants/planStatus'
import { strings } from '@/constants/strings'
import { fetchPublicProfile, type PublicProfile } from '@/lib/profiles/api'
import { ChatListItem, Participant } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

const SCREEN_HEIGHT = Dimensions.get('window').height

type ParticipantsSheetProps = {
  visible: boolean
  onClose: () => void
  chat: ChatListItem
  participants: Participant[]
  onRemoveMember: (id: string) => void
  onLeave: () => void
  onDeletePlan: () => void
}

export function ParticipantsSheet({
  visible,
  onClose,
  chat,
  participants,
  onRemoveMember,
  onLeave,
  onDeletePlan,
}: ParticipantsSheetProps) {
  const [viewMode, setViewMode] = useState<'list' | 'profile'>('list')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [publicProfile, setPublicProfile] = useState<PublicProfile | null>(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [expandedRemoveId, setExpandedRemoveId] = useState<string | null>(null)
  const translateY = useSharedValue(SCREEN_HEIGHT)
  const overlayOpacity = useSharedValue(0)

  const canManage = isPlanActive(chat.status)
  const selfParticipant = participants.find(p => p.isSelf)
  const isHostViewing = selfParticipant?.role === 'host'
  const isHostAlone =
    canManage && isHostViewing && !!selfParticipant && participants.length === 1
  const showLeaveButton = canManage && !!selfParticipant && !isHostAlone
  const showDeleteButton = isHostAlone

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }))

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }))

  useEffect(() => {
    if (!visible) return

    Keyboard.dismiss()
    setViewMode('list')
    setExpandedRemoveId(null)
    translateY.value = SCREEN_HEIGHT
    overlayOpacity.value = 0
    translateY.value = withSpring(0, { stiffness: 300 })
    overlayOpacity.value = withTiming(1, { duration: 240 })
  }, [visible, translateY, overlayOpacity])

  useEffect(() => {
    if (viewMode !== 'profile' || !selectedUserId) return

    if (publicProfile?.id === selectedUserId) {
      setProfileLoading(false)
      setProfileError(null)
      return
    }

    let cancelled = false
    setProfileLoading(true)
    setProfileError(null)

    fetchPublicProfile(selectedUserId)
      .then(data => {
        if (!cancelled) setPublicProfile(data)
      })
      .catch(err => {
        console.error('[participants-sheet] profile', err)
        if (!cancelled) setProfileError(strings.profile.publicLoadError)
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [viewMode, selectedUserId, publicProfile?.id])

  function closeSheet() {
    Keyboard.dismiss()
    translateY.value = withTiming(
      SCREEN_HEIGHT,
      {
        duration: 280,
        easing: Easing.out(Easing.cubic),
      },
      finished => {
        if (finished) scheduleOnRN(onClose)
      },
    )
    overlayOpacity.value = withTiming(0, { duration: 280 })
  }

  const swipeDown = Gesture.Pan()
    .activeOffsetY(8)
    .onUpdate(e => {
      if (e.translationY > 0) {
        translateY.value = e.translationY
      }
    })
    .onEnd(e => {
      if (e.translationY > 120 || e.velocityY > 800) {
        scheduleOnRN(closeSheet)
      } else {
        translateY.value = withSpring(0, { stiffness: 200 })
      }
    })

  function goBackToList() {
    setViewMode('list')
  }

  const swipeBack = Gesture.Pan()
    .activeOffsetX(24)
    .failOffsetY([-18, 18])
    .onEnd(e => {
      if (e.translationX > 72 || e.velocityX > 450) {
        scheduleOnRN(goBackToList)
      }
    })

  function confirmRemove(participant: Participant) {
    Alert.alert(strings.losMios.removeMemberConfirmTitle(participant.name), undefined, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: strings.losMios.removeMemberAction,
        style: 'destructive',
        onPress: () => {
          setExpandedRemoveId(null)
          onRemoveMember(participant.id)
        },
      },
    ])
  }

  function confirmLeave() {
    Alert.alert(strings.losMios.leaveConfirmTitle, undefined, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: strings.losMios.secondLeaveAction,
        style: 'destructive',
        onPress: onLeave,
      },
    ])
  }

  function confirmDeletePlan() {
    Alert.alert(strings.losMios.deletePlanConfirmTitle, undefined, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: strings.losMios.deletePlanAction,
        style: 'destructive',
        onPress: onDeletePlan,
      },
    ])
  }

  function handleParticipantPress(participant: Participant) {
    if (expandedRemoveId === participant.id) {
      setExpandedRemoveId(null)
      return
    }

    setSelectedUserId(participant.id)
    setViewMode('profile')
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={closeSheet}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Animated.View className="flex-1 justify-end bg-black/40" style={overlayStyle}>
          <Pressable className="absolute inset-0" onPress={closeSheet} />
          <Animated.View
            className="max-h-[80%] w-full rounded-t-3xl bg-primary-200 pt-3"
            style={sheetStyle}
          >
            {viewMode === 'list' ? (
              <Pressable onPress={() => setExpandedRemoveId(null)}>
                <GestureDetector gesture={swipeDown}>
                  <View className="mb-1 w-full items-center py-3">
                    <View className="h-1 w-9 rounded-sm bg-neutral-hint" />
                  </View>
                </GestureDetector>

                <View className="px-5 pb-3">
                  <Text className="text-xl font-extrabold text-ink" numberOfLines={1}>
                    {chat.title}
                  </Text>
                  <Text className="mt-0.5 text-body text-ink-50">
                    {participants.length} personas
                  </Text>
                  {!canManage ? (
                    <View className="mt-3 flex-row items-center justify-center gap-2 rounded-2xl bg-neutral-softTint px-3 py-2.5">
                      <Ionicons name="lock-closed" size={14} color={Colors.ink[40]} />
                      <Text className="text-body text-ink-50">
                        {strings.losMios.readOnlyBanner}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <ScrollView
                  className="flex-grow-0"
                  contentContainerClassName="px-5 pb-4"
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <View className="gap-1">
                    {participants.map(participant => {
                      const canRemove =
                        canManage &&
                        isHostViewing &&
                        !participant.isSelf &&
                        participant.role !== 'host'
                      const isExpanded = expandedRemoveId === participant.id

                      return (
                        <Pressable
                          key={participant.id}
                          onPress={() => handleParticipantPress(participant)}
                          className="flex-row items-center gap-3 rounded-2xl px-2 py-2.5"
                        >
                          <View
                            className="h-10 w-10 items-center justify-center rounded-full"
                            style={{ backgroundColor: participant.avatarBg }}
                          >
                            <Text
                              className="text-body font-bold"
                              style={{ color: participant.avatarText }}
                            >
                              {participant.initials}
                            </Text>
                          </View>

                          <View className="min-w-0 flex-1 flex-row items-center gap-2">
                            <Text
                              className="shrink text-lead font-semibold text-ink"
                              numberOfLines={1}
                            >
                              {participant.isSelf
                                ? `${participant.name} (tú)`
                                : participant.name}
                            </Text>
                            {participant.role === 'host' ? (
                              <View className="shrink-0 rounded-full bg-activity-orangeDark px-2.5 py-1">
                                <Text className="text-label font-bold text-white">
                                  {strings.losMios.hostBadge}
                                </Text>
                              </View>
                            ) : null}
                          </View>

                          {canRemove ? (
                            isExpanded ? (
                              <Pressable
                                onPress={() => confirmRemove(participant)}
                                hitSlop={8}
                              >
                                <Text className="text-body font-semibold text-danger">
                                  {strings.losMios.removeMemberAction}
                                </Text>
                              </Pressable>
                            ) : (
                              <Pressable
                                onPress={() => setExpandedRemoveId(participant.id)}
                                hitSlop={8}
                                className="h-8 w-8 items-center justify-center"
                              >
                                <Ionicons
                                  name="ellipsis-horizontal"
                                  size={18}
                                  color={Colors.ink.DEFAULT}
                                />
                              </Pressable>
                            )
                          ) : null}
                        </Pressable>
                      )
                    })}
                  </View>
                </ScrollView>

                {showDeleteButton ? (
                  <View className="px-5 pb-8 pt-2">
                    <Pressable
                      onPress={() => {
                        setExpandedRemoveId(null)
                        confirmDeletePlan()
                      }}
                      className="w-full items-center rounded-full bg-danger py-[15px]"
                    >
                      <Text className="text-body font-bold text-white">
                        {strings.losMios.deletePlanAction}
                      </Text>
                    </Pressable>
                  </View>
                ) : showLeaveButton ? (
                  <View className="px-5 pb-8 pt-2">
                    <Pressable
                      onPress={() => {
                        setExpandedRemoveId(null)
                        confirmLeave()
                      }}
                      className="w-full items-center rounded-full bg-buttons-brown py-[15px]"
                    >
                      <Text className="text-body font-bold text-white">
                        {strings.losMios.leaveAction}
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <View className="pb-6" />
                )}
              </Pressable>
            ) : (
              <GestureDetector gesture={swipeBack}>
                <View>
                <GestureDetector gesture={swipeDown}>
                  <View className="mb-1 w-full items-center py-3">
                    <View className="h-1 w-9 rounded-sm bg-neutral-hint" />
                  </View>
                </GestureDetector>

                <Pressable
                  onPress={goBackToList}
                  className="mb-2 flex-row items-center gap-1 px-5"
                  hitSlop={8}
                >
                  <Ionicons name="chevron-back" size={22} color={Colors.black[400]} />
                </Pressable>

                <ScrollView
                  className="flex-grow-0"
                  contentContainerClassName="px-5 pb-8"
                  showsVerticalScrollIndicator={false}
                  bounces={false}
                >
                  {profileLoading ? (
                    <View className="items-center py-10">
                      <ActivityIndicator size="large" color={Colors.buttons.orange} />
                    </View>
                  ) : profileError ? (
                    <View className="items-center py-10">
                      <Text className="text-center text-body text-ink-50">{profileError}</Text>
                    </View>
                  ) : publicProfile ? (
                    <>
                      <ProfileHeader
                        profile={publicProfile}
                        plansCreated={publicProfile.plansCreated}
                        plansJoined={publicProfile.plansJoined}
                      />
                      <ActivityFingerprint fingerprint={publicProfile.fingerprint} />
                    </>
                  ) : null}
                </ScrollView>
                </View>
              </GestureDetector>
            )}
          </Animated.View>
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  )
}

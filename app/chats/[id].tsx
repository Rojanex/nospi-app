import { Colors } from '@/assets/constants/Colors'
import { ChatComposer } from '@/components/chats/ChatComposer'
import { ChatThreadHeader } from '@/components/chats/ChatThreadHeader'
import { MessageBubble, isSameMessageGroup } from '@/components/chats/MessageBubble'
import { ParticipantsSheet } from '@/components/chats/ParticipantsSheet'
import { TabScreen } from '@/components/layout/TabScreen'
import { isPlanExpired } from '@/constants/planStatus'
import { strings } from '@/constants/strings'
import {
  asActivityType,
  fetchMessagesPage,
  fetchParticipantProfile,
  fetchParticipants,
  fetchPlanMeta,
  getMessagesCacheMeta,
  mapPlanStatusToUi,
  mapRealtimeMessageToChatMessage,
  removeMember,
  sendMessage,
  setMessagesCache,
  subscribeToThreadMessages,
  subscribeToThreadParticipants,
} from '@/lib/chats/api'
import { deletePlan, leavePlan } from '@/lib/plans/lifecycle'
import { notifyPlanDeleted } from '@/lib/plans/plansEvents'
import { supabase } from '@/lib/supabase'
import { avatarColorsForId, initialsFromName } from '@/lib/utils/avatar'
import { ChatListItem, ChatMessage, Participant } from '@/types'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Keyboard,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { RealtimeChannel } from '@supabase/supabase-js'

/** Scroll offset (inverted list) at or below this counts as "pinned to latest". */
const NEAR_BOTTOM_PX = 80

type PendingOptimistic = {
  localId: string
  content: string
}

function parseChatParam(raw: string | string[] | undefined): ChatListItem | null {
  if (!raw) return null
  const value = Array.isArray(raw) ? raw[0] : raw
  try {
    return JSON.parse(value) as ChatListItem
  } catch {
    return null
  }
}

function mergeByCreatedAt(current: ChatMessage[], page: ChatMessage[]): ChatMessage[] {
  const byId = new Map<string, ChatMessage>()
  for (const message of current) byId.set(message.id, message)
  for (const message of page) byId.set(message.id, message)
  return Array.from(byId.values()).sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

export default function ChatThread() {
  const { id, chat: chatParam } = useLocalSearchParams<{ id: string; chat?: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const seededChat = useMemo(() => parseChatParam(chatParam), [chatParam])
  const initialCache = useMemo(() => (id ? getMessagesCacheMeta(id) : null), [id])

  const [chat, setChat] = useState<ChatListItem | null>(seededChat)
  const [messages, setMessages] = useState<ChatMessage[]>(() => initialCache?.messages ?? [])
  const [hasMoreOlder, setHasMoreOlder] = useState(() => initialCache?.hasMore ?? false)
  const [loadingOlder, setLoadingOlder] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [draft, setDraft] = useState('')
  const [participantsVisible, setParticipantsVisible] = useState(false)
  const [headerLoading, setHeaderLoading] = useState(!seededChat)
  const [messagesLoading, setMessagesLoading] = useState(() => !initialCache)
  const [error, setError] = useState<string | null>(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const pendingRef = useRef<PendingOptimistic[]>([])
  const pendingParticipantActionsRef = useRef(new Set<string>())
  const participantsRef = useRef(participants)
  participantsRef.current = participants
  const messagesRef = useRef(messages)
  messagesRef.current = messages
  const hasMoreOlderRef = useRef(hasMoreOlder)
  hasMoreOlderRef.current = hasMoreOlder
  const currentUserIdRef = useRef<string | null>(null)

  const isNearBottomRef = useRef(true)
  const loadedOlderRef = useRef(false)
  const loadingOlderRef = useRef(false)
  const [listEpoch, setListEpoch] = useState(0)

  const listMessages = useMemo(() => [...messages].reverse(), [messages])

  function requestScrollToLatest(reason: string) {
    setUnreadCount(0)

    if (reason === 'realtime-near-bottom' && isNearBottomRef.current) {
      return
    }

    isNearBottomRef.current = true
    setListEpoch(value => value + 1)
  }

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nearBottom = event.nativeEvent.contentOffset.y <= NEAR_BOTTOM_PX
    isNearBottomRef.current = nearBottom
    if (nearBottom && unreadCount > 0) setUnreadCount(0)
  }

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const onShow = Keyboard.addListener(showEvent, event => {
      setKeyboardHeight(event.endCoordinates.height)
    })
    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0)
    })

    return () => {
      onShow.remove()
      onHide.remove()
    }
  }, [])

  const loadThread = useCallback(async () => {
    if (!id) return

    setError(null)
    if (!seededChat) setHeaderLoading(true)

    const hasCachedMessages = !!getMessagesCacheMeta(id)
    if (!hasCachedMessages) setMessagesLoading(true)

    try {
      if (seededChat) {
        const [page, fetchedParticipants] = await Promise.all([
          fetchMessagesPage(id),
          fetchParticipants(id),
        ])

        const self = fetchedParticipants.find(participant => participant.isSelf)
        setChat(current =>
          current
            ? {
                ...current,
                isHost: self ? self.role === 'host' : current.isHost,
              }
            : current,
        )
        setMessages(current => {
          const updated =
            current.length === 0 ? page.messages : mergeByCreatedAt(current, page.messages)
          setMessagesCache(
            id,
            updated,
            loadedOlderRef.current ? undefined : page.hasMore,
          )
          return updated
        })
        if (!loadedOlderRef.current) setHasMoreOlder(page.hasMore)
        setParticipants(fetchedParticipants)
        if (self) currentUserIdRef.current = self.id
      } else {
        const [planMeta, page, fetchedParticipants] = await Promise.all([
          fetchPlanMeta(id),
          fetchMessagesPage(id),
          fetchParticipants(id),
        ])

        if (!planMeta) {
          setChat(null)
          return
        }

        const self = fetchedParticipants.find(participant => participant.isSelf)
        setChat({
          id: planMeta.id,
          activityType: asActivityType(planMeta.activity_type),
          title: planMeta.title,
          previewText: planMeta.previewText,
          timeLabel: planMeta.timeLabel,
          memberCount: fetchedParticipants.length,
          isHost: self?.role === 'host',
          status: mapPlanStatusToUi(planMeta.status),
          archivedAt: null,
        })
        setMessages(current => {
          const updated =
            current.length === 0 ? page.messages : mergeByCreatedAt(current, page.messages)
          setMessagesCache(
            id,
            updated,
            loadedOlderRef.current ? undefined : page.hasMore,
          )
          return updated
        })
        if (!loadedOlderRef.current) setHasMoreOlder(page.hasMore)
        setParticipants(fetchedParticipants)
        if (self) currentUserIdRef.current = self.id
      }
    } catch (err) {
      console.error('[chat-thread] load', err)
      setError(strings.losMios.loadError)
    } finally {
      setHeaderLoading(false)
      setMessagesLoading(false)
    }
  }, [id, seededChat])

  useEffect(() => {
    loadThread()
  }, [loadThread])

  useEffect(() => {
    loadedOlderRef.current = false
    isNearBottomRef.current = true
    setUnreadCount(0)
  }, [id])

  const loadOlderMessages = useCallback(async () => {
    if (!id || loadingOlderRef.current || !hasMoreOlderRef.current) return

    const oldest = messagesRef.current[0]
    if (!oldest?.createdAt) return

    loadingOlderRef.current = true
    setLoadingOlder(true)
    try {
      const page = await fetchMessagesPage(id, { beforeCreatedAt: oldest.createdAt })
      loadedOlderRef.current = true
      setMessages(current => {
        const updated = mergeByCreatedAt(current, page.messages)
        setMessagesCache(id, updated, page.hasMore)
        return updated
      })
      setHasMoreOlder(page.hasMore)
    } catch (err) {
      console.error('[chat-thread] load older', err)
    } finally {
      loadingOlderRef.current = false
      setLoadingOlder(false)
    }
  }, [id])

  useEffect(() => {
    if (!id) return

    pendingRef.current = []
    let cancelled = false
    let channel: RealtimeChannel | undefined

    void supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return

      const sessionUserId = data.session?.user?.id ?? null
      if (sessionUserId) currentUserIdRef.current = sessionUserId

      channel = subscribeToThreadMessages(id, row => {
        const currentUserId = currentUserIdRef.current
        const isOwn =
          currentUserId != null && row.user_id != null && row.user_id === currentUserId

        if (isOwn) {
          const pendingIndex = pendingRef.current.findIndex(
            pending => pending.content === row.content,
          )
          if (pendingIndex !== -1) {
            const [matched] = pendingRef.current.splice(pendingIndex, 1)
            const confirmed = mapRealtimeMessageToChatMessage(
              row,
              currentUserId,
              participantsRef.current,
            )
            setMessages(current => {
              const updated = current.map(message =>
                message.id === matched.localId ? confirmed : message,
              )
              setMessagesCache(id, updated)
              return updated
            })
            return
          }
        }

        const next = mapRealtimeMessageToChatMessage(
          row,
          currentUserId,
          participantsRef.current,
        )
        setMessages(current => {
          if (current.some(message => message.id === next.id)) return current
          const updated = [...current, next]
          setMessagesCache(id, updated)
          return updated
        })

        if (isNearBottomRef.current) {
          requestScrollToLatest('realtime-near-bottom')
        } else if (!isOwn && next.type === 'user') {
          setUnreadCount(count => count + 1)
        }
      })

      if (cancelled) {
        void supabase.removeChannel(channel)
      }
    })

    return () => {
      cancelled = true
      if (channel) void supabase.removeChannel(channel)
    }
  }, [id])

  useEffect(() => {
    if (!id) return

    pendingParticipantActionsRef.current.clear()
    let cancelled = false
    let channel: RealtimeChannel | undefined

    channel = subscribeToThreadParticipants(id, event => {
      const { eventType, row } = event

      if (pendingParticipantActionsRef.current.has(row.user_id)) {
        pendingParticipantActionsRef.current.delete(row.user_id)
        return
      }

      if (eventType === 'DELETE') {
        setParticipants(current => current.filter(p => p.id !== row.user_id))
        return
      }

      // INSERT
      void (async () => {
        let participant: Participant
        try {
          participant = await fetchParticipantProfile(id, row.user_id)
        } catch (err) {
          console.error('[chat-thread] fetchParticipantProfile', err)
          const colors = avatarColorsForId(row.user_id)
          const name = 'Nuevo participante'
          participant = {
            id: row.user_id,
            name,
            initials: initialsFromName(name),
            avatarBg: colors.bg,
            avatarText: colors.text,
            role: 'member',
            isSelf: row.user_id === currentUserIdRef.current,
          }
        }

        if (cancelled) return

        setParticipants(current => {
          if (current.some(p => p.id === participant.id)) return current
          return [...current, participant]
        })
      })()
    })

    return () => {
      cancelled = true
      if (channel) void supabase.removeChannel(channel)
    }
  }, [id])

  if (headerLoading && !chat) {
    return (
      <TabScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.buttons.orange} />
        </View>
      </TabScreen>
    )
  }

  if (error && !chat) {
    return (
      <TabScreen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-body text-ink-50">{error}</Text>
        </View>
      </TabScreen>
    )
  }

  if (!chat) {
    return (
      <TabScreen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-body text-ink-50">{strings.losMios.notFoundChat}</Text>
        </View>
      </TabScreen>
    )
  }

  const chatItem = {
    ...chat,
    memberCount:
      !messagesLoading || participants.length > 0
        ? participants.length
        : chat.memberCount,
  }

  async function handleSend() {
    const content = draft.trim()
    if (!content || !id || isPlanExpired(chatItem.status)) return

    const createdAt = new Date().toISOString()
    const newMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      type: 'user',
      content,
      createdAt,
      timeLabel: 'Ahora',
      isOwn: true,
    }

    setMessages(current => {
      const updated = [...current, newMessage]
      setMessagesCache(id, updated)
      return updated
    })
    pendingRef.current.push({
      localId: newMessage.id,
      content,
    })
    setDraft('')
    requestScrollToLatest('own-send')

    try {
      await sendMessage(id, content)
    } catch (err) {
      console.error('[chat-thread] send', err)
      pendingRef.current = pendingRef.current.filter(
        pending => pending.localId !== newMessage.id,
      )
      setMessages(current => {
        const updated = current.filter(message => message.id !== newMessage.id)
        setMessagesCache(id, updated)
        return updated
      })
      setDraft(content)
      setError(strings.losMios.loadError)
    }
  }

  function handlePressMembers() {
    Keyboard.dismiss()
    setParticipantsVisible(true)
  }

  async function handleRemoveMember(memberId: string) {
    if (!id) return
    const participant = participants.find(p => p.id === memberId)
    if (!participant) return

    pendingParticipantActionsRef.current.add(memberId)
    try {
      await removeMember(id, memberId, participant.name)
      setParticipants(current => current.filter(p => p.id !== memberId))
    } catch (err) {
      pendingParticipantActionsRef.current.delete(memberId)
      console.error('[chat-thread] remove member', err)
      setError(strings.losMios.loadError)
    }
  }

  async function handleLeave() {
    if (!id) return

    try {
      await leavePlan(id, chatItem.isHost)
      setParticipantsVisible(false)
      router.back()
    } catch (err) {
      console.error('[chat-thread] leave', err)
      setError(strings.losMios.loadError)
    }
  }

  async function handleDeletePlan() {
    if (!id) return

    try {
      await deletePlan(id)
      notifyPlanDeleted(id)
      setParticipantsVisible(false)
      router.back()
    } catch (err) {
      console.error('[chat-thread] delete plan', err)
      setError(strings.losMios.loadError)
    }
  }

  return (
    <TabScreen
      header={
        <ChatThreadHeader
          item={chatItem}
          onBack={() => router.back()}
          onPressMembers={handlePressMembers}
        />
      }
    >
      <View style={{ flex: 1 }}>
        {error ? (
          <Text className="px-4 pt-2 text-body text-ink-50">{error}</Text>
        ) : null}

        {messagesLoading ? (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="small" color={Colors.buttons.orange} />
          </View>
        ) : messages.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-body text-ink-40">{strings.losMios.emptyMessages}</Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <FlatList
              key={`thread-${id}-${listEpoch}`}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
              data={listMessages}
              keyExtractor={item => item.id}
              renderItem={({ item, index }) => {
                // listMessages is newest-first (inverted). Older = index+1, newer = index-1.
                const older = listMessages[index + 1]
                const newer = listMessages[index - 1]
                const isFirstInGroup = !isSameMessageGroup(item, older)
                const isLastInGroup = !isSameMessageGroup(item, newer)
                return (
                  <MessageBubble
                    message={item}
                    isFirstInGroup={isFirstInGroup}
                    isLastInGroup={isLastInGroup}
                  />
                )
              }}
              inverted
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              onScroll={handleScroll}
              scrollEventThrottle={16}
              onEndReached={loadOlderMessages}
              onEndReachedThreshold={0.3}
              maintainVisibleContentPosition={
                loadingOlder ? { minIndexForVisible: 1 } : undefined
              }
              ListFooterComponent={
                loadingOlder ? (
                  <View className="items-center py-3">
                    <ActivityIndicator size="small" color={Colors.buttons.orange} />
                  </View>
                ) : null
              }
            />

            {unreadCount > 0 ? (
              <View
                pointerEvents="box-none"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  bottom: 12,
                  alignItems: 'center',
                  zIndex: 10,
                }}
              >
                <Pressable
                  onPress={() => requestScrollToLatest('pill-tap')}
                  className="rounded-full px-4 py-2.5"
                  style={{
                    backgroundColor: Colors.surface.orangeLight,
                    borderWidth: 1,
                    borderColor: Colors.primary[100],
                    shadowColor: Colors.buttons.orange,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 10,
                    elevation: 5,
                  }}
                >
                  <Text
                    className="text-body font-semibold"
                    style={{ color: Colors.buttons.orange }}
                  >
                    {strings.losMios.newMessagesBadge(unreadCount)}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        )}

        <View
          style={{
            paddingBottom: keyboardHeight > 0 ? keyboardHeight : insets.bottom,
          }}
        >
          <ChatComposer
            status={chatItem.status}
            value={draft}
            onChangeValue={setDraft}
            onSend={handleSend}
          />
        </View>
      </View>

      <ParticipantsSheet
        visible={participantsVisible}
        onClose={() => setParticipantsVisible(false)}
        chat={chatItem}
        participants={participants}
        onRemoveMember={handleRemoveMember}
        onLeave={handleLeave}
        onDeletePlan={handleDeletePlan}
      />
    </TabScreen>
  )
}

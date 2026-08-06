import { Colors } from '@/assets/constants/Colors'
import { ChatComposer } from '@/components/chats/ChatComposer'
import { ChatThreadHeader } from '@/components/chats/ChatThreadHeader'
import { MessageBubble } from '@/components/chats/MessageBubble'
import { ParticipantsSheet } from '@/components/chats/ParticipantsSheet'
import { TabScreen } from '@/components/layout/TabScreen'
import { isPlanExpired } from '@/constants/planStatus'
import { strings } from '@/constants/strings'
import {
  asActivityType,
  fetchMessages,
  fetchParticipantProfile,
  fetchParticipants,
  fetchPlanMeta,
  mapPlanStatusToUi,
  mapRealtimeMessageToChatMessage,
  removeMember,
  sendMessage,
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
  Platform,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { RealtimeChannel } from '@supabase/supabase-js'

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

export default function ChatThread() {
  const { id, chat: chatParam } = useLocalSearchParams<{ id: string; chat?: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()

  const seededChat = useMemo(() => parseChatParam(chatParam), [chatParam])

  const [chat, setChat] = useState<ChatListItem | null>(seededChat)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [participants, setParticipants] = useState<Participant[]>([])
  const [draft, setDraft] = useState('')
  const [participantsVisible, setParticipantsVisible] = useState(false)
  const [headerLoading, setHeaderLoading] = useState(!seededChat)
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const pendingRef = useRef<PendingOptimistic[]>([])
  const pendingParticipantActionsRef = useRef(new Set<string>())
  const participantsRef = useRef(participants)
  participantsRef.current = participants
  const currentUserIdRef = useRef<string | null>(null)

  /** Newest-first for inverted FlatList (index 0 renders at the visual bottom). */
  const listMessages = useMemo(() => [...messages].reverse(), [messages])

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
    setMessagesLoading(true)
    if (!seededChat) setHeaderLoading(true)

    try {
      if (seededChat) {
        const [fetchedMessages, fetchedParticipants] = await Promise.all([
          fetchMessages(id),
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
        setMessages(fetchedMessages)
        setParticipants(fetchedParticipants)
        if (self) currentUserIdRef.current = self.id
      } else {
        const [planMeta, fetchedMessages, fetchedParticipants] = await Promise.all([
          fetchPlanMeta(id),
          fetchMessages(id),
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
        setMessages(fetchedMessages)
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
            setMessages(current =>
              current.map(message =>
                message.id === matched.localId ? confirmed : message,
              ),
            )
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
          return [...current, next]
        })
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
          <Text className="text-center text-sm text-ink-50">{error}</Text>
        </View>
      </TabScreen>
    )
  }

  if (!chat) {
    return (
      <TabScreen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-ink-50">{strings.losMios.notFoundChat}</Text>
        </View>
      </TabScreen>
    )
  }

  const chatItem = {
    ...chat,
    // Keep seeded count until the roster fetch finishes (avoid flashing "0 personas").
    memberCount:
      !messagesLoading || participants.length > 0
        ? participants.length
        : chat.memberCount,
  }

  async function handleSend() {
    const content = draft.trim()
    if (!content || !id || isPlanExpired(chatItem.status)) return

    const newMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      type: 'user',
      content,
      timeLabel: 'Ahora',
      isOwn: true,
    }

    setMessages(current => [...current, newMessage])
    pendingRef.current.push({
      localId: newMessage.id,
      content,
    })
    setDraft('')

    try {
      await sendMessage(id, content)
    } catch (err) {
      console.error('[chat-thread] send', err)
      pendingRef.current = pendingRef.current.filter(
        pending => pending.localId !== newMessage.id,
      )
      setMessages(current => current.filter(message => message.id !== newMessage.id))
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
          <Text className="px-4 pt-2 text-sm text-ink-50">{error}</Text>
        ) : null}

        {messagesLoading ? (
          <View className="flex-1 items-center justify-center py-12">
            <ActivityIndicator size="small" color={Colors.buttons.orange} />
          </View>
        ) : messages.length === 0 ? (
          <View className="flex-1 items-center justify-center py-12">
            <Text className="text-sm text-ink-40">{strings.losMios.emptyMessages}</Text>
          </View>
        ) : (
          <FlatList
            style={{ flex: 1 }}
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
            data={listMessages}
            keyExtractor={item => item.id}
            renderItem={({ item }) => <MessageBubble message={item} />}
            inverted
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="interactive"
          />
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

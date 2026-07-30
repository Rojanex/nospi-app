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
  fetchParticipants,
  fetchPlanMeta,
  mapPlanStatusToUi,
  removeMember,
  sendMessage,
} from '@/lib/chats/api'
import { deletePlan, leavePlan } from '@/lib/plans/lifecycle'
import { notifyPlanDeleted } from '@/lib/plans/plansEvents'
import { ChatListItem, ChatMessage, Participant } from '@/types'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

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
                memberCount: fetchedParticipants.length,
                isHost: self ? self.role === 'host' : current.isHost,
              }
            : current,
        )
        setMessages(fetchedMessages)
        setParticipants(fetchedParticipants)
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

  const chatItem = chat

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
    setDraft('')

    try {
      await sendMessage(id, content)
    } catch (err) {
      console.error('[chat-thread] send', err)
      setMessages(current => current.filter(message => message.id !== newMessage.id))
      setDraft(content)
      setError(strings.losMios.loadError)
    }
  }

  function handlePressMembers() {
    setParticipantsVisible(true)
  }

  async function handleRemoveMember(memberId: string) {
    if (!id) return
    const participant = participants.find(p => p.id === memberId)
    if (!participant) return

    try {
      await removeMember(id, memberId, participant.name)
      setParticipants(current => current.filter(p => p.id !== memberId))
    } catch (err) {
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
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {error ? (
          <Text className="px-4 pt-2 text-sm text-ink-50">{error}</Text>
        ) : null}

        <ScrollView
          className="flex-1 px-4"
          contentContainerClassName="py-4"
          keyboardShouldPersistTaps="handled"
        >
          {messagesLoading ? (
            <View className="items-center py-12">
              <ActivityIndicator size="small" color={Colors.buttons.orange} />
            </View>
          ) : messages.length === 0 ? (
            <View className="items-center py-12">
              <Text className="text-sm text-ink-40">{strings.losMios.emptyMessages}</Text>
            </View>
          ) : (
            messages.map(message => <MessageBubble key={message.id} message={message} />)
          )}
        </ScrollView>

        <View style={{ paddingBottom: insets.bottom }}>
          <ChatComposer
            status={chatItem.status}
            value={draft}
            onChangeValue={setDraft}
            onSend={handleSend}
          />
        </View>
      </KeyboardAvoidingView>

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

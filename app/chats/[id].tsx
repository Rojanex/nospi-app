import { ChatComposer } from '@/components/chats/ChatComposer'
import { ChatThreadHeader } from '@/components/chats/ChatThreadHeader'
import { MessageBubble } from '@/components/chats/MessageBubble'
import { strings } from '@/constants/strings'
import { mockChats } from '@/lib/chats/mockChats'
import { ChatMessage, mockMessagesByChat } from '@/lib/chats/mockMessages'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'

export default function ChatThread() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const chat = mockChats.find(c => c.id === id)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => mockMessagesByChat[id ?? ''] ?? [],
  )

  if (!chat) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-primary-300">
        <Text className="text-sm text-ink/50">Chat no encontrado</Text>
      </SafeAreaView>
    )
  }

  const chatItem = chat

  function handleSend() {
    const content = draft.trim()
    if (!content || chatItem.status === 'finalized') return

    const newMessage: ChatMessage = {
      id: `local-${Date.now()}`,
      type: 'user',
      content,
      timeLabel: 'Ahora',
      isOwn: true,
    }

    setMessages(current => [...current, newMessage])
    setDraft('')
  }

  function handlePressMembers() {
    console.log('[chat-thread] open members', chatItem.id)
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-300" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ChatThreadHeader
          item={chatItem}
          onBack={() => router.back()}
          onPressMembers={handlePressMembers}
        />

        <ScrollView
          className="flex-1 px-4"
          contentContainerClassName="py-4"
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <View className="items-center py-12">
              <Text className="text-sm text-ink/40">{strings.losMios.emptyMessages}</Text>
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
    </SafeAreaView>
  )
}

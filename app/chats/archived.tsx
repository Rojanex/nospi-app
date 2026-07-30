import { Colors } from '@/assets/constants/Colors'
import { ChatRow } from '@/components/chats/ChatRow'
import { ChatSection } from '@/components/chats/ChatSection'
import { TabScreen } from '@/components/layout/TabScreen'
import { strings } from '@/constants/strings'
import { fetchChatList, unarchiveChat } from '@/lib/chats/api'
import { getArchivedChats } from '@/lib/chats/filters'
import { ChatListItem } from '@/types'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native'

export default function ArchivedChats() {
  const router = useRouter()
  const [chats, setChats] = useState<ChatListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null)

  const loadChats = useCallback(async () => {
    setError(null)
    try {
      const data = await fetchChatList()
      setChats(data)
    } catch (err) {
      console.error('[archived] load', err)
      setError(strings.losMios.loadError)
    }
  }, [])

  useEffect(() => {
    loadChats().finally(() => setLoading(false))
  }, [loadChats])

  const archivedChats = getArchivedChats(chats)

  function getSwipeProps(id: string) {
    return {
      isSwipeOpen: openSwipeId === id,
      onSwipeOpenChange: (open: boolean) => {
        setOpenSwipeId(current => (open ? id : current === id ? null : current))
      },
    }
  }

  function handleChatPress(item: ChatListItem) {
    router.push({
      pathname: '/chats/[id]',
      params: { id: item.id, chat: JSON.stringify(item) },
    } as never)
  }

  async function handleUnarchive(id: string) {
    try {
      await unarchiveChat(id)
      setChats(current =>
        current.map(item =>
          item.id === id ? { ...item, archivedAt: null } : item,
        ),
      )
      setOpenSwipeId(current => (current === id ? null : current))
    } catch (err) {
      console.error('[archived] unarchive', err)
      setError(strings.losMios.loadError)
    }
  }

  if (loading) {
    return (
      <TabScreen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={Colors.buttons.orange} />
        </View>
      </TabScreen>
    )
  }

  if (error && archivedChats.length === 0) {
    return (
      <TabScreen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-sm text-ink-50">{error}</Text>
        </View>
      </TabScreen>
    )
  }

  return (
    <TabScreen>
      <View className="flex-row items-center gap-2 px-4 py-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="h-9 w-9 items-center justify-center"
        >
          <Ionicons name="chevron-back" size={24} color={Colors.ink.DEFAULT} />
        </Pressable>
        <Text className="text-xl font-bold text-ink">{strings.losMios.archivedSection}</Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-2 pb-8"
        showsVerticalScrollIndicator={false}
      >
        {error ? (
          <Text className="mb-4 text-sm text-ink-50">{error}</Text>
        ) : null}

        {archivedChats.length === 0 ? (
          <View className="items-center py-12">
            <Text className="text-sm text-ink-40">{strings.losMios.emptyArchived}</Text>
          </View>
        ) : (
          <ChatSection label={strings.losMios.archivedSection} locked>
            {archivedChats.map(item => (
              <ChatRow
                key={item.id}
                item={item}
                {...getSwipeProps(item.id)}
                onPress={() => handleChatPress(item)}
                onLeave={() => {}}
                onArchive={() => {}}
                onUnarchive={() => handleUnarchive(item.id)}
              />
            ))}
          </ChatSection>
        )}
      </ScrollView>
    </TabScreen>
  )
}

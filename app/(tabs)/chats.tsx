import { Colors } from '@/assets/constants/Colors'
import { ArchivedFooter } from '@/components/chats/ArchivedFooter'
import { ChatRow } from '@/components/chats/ChatRow'
import { ChatSection } from '@/components/chats/ChatSection'
import { TabScreen } from '@/components/layout/TabScreen'
import { strings } from '@/constants/strings'
import {
  archiveChat,
  fetchChatList,
  formatTimestampLabel,
  getChatListCache,
  prefetchMessages,
  resolveMessagePreview,
  subscribeToChatPreviews,
} from '@/lib/chats/api'
import {
  getActiveChats,
  getArchivedChats,
  getExpiredChats,
} from '@/lib/chats/filters'
import { leavePlan } from '@/lib/plans/lifecycle'
import {
  subscribePlanDeleted,
  subscribePlansChanged,
} from '@/lib/plans/plansEvents'
import { supabase } from '@/lib/supabase'
import { ChatListItem } from '@/types'
import { useRouter } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native'

export default function Chats() {
  const router = useRouter()
  const [chats, setChats] = useState<ChatListItem[]>(() => getChatListCache() ?? [])
  const [loading, setLoading] = useState(() => !getChatListCache())
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null)

  const loadChats = useCallback(async (background = false) => {
    if (!background) setError(null)
    try {
      const data = await fetchChatList()
      setChats(data)
    } catch (err) {
      if (!background) {
        console.error('[chats] load', err)
        setError(strings.losMios.loadError)
      }
    }
  }, [])

  useEffect(() => {
    if (getChatListCache()) {
      setLoading(false)
      loadChats(true)
    } else {
      loadChats().finally(() => setLoading(false))
    }
  }, [loadChats])

  useEffect(() => {
    return subscribePlanDeleted(planId => {
      setChats(current => current.filter(chat => chat.id !== planId))
      setOpenSwipeId(current => (current === planId ? null : current))
    })
  }, [])

  useEffect(() => {
    return subscribePlansChanged(() => {
      void loadChats(true)
    })
  }, [loadChats])

  // Sorted so reordering on new messages does not change the key / re-subscribe.
  const planIdsKey = [...chats.map(chat => chat.id)].sort().join(',')

  useEffect(() => {
    const planIds = planIdsKey.length === 0 ? [] : planIdsKey.split(',')

    const channel = subscribeToChatPreviews(planIds, message => {
      void (async () => {
        const previewText = await resolveMessagePreview(message)
        setChats(current => {
          const index = current.findIndex(chat => chat.id === message.plan_id)
          if (index === -1) return current

          const existing = current[index]
          if (existing.lastMessageAt && existing.lastMessageAt > message.created_at) {
            return current
          }

          const updated: ChatListItem = {
            ...existing,
            previewText,
            timeLabel: formatTimestampLabel(message.created_at),
            lastMessageAt: message.created_at,
          }

          const next = [...current]
          next.splice(index, 1)
          next.unshift(updated)
          return next
        })
      })()
    })

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [planIdsKey])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    const minDelay = new Promise(resolve => setTimeout(resolve, 600))
    await Promise.all([loadChats(), minDelay])
    setRefreshing(false)
  }, [loadChats])

  const activeChats = getActiveChats(chats)
  const expiredChats = getExpiredChats(chats)
  const archivedCount = getArchivedChats(chats).length

  function getSwipeProps(id: string) {
    return {
      isSwipeOpen: openSwipeId === id,
      onSwipeOpenChange: (open: boolean) => {
        setOpenSwipeId(current => (open ? id : current === id ? null : current))
      },
    }
  }

  function handleChatPress(item: ChatListItem) {
    prefetchMessages(item.id)
    router.push({
      pathname: '/chats/[id]',
      params: { id: item.id, chat: JSON.stringify(item) },
    } as never)
  }

  async function handleLeave(id: string) {
    const chat = chats.find(item => item.id === id)
    if (!chat) return

    try {
      await leavePlan(id, chat.isHost)
      setChats(current => current.filter(item => item.id !== id))
      setOpenSwipeId(current => (current === id ? null : current))
    } catch (err) {
      console.error('[chats] leave', err)
      setError(strings.losMios.loadError)
    }
  }

  async function handleArchive(id: string) {
    try {
      await archiveChat(id)
      setChats(current =>
        current.map(item =>
          item.id === id ? { ...item, archivedAt: new Date().toISOString() } : item,
        ),
      )
      setOpenSwipeId(current => (current === id ? null : current))
    } catch (err) {
      console.error('[chats] archive', err)
      setError(strings.losMios.loadError)
    }
  }

  function handleArchivedPress() {
    router.push('/chats/archived' as never)
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

  if (error && chats.length === 0) {
    return (
      <TabScreen>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-center text-body text-ink-50">{error}</Text>
        </View>
      </TabScreen>
    )
  }

  return (
    <TabScreen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-6 pb-8"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="mb-6 flex-row items-end justify-between gap-3">
          <Text className="text-3xl font-extrabold text-ink">
            {strings.losMios.title}
          </Text>
          <Text className="pb-1 text-body font-semibold text-buttons-orange">
            {strings.losMios.activeCount(activeChats.length)}
          </Text>
        </View>

        {error ? (
          <Text className="mb-4 text-body text-ink-50">{error}</Text>
        ) : null}

        <View className="gap-7">
          <ChatSection label={strings.losMios.activeSection}>
            {activeChats.map(item => (
              <ChatRow
                key={item.id}
                item={item}
                {...getSwipeProps(item.id)}
                onPress={() => handleChatPress(item)}
                onLeave={() => handleLeave(item.id)}
                onArchive={() => handleArchive(item.id)}
                onUnarchive={() =>{}}
              />
            ))}
          </ChatSection>

          <ChatSection label={strings.losMios.completedSection} locked>
            {expiredChats.map(item => (
              <ChatRow
                key={item.id}
                item={item}
                {...getSwipeProps(item.id)}
                onPress={() => handleChatPress(item)}
                onLeave={() => handleLeave(item.id)}
                onArchive={() => handleArchive(item.id)}
                onUnarchive={() => {}}
              />
            ))}
          </ChatSection>
        </View>

        <ArchivedFooter count={archivedCount} onPress={handleArchivedPress} />
      </ScrollView>
    </TabScreen>
  )
}

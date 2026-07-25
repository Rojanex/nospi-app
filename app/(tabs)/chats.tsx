import { ArchivedFooter } from '@/components/chats/ArchivedFooter'
import { ChatRow } from '@/components/chats/ChatRow'
import { ChatSection } from '@/components/chats/ChatSection'
import { TabScreen } from '@/components/layout/TabScreen'
import { strings } from '@/constants/strings'
import {
  getActiveChats,
  getArchivedChats,
  getExpiredChats,
} from '@/lib/chats/mockChats'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

export default function Chats() {
  const router = useRouter()
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null)
  const activeChats = getActiveChats()
  const expiredChats = getExpiredChats()
  const archivedCount = getArchivedChats().length

  function getSwipeProps(id: string) {
    return {
      isSwipeOpen: openSwipeId === id,
      onSwipeOpenChange: (open: boolean) => {
        setOpenSwipeId(current => (open ? id : current === id ? null : current))
      },
    }
  }

  function handleChatPress(id: string) {
    router.push(`/chats/${id}` as never)
  }

  function handleLeave(id: string) {
    console.log('[chats] leave chat', id)
  }

  function handleArchive(id: string) {
    console.log('[chats] archive chat', id)
  }

  function handleUnarchive(id: string) {
    console.log('[chats] unarchive chat', id)
  }

  function handleArchivedPress() {
    router.push('/chats/archived' as never)
  }

  return (
    <TabScreen>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pt-6 pb-8"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 flex-row items-end justify-between gap-3">
          <Text className="text-3xl font-extrabold text-ink">
            {strings.losMios.title}
          </Text>
          <Text className="pb-1 text-sm font-semibold text-buttons-orange">
            {strings.losMios.activeCount(activeChats.length)}
          </Text>
        </View>

        <View className="gap-7">
          <ChatSection label={strings.losMios.activeSection}>
            {activeChats.map(item => (
              <ChatRow
                key={item.id}
                item={item}
                {...getSwipeProps(item.id)}
                onPress={() => handleChatPress(item.id)}
                onLeave={() => handleLeave(item.id)}
                onArchive={() => handleArchive(item.id)}
                onUnarchive={() => handleUnarchive(item.id)}
              />
            ))}
          </ChatSection>

          <ChatSection label={strings.losMios.completedSection} locked>
            {expiredChats.map(item => (
              <ChatRow
                key={item.id}
                item={item}
                {...getSwipeProps(item.id)}
                onPress={() => handleChatPress(item.id)}
                onLeave={() => handleLeave(item.id)}
                onArchive={() => handleArchive(item.id)}
                onUnarchive={() => handleUnarchive(item.id)}
              />
            ))}
          </ChatSection>
        </View>

        <ArchivedFooter count={archivedCount} onPress={handleArchivedPress} />
      </ScrollView>
    </TabScreen>
  )
}

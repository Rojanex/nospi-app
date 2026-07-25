import { Colors } from '@/assets/constants/Colors'
import { ChatRow } from '@/components/chats/ChatRow'
import { ChatSection } from '@/components/chats/ChatSection'
import { strings } from '@/constants/strings'
import { getArchivedChats } from '@/lib/chats/mockChats'
import { Ionicons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import React, { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function ArchivedChats() {
  const router = useRouter()
  const [unarchivedIds, setUnarchivedIds] = useState<string[]>([])
  const [openSwipeId, setOpenSwipeId] = useState<string | null>(null)

  const archivedChats = getArchivedChats().filter(
    item => !unarchivedIds.includes(item.id),
  )

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

  function handleUnarchive(id: string) {
    setUnarchivedIds(current => (current.includes(id) ? current : [...current, id]))
    setOpenSwipeId(current => (current === id ? null : current))
  }

  return (
    <SafeAreaView className="flex-1 bg-primary-300" edges={['top', 'left', 'right']}>
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
                onPress={() => handleChatPress(item.id)}
                onLeave={() => {}}
                onArchive={() => {}}
                onUnarchive={() => handleUnarchive(item.id)}
              />
            ))}
          </ChatSection>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

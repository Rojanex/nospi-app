import { isChatArchived, isPlanActive, isPlanExpired } from '@/constants/planStatus'
import { ChatListItem } from '@/types'

function byLatestMessage(a: ChatListItem, b: ChatListItem): number {
  const aTime = a.lastMessageAt ?? ''
  const bTime = b.lastMessageAt ?? ''
  if (aTime === bTime) return 0
  if (!aTime) return 1
  if (!bTime) return -1
  return bTime.localeCompare(aTime)
}

export function getActiveChats(chats: ChatListItem[]): ChatListItem[] {
  return chats.filter(c => isPlanActive(c.status)).sort(byLatestMessage)
}

export function getExpiredChats(chats: ChatListItem[]): ChatListItem[] {
  return chats
    .filter(c => isPlanExpired(c.status) && !isChatArchived(c))
    .sort(byLatestMessage)
}

export function getArchivedChats(chats: ChatListItem[]): ChatListItem[] {
  return chats
    .filter(c => isPlanExpired(c.status) && isChatArchived(c))
    .sort(byLatestMessage)
}

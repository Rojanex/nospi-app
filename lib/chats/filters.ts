import { isChatArchived, isPlanActive, isPlanExpired } from '@/constants/planStatus'
import { ChatListItem } from '@/types'

export function getActiveChats(chats: ChatListItem[]): ChatListItem[] {
  return chats.filter(c => isPlanActive(c.status))
}

export function getExpiredChats(chats: ChatListItem[]): ChatListItem[] {
  return chats.filter(c => isPlanExpired(c.status) && !isChatArchived(c))
}

export function getArchivedChats(chats: ChatListItem[]): ChatListItem[] {
  return chats.filter(c => isPlanExpired(c.status) && isChatArchived(c))
}

import { PlanStatus, isChatArchived, isPlanActive, isPlanExpired } from '@/constants/planStatus'
import { PlanActivityType } from '@/types'

export type ChatListItem = {
  id: string
  activityType: PlanActivityType
  title: string
  previewText: string
  timeLabel: string
  memberCount: number
  isHost: boolean
  status: PlanStatus
  archivedAt?: string | null
}

export const mockChats: ChatListItem[] = [
  {
    id: 'chat-1',
    activityType: 'rumba',
    title: 'Rumba en Getsemaní',
    previewText: '¿Nos vemos en la puerta a las 9?',
    timeLabel: '12m',
    memberCount: 4,
    isHost: true,
    status: PlanStatus.ACTIVE,
  },
  {
    id: 'chat-2',
    activityType: 'playa',
    title: 'Playa Blanca mañana',
    previewText: 'Llevo nevera y snorkel 🏖️',
    timeLabel: '1h',
    memberCount: 3,
    isHost: false,
    status: PlanStatus.ACTIVE,
  },
  {
    id: 'chat-3',
    activityType: 'comida',
    title: 'Ceviche en Bazurto',
    previewText: 'Ya reservé mesa para 6',
    timeLabel: 'Ayer',
    memberCount: 6,
    isHost: true,
    status: PlanStatus.ACTIVE,
  },
  {
    id: 'chat-4',
    activityType: 'deporte',
    title: 'Fútbol en la cancha',
    previewText:
      'Oye, ¿puedes confirmar si traes los chalecos naranjas y también el balón oficial? Si no, paso por la tienda antes y compro uno',
    timeLabel: '2d',
    memberCount: 5,
    isHost: true,
    status: PlanStatus.ACTIVE,
  },
  {
    id: 'chat-5',
    activityType: 'cultura',
    title: 'Tour Centro Histórico',
    previewText: 'Estuvo muy bueno el tour, pero aún me gustaría ir a la playa',
    timeLabel: 'Lun',
    memberCount: 4,
    isHost: false,
    status: PlanStatus.EXPIRED,
  },
  {
    id: 'chat-6',
    activityType: 'naturaleza',
    title: 'Sendero Cerro de la Popa',
    previewText: 'Qué vista tan brutal desde arriba',
    timeLabel: 'Mar',
    memberCount: 3,
    isHost: true,
    status: PlanStatus.EXPIRED,
    archivedAt: '2026-07-10T18:00:00.000Z',
  },
  {
    id: 'chat-7',
    activityType: 'otro',
    title: 'Café y charla en San Diego',
    previewText: 'Gracias por el plan, nos vemos pronto',
    timeLabel: 'Mié',
    memberCount: 2,
    isHost: false,
    status: PlanStatus.EXPIRED,
    archivedAt: '2026-07-08T12:30:00.000Z',
  },
  {
    id: 'chat-8',
    activityType: 'social',
    title: 'After en el Centro',
    previewText: 'Todavía no se apunta nadie',
    timeLabel: '5m',
    memberCount: 1,
    isHost: true,
    status: PlanStatus.ACTIVE,
  },
]

export function getActiveChats(chats: ChatListItem[] = mockChats): ChatListItem[] {
  return chats.filter(c => isPlanActive(c.status))
}

export function getExpiredChats(chats: ChatListItem[] = mockChats): ChatListItem[] {
  return chats.filter(c => isPlanExpired(c.status) && !isChatArchived(c))
}

export function getArchivedChats(chats: ChatListItem[] = mockChats): ChatListItem[] {
  return chats.filter(c => isPlanExpired(c.status) && isChatArchived(c))
}

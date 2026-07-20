import { PlanActivityType } from '@/types'

export type ChatListItem = {
  id: string
  activityType: PlanActivityType
  title: string
  previewText: string
  timeLabel: string
  memberCount: number
  isHost: boolean
  status: 'active' | 'finalized'
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
    status: 'active',
  },
  {
    id: 'chat-2',
    activityType: 'playa',
    title: 'Playa Blanca mañana',
    previewText: 'Llevo nevera y snorkel 🏖️',
    timeLabel: '1h',
    memberCount: 3,
    isHost: false,
    status: 'active',
  },
  {
    id: 'chat-3',
    activityType: 'comida',
    title: 'Ceviche en Bazurto',
    previewText: 'Ya reservé mesa para 6',
    timeLabel: 'Ayer',
    memberCount: 6,
    isHost: true,
    status: 'active',
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
    status: 'active',
  },

  {
    id: 'chat-5',
    activityType: 'cultura',
    title: 'Tour Centro Histórico',
    previewText: "Estuvo muy bueno el tour, pero aún me gustaría ir a la playa",
    timeLabel: 'Lun',
    memberCount: 4,
    isHost: false,
    status: 'finalized',
  },
]

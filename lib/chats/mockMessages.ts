export type ChatMessage = {
  id: string
  type: 'user' | 'system'
  content: string
  timeLabel: string
  isOwn?: boolean
  sender?: {
    name: string
    initials: string
    bg: string
    text: string
  }
}

const AVATAR_PALETTE = [
  { bg: '#E1F5EE', text: '#0F6E56' },
  { bg: '#FBEAF0', text: '#993556' },
  { bg: '#E6F1FB', text: '#185FA5' },
  { bg: '#FAEEDA', text: '#BA7517' },
  { bg: '#EEEDFE', text: '#534AB7' },
] as const

function avatar(index: number) {
  const palette = AVATAR_PALETTE[index % AVATAR_PALETTE.length]
  return (name: string, initials: string) => ({
    name,
    initials,
    bg: palette.bg,
    text: palette.text,
  })
}

const mariana = avatar(0)('Mariana', 'M')
const jorge = avatar(1)('Jorge', 'J')
const camila = avatar(2)('Camila', 'C')
const andres = avatar(3)('Andrés', 'A')
const lucia = avatar(4)('Lucía', 'L')

export const mockMessagesByChat: Record<string, ChatMessage[]> = {
  'chat-1': [
    {
      id: 'm1-1',
      type: 'system',
      content: 'Mariana se apuntó al parche',
      timeLabel: '10:02',
    },
    {
      id: 'm1-2',
      type: 'system',
      content: 'Jorge se apuntó al parche',
      timeLabel: '10:05',
    },
    {
      id: 'm1-3',
      type: 'user',
      content: '¿Nos vemos en la puerta a las 9?',
      timeLabel: '10:18',
      sender: jorge,
    },
    {
      id: 'm1-4',
      type: 'user',
      content: 'Sí, llego tipo 8:45 para pillar buen sitio',
      timeLabel: '10:20',
      isOwn: true,
    },
    {
      id: 'm1-5',
      type: 'user',
      content: 'Yo llevo la lista, avisen si falta algo',
      timeLabel: '10:22',
      sender: mariana,
    },
  ],
  'chat-2': [
    {
      id: 'm2-1',
      type: 'system',
      content: 'Camila se apuntó al parche',
      timeLabel: '08:30',
    },
    {
      id: 'm2-2',
      type: 'user',
      content: 'Llevo nevera y snorkel 🏖️',
      timeLabel: '08:45',
      sender: camila,
    },
    {
      id: 'm2-3',
      type: 'user',
      content: 'Genial, yo confirmo transporte',
      timeLabel: '08:50',
      isOwn: true,
    },
  ],
  'chat-3': [
    {
      id: 'm3-1',
      type: 'system',
      content: 'Andrés se apuntó al parche',
      timeLabel: '18:00',
    },
    {
      id: 'm3-2',
      type: 'user',
      content: 'Ya reservé mesa para 6',
      timeLabel: '18:12',
      isOwn: true,
    },
    {
      id: 'm3-3',
      type: 'user',
      content: 'Perfecto, llego directo del trabajo',
      timeLabel: '18:15',
      sender: andres,
    },
  ],
  'chat-4': [
    {
      id: 'm4-1',
      type: 'system',
      content: 'Lucía se apuntó al parche',
      timeLabel: '16:00',
    },
    {
      id: 'm4-2',
      type: 'user',
      content:
        'Oye, ¿puedes confirmar si traes los chalecos naranjas y también el balón oficial?',
      timeLabel: '16:10',
      sender: lucia,
    },
    {
      id: 'm4-3',
      type: 'user',
      content: 'Sí, los tengo. Si no hay balón paso por la tienda antes',
      timeLabel: '16:14',
      isOwn: true,
    },
  ],
  'chat-5': [
    {
      id: 'm5-1',
      type: 'system',
      content: 'Mariana se apuntó al parche',
      timeLabel: '09:00',
    },
    {
      id: 'm5-2',
      type: 'system',
      content: 'Jorge se apuntó al parche',
      timeLabel: '09:05',
    },
    {
      id: 'm5-3',
      type: 'user',
      content: 'Nos vemos en la Plaza de la Aduana',
      timeLabel: '09:30',
      sender: jorge,
    },
    {
      id: 'm5-4',
      type: 'user',
      content: 'Estuvo muy bueno el tour',
      timeLabel: '12:40',
      isOwn: true,
    },
    {
      id: 'm5-5',
      type: 'user',
      content: 'Sí, el guía estuvo excelente',
      timeLabel: '12:45',
      sender: mariana,
    },
    {
      id: 'm5-6',
      type: 'system',
      content: 'El parche pasó',
      timeLabel: '13:00',
    },
  ],
}

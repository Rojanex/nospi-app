export type Participant = {
  id: string
  name: string
  initials: string
  avatarBg: string
  avatarText: string
  role: 'host' | 'member'
  isSelf: boolean
}

const AVATAR_PALETTE = [
  { bg: '#E1F5EE', text: '#0F6E56' },
  { bg: '#FBEAF0', text: '#993556' },
  { bg: '#E6F1FB', text: '#185FA5' },
  { bg: '#FAEEDA', text: '#BA7517' },
  { bg: '#EEEDFE', text: '#534AB7' },
] as const

function participant(
  id: string,
  name: string,
  initials: string,
  paletteIndex: number,
  role: 'host' | 'member',
  isSelf = false,
): Participant {
  const palette = AVATAR_PALETTE[paletteIndex % AVATAR_PALETTE.length]
  return {
    id,
    name,
    initials,
    avatarBg: palette.bg,
    avatarText: palette.text,
    role,
    isSelf,
  }
}

const selfHost = (paletteIndex: number) =>
  participant('self', 'Alex', 'A', paletteIndex, 'host', true)

const selfMember = (paletteIndex: number) =>
  participant('self', 'Alex', 'A', paletteIndex, 'member', true)

export const mockParticipantsByChat: Record<string, Participant[]> = {
  'chat-1': [
    selfHost(3),
    participant('p-mariana', 'Mariana', 'M', 0, 'member'),
    participant('p-jorge', 'Jorge', 'J', 1, 'member'),
    participant('p-camila', 'Camila', 'C', 2, 'member'),
  ],
  'chat-2': [
    participant('p-camila', 'Camila', 'C', 2, 'host'),
    selfMember(3),
    participant('p-andres', 'Andrés', 'A', 3, 'member'),
  ],
  'chat-3': [
    selfHost(3),
    participant('p-andres', 'Andrés', 'A', 3, 'member'),
    participant('p-mariana', 'Mariana', 'M', 0, 'member'),
    participant('p-jorge', 'Jorge', 'J', 1, 'member'),
    participant('p-camila', 'Camila', 'C', 2, 'member'),
    participant('p-lucia', 'Lucía', 'L', 4, 'member'),
  ],
  'chat-4': [
    selfHost(3),
    participant('p-lucia', 'Lucía', 'L', 4, 'member'),
    participant('p-jorge', 'Jorge', 'J', 1, 'member'),
    participant('p-camila', 'Camila', 'C', 2, 'member'),
    participant('p-mariana', 'Mariana', 'M', 0, 'member'),
  ],
  'chat-5': [
    participant('p-mariana', 'Mariana', 'M', 0, 'host'),
    selfMember(3),
    participant('p-jorge', 'Jorge', 'J', 1, 'member'),
    participant('p-camila', 'Camila', 'C', 2, 'member'),
  ],
  'chat-6': [
    selfHost(3),
    participant('p-andres', 'Andrés', 'A', 3, 'member'),
    participant('p-lucia', 'Lucía', 'L', 4, 'member'),
  ],
  'chat-7': [
    participant('p-jorge', 'Jorge', 'J', 1, 'host'),
    selfMember(3),
  ],
  'chat-8': [selfHost(3)],
}

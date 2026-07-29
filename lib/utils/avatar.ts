const AVATAR_PALETTE = [
  { bg: '#E1F5EE', text: '#0F6E56' },
  { bg: '#FBEAF0', text: '#993556' },
  { bg: '#E6F1FB', text: '#185FA5' },
  { bg: '#FAEEDA', text: '#BA7517' },
  { bg: '#EEEDFE', text: '#534AB7' },
] as const

export function avatarColorsForIndex(index: number) {
  return AVATAR_PALETTE[index % AVATAR_PALETTE.length]
}

export function initialsFromName(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export function paletteIndexForId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i)) % AVATAR_PALETTE.length
  }
  return hash
}

export function avatarColorsForId(id: string) {
  return avatarColorsForIndex(paletteIndexForId(id))
}

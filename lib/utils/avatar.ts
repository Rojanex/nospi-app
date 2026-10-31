import { Colors } from '@/assets/constants/Colors'

/** Avatar colors reuse activity tones so they stay in sync with the palette */
const AVATAR_PALETTE = (['social', 'rumba', 'deporte', 'comida', 'cultura'] as const).map((key) => ({
  bg: Colors.activity[key].surface,
  text: Colors.activity[key].accent,
}))

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

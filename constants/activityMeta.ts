import type { PlanActivityType } from '@/types'

export type ActivityMeta = {
  emoji: string
  label: string
  accent: string
  bg: string
  circle: string
}

/** Alias of PlanActivityType for activity-meta call sites */
export type ActivityType = PlanActivityType

export const ACTIVITY_META: Record<PlanActivityType, ActivityMeta> = {
  social:     { emoji: '🥥', label: 'social',     accent: '#0F6E56', bg: '#E1F5EE', circle: '#CADFDA' },
  playa:      { emoji: '🏖️', label: 'playa',      accent: '#E8642A', bg: '#FFF0E8', circle: '#FADDD0' },
  rumba:      { emoji: '🎵', label: 'rumba',       accent: '#993556', bg: '#FBEAF0', circle: '#E9D3DA' },
  deporte:    { emoji: '⚽', label: 'deporte',    accent: '#185FA5', bg: '#E6F1FB', circle: '#CCDCEB' },
  comida:     { emoji: '🍽️', label: 'comida',     accent: '#BA7517', bg: '#FAEEDA', circle: '#F0E1CC' },
  cultura:    { emoji: '🎭', label: 'cultura',    accent: '#534AB7', bg: '#EEEDFE', circle: '#D9D7EF' },
  naturaleza: { emoji: '🌿', label: 'naturaleza', accent: '#3B6D11', bg: '#EAF3DE', circle: '#D4DFCB' },
  otro:       { emoji: '✨', label: 'otro',        accent: '#5F5E5A', bg: '#F1EFE8', circle: '#DCDCDB' },
}

const DEFAULT_META: ActivityMeta = ACTIVITY_META.otro

export function getActivityMeta(type: string): ActivityMeta {
  return ACTIVITY_META[type.toLowerCase() as PlanActivityType] ?? DEFAULT_META
}

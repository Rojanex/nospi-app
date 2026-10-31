import { Colors } from '@/assets/constants/Colors'
import type { PlanActivityType } from '@/types'

export type ActivityMeta = {
  emoji: string
  label: string
  /** Text, icons, borders */
  accent: string
  /** Card / chip background */
  surface: string
  /** Icon circle on top of `surface` */
  surfaceStrong: string
}

/** Alias of PlanActivityType for activity-meta call sites */
export type ActivityType = PlanActivityType

const A = Colors.activity

export const ACTIVITY_META: Record<PlanActivityType, ActivityMeta> = {
  social:     { emoji: '🥥', label: 'social',     ...A.social },
  playa:      { emoji: '🏖️', label: 'playa',      ...A.playa },
  rumba:      { emoji: '🎵', label: 'rumba',      ...A.rumba },
  deporte:    { emoji: '⚽', label: 'deporte',    ...A.deporte },
  comida:     { emoji: '🍽️', label: 'comida',     ...A.comida },
  cultura:    { emoji: '🎭', label: 'cultura',    ...A.cultura },
  naturaleza: { emoji: '🌿', label: 'naturaleza', ...A.naturaleza },
  chill:      { emoji: '🛋️', label: 'chill',      ...A.chill },
  otro:       { emoji: '✨', label: 'otro',       ...A.otro },
}

const DEFAULT_META: ActivityMeta = ACTIVITY_META.otro

export function getActivityMeta(type: string): ActivityMeta {
  return ACTIVITY_META[type.toLowerCase() as PlanActivityType] ?? DEFAULT_META
}

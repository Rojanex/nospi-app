import { Colors } from '@/assets/constants/Colors'
import { ACTIVITY_META, ActivityMeta } from '@/constants/activityMeta'
import { PlanActivityType } from '@/types'

export type PlanGradientTokens = {
  panelGradient: string
  panelBorder: string
  accentColor: string
  hostBubbleBg: string
  /** Color for a 1px border */
  hostBubbleBorder: string
}

function buildTokens(meta: ActivityMeta): PlanGradientTokens {
  return {
    panelGradient: `linear-gradient(45deg, ${Colors.white} 0%, ${meta.bg} 100%)`,
    panelBorder: `${meta.accent}1A`,
    accentColor: meta.accent,
    hostBubbleBg: meta.bg,
    hostBubbleBorder: `${meta.accent}4D`,
  }
}

const TOKENS_BY_TYPE = Object.fromEntries(
  Object.entries(ACTIVITY_META).map(([type, meta]) => [type, buildTokens(meta)]),
) as Record<PlanActivityType, PlanGradientTokens>

/** Accepts a raw `activity_type` (e.g. "rumba|social"); the primary type wins. */
export function getPlanGradientTokens(activityType: string): PlanGradientTokens {
  const primary = activityType.split('|')[0].trim().toLowerCase() as PlanActivityType
  return TOKENS_BY_TYPE[primary] ?? TOKENS_BY_TYPE.otro
}

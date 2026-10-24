import { Colors } from '@/assets/constants/Colors'
import { strings } from '@/constants/strings'
import { VERIFICATION_ENABLED } from '@/lib/env_reader'
import type { UserRole } from '@/types'

export type VerificationBadge = {
  bg: string
  /** Ionicons checkmark, or HatCowboySide for explorers */
  kind: 'check' | 'cowboy'
}

/** `null` while identity verification is disabled: no verification status is shown. */
export function verificationBadgeForRole(role: UserRole): VerificationBadge | null {
  if (!VERIFICATION_ENABLED) return null
  switch (role) {
    case 'visitor':
      return { bg: Colors.activity.blue, kind: 'check' }
    case 'local':
      return { bg: Colors.buttons.orange, kind: 'check' }
    case 'explorer':
    default:
      return { bg: Colors.black[400], kind: 'cowboy' }
  }
}

/** `null` while identity verification is disabled: no verification status is shown. */
export function verificationLabelForRole(role: UserRole): string | null {
  if (!VERIFICATION_ENABLED) return null
  switch (role) {
    case 'visitor':
      return strings.profile.verificationVisitor
    case 'local':
      return strings.profile.verificationLocal
    case 'explorer':
    default:
      return strings.profile.verificationExplorer
  }
}

import { Colors } from '@/assets/constants/Colors'
import { strings } from '@/constants/strings'
import type { UserRole } from '@/types'

export type VerificationBadge = {
  bg: string
  /** Ionicons checkmark, or HatCowboySide for explorers */
  kind: 'check' | 'cowboy'
}

export function verificationBadgeForRole(role: UserRole): VerificationBadge {
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

export function verificationLabelForRole(role: UserRole): string {
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

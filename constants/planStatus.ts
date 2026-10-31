export const PlanStatus = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
} as const

export type PlanStatus = (typeof PlanStatus)[keyof typeof PlanStatus]

export function isPlanActive(status: PlanStatus): boolean {
  return status === PlanStatus.ACTIVE
}

export function isPlanExpired(status: PlanStatus): boolean {
  return status === PlanStatus.EXPIRED
}

export function isChatArchived(item: { archivedAt?: string | null }): boolean {
  return !!item.archivedAt
}

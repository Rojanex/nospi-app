type PlanCreatedListener = () => void
type PlanDeletedListener = (planId: string) => void

const createdListeners = new Set<PlanCreatedListener>()
const deletedListeners = new Set<PlanDeletedListener>()

export function subscribePlanCreated(listener: PlanCreatedListener): () => void {
  createdListeners.add(listener)
  return () => {
    createdListeners.delete(listener)
  }
}

export function notifyPlanCreated(): void {
  createdListeners.forEach(listener => listener())
}

export function subscribePlanDeleted(listener: PlanDeletedListener): () => void {
  deletedListeners.add(listener)
  return () => {
    deletedListeners.delete(listener)
  }
}

export function notifyPlanDeleted(planId: string): void {
  deletedListeners.forEach(listener => listener(planId))
}

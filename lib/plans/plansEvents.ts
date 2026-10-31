type PlanCreatedListener = () => void
type PlanDeletedListener = (planId: string) => void
type PlansChangedListener = () => void

const createdListeners = new Set<PlanCreatedListener>()
const deletedListeners = new Set<PlanDeletedListener>()
const changedListeners = new Set<PlansChangedListener>()

export function subscribePlanCreated(listener: PlanCreatedListener): () => void {
  createdListeners.add(listener)
  return () => {
    createdListeners.delete(listener)
  }
}

export function notifyPlanCreated(): void {
  createdListeners.forEach(listener => listener())
  notifyPlansChanged()
}

export function subscribePlanDeleted(listener: PlanDeletedListener): () => void {
  deletedListeners.add(listener)
  return () => {
    deletedListeners.delete(listener)
  }
}

export function notifyPlanDeleted(planId: string): void {
  deletedListeners.forEach(listener => listener(planId))
  notifyPlansChanged()
}

export function subscribePlansChanged(listener: PlansChangedListener): () => void {
  changedListeners.add(listener)
  return () => {
    changedListeners.delete(listener)
  }
}

export function notifyPlansChanged(): void {
  changedListeners.forEach(listener => listener())
}

type PlanCreatedListener = () => void

const listeners = new Set<PlanCreatedListener>()

export function subscribePlanCreated(listener: PlanCreatedListener): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function notifyPlanCreated(): void {
  listeners.forEach(listener => listener())
}

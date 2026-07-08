import { NEW_PLAN_DESCRIPTION_MAX, NEW_PLAN_TITLE_MAX } from '@/lib/env_reader'
import { NewPlanFormValues, NewPlanLocation, PlanInsertRow } from '@/types'

export const EMPTY_NEW_PLAN_LOCATION: NewPlanLocation = {
  name: '',
  placeId: '',
  lat: null,
  lng: null,
  isPublic: null,
}

export const EMPTY_NEW_PLAN_FORM: NewPlanFormValues = {
  activityType: null,
  title: '',
  description: '',
  location: EMPTY_NEW_PLAN_LOCATION,
  date: null,
  time: null,
  maxSpots: 3,
  visibility: 'open',
}

export function mergePlanDateTime(date: Date, time: Date): string {
  const merged = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.getHours(),
    time.getMinutes(),
    time.getSeconds(),
    time.getMilliseconds(),
  )
  return merged.toISOString()
}

export function isNewPlanFormValid(form: NewPlanFormValues): boolean {
  const titleLen = form.title.trim().length
  if (!form.activityType) return false
  if (titleLen < 3 || titleLen > NEW_PLAN_TITLE_MAX) return false
  if (form.description.length > NEW_PLAN_DESCRIPTION_MAX) return false

  const { location } = form
  if (!location.name.trim()) return false
  if (!location.placeId) return false
  if (location.lat == null || location.lng == null) return false

  if (!form.date || !form.time) return false
  if (new Date(mergePlanDateTime(form.date, form.time)) <= new Date()) return false

  if (form.maxSpots < 2 || form.maxSpots > 5) return false
  if (!form.visibility) return false

  return true
}

export function buildPlanInsert(form: NewPlanFormValues, userId: string): PlanInsertRow {
  const description = form.description.trim()
  return {
    created_by: userId,
    title: form.title.trim(),
    activity_type: form.activityType!,
    description: description.length > 0 ? description : null,
    location_name: form.location.name,
    location_place_id: form.location.placeId,
    location_lat: form.location.lat!,
    location_lng: form.location.lng!,
    date_time: mergePlanDateTime(form.date!, form.time!),
    max_spots: form.maxSpots,
    visibility: form.visibility,
  }
}

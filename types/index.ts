import type { PlanStatus } from '@/constants/planStatus'

export type { PlanStatus }

export type UserRole = 'explorer' | 'visitor' | 'local'

export type Profile = {
  id: string
  phone: string | null
  display_name: string | null
  avatar_url: string | null
  role: UserRole
  plans_created_this_week: number
  plans_joined_this_week: number
  reputation_score: number
  home_city: string | null
  is_founder: boolean
  onboarding_completed: boolean
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export type PlanActivityType =
  | 'social' | 'playa' | 'rumba' | 'deporte'
  | 'comida' | 'cultura' | 'naturaleza' | 'otro'

export type PlanVisibility = 'open' | 'locals'

export type NewPlanLocation = {
  name: string
  placeId: string
  lat: number | null
  lng: number | null
  isPublic: boolean | null
}

export type NewPlanFormValues = {
  activityType: PlanActivityType | null
  title: string
  description: string
  location: NewPlanLocation
  date: Date | null
  time: Date | null
  maxSpots: number
  visibility: PlanVisibility
}

export type PlanInsertRow = {
  created_by: string
  title: string
  activity_type: PlanActivityType
  description: string | null
  location_name: string
  location_place_id: string
  location_lat: number
  location_lng: number
  date_time: string
  max_spots: number
  visibility: PlanVisibility
}

export interface PlanRow {
  id: string
  created_at: string
  created_by: string
  title: string
  activity_type: string
  description: string | null
  location_name: string
  location_place_id: string | null
  location_lat: number
  location_lng: number
  date_time: string
  max_spots: number
  status: PlanStatus
  visibility: string
  completed_at: string | null
  plan_members: {
    user_id: string
    profiles: { display_name: string | null; avatar_url: string | null } | null
  }[]
  host: { display_name: string | null; avatar_url: string | null; role: string } | null
}

export interface Plan {
  id: string
  title: string
  activity_type: string
  location_name: string
  date_time: string
  spots_left: number
  extra_attendees: number
  attendees: { initials: string; avatar_url: string | null; user_id: string }[]
  host_name: string
  host_initials: string
  host_avatar_url: string | null
  host_type: 'local' | 'turista'
  posted_ago: string
  user_joined: boolean
}

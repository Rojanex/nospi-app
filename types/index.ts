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
  status: string
  visibility: string
  completed_at: string | null
  plan_members: {
    user_id: string
    profiles: { display_name: string | null; avatar_url: string | null } | null
  }[]
  profiles: { display_name: string | null; role: string } | null
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
  host_type: 'local' | 'turista'
  posted_ago: string
  user_joined: boolean
}

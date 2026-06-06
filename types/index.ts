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

export interface Plan {
  id: string
  title: string
  activity_type: string
  location_name: string
  date_time: string
  spots_left: number
  is_plan_del_dia: boolean
  attendees: string[]
  extra_attendees: number
  host_name: string
  host_initials: string
  host_type: 'local' | 'turista'
  posted_ago: string
  user_joined: boolean
}

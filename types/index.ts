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

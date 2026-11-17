import type { PlanStatus } from '@/constants/planStatus'

export type { PlanStatus }

/** Row of public.profiles. Every column is safe for other users to read. */
export type Profile = {
  id: string
  display_name: string | null
  avatar_url: string | null
  is_founder: boolean
  /** Optional, typed by the user and not verified. Stored without "@", lowercase. */
  instagram_handle: string | null
  terms_version: string | null
  terms_accepted_at: string | null
  created_at: string
  updated_at: string
}

export interface ApiResponse<T> {
  data: T | null
  error: string | null
}

export type PlanActivityType =
  | 'social' | 'playa' | 'rumba' | 'deporte'
  | 'comida' | 'cultura' | 'naturaleza' | 'chill' | 'otro'

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
  completed_at: string | null
  plan_members: {
    user_id: string
    profiles: { display_name: string | null; avatar_url: string | null } | null
  }[]
  like_count?: number | null
  host: { display_name: string | null; avatar_url: string | null; is_founder: boolean } | null
}

export interface Plan {
  id: string
  title: string
  activity_type: string
  location_name: string
  date_time: string
  spots_left: number
  extra_attendees: number
  attendees: { initials: string; avatar_url: string | null; user_id: string; name: string }[]
  host_id: string
  host_name: string
  host_initials: string
  host_avatar_url: string | null
  host_is_founder: boolean
  posted_ago: string
  user_joined: boolean
  /** The current user created this plan. */
  user_is_host: boolean
  like_count: number
  /** As of this fetch; `null` when the liked state couldn't be loaded. */
  user_liked: boolean | null
  description: string | null
}

export type PlanMessagePreview = {
  id: string
  content: string
  createdAt: string
  /** null when the author deleted their account (previews never include system messages) */
  userId: string | null
  senderName: string
  avatarUrl: string | null
}

export type PlanMetaRow = {
  id: string
  title: string
  activity_type: string
  status: 'active' | 'expired' | 'completed'
  previewText: string
  timeLabel: string
}

export type ChatListItem = {
  id: string
  activityType: PlanActivityType
  title: string
  previewText: string
  timeLabel: string
  /** ISO timestamp of latest message; used for list ordering */
  lastMessageAt?: string | null
  memberCount: number
  isHost: boolean
  status: PlanStatus
  archivedAt?: string | null
}

export type SystemPayload = Record<string, string | number | undefined>

export type ChatMessage = {
  id: string
  type: 'user' | 'system'
  content: string
  createdAt: string
  timeLabel: string
  isOwn?: boolean
  senderId?: string
  sender?: {
    name: string
    initials: string
    bg: string
    text: string
  }
}

export type Participant = {
  id: string
  name: string
  initials: string
  avatarBg: string
  avatarText: string
  avatarUrl: string | null
  role: 'host' | 'member'
  isSelf: boolean
}

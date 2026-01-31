export type EnergyLevel = 'low' | 'medium' | 'high'
export type SessionStatus = 'created' | 'active' | 'dormant' | 'completed' | 'abandoned'

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  nickname: string
  energy: EnergyLevel | null
  availability: string[]
  interests: string[]
  current_trust_level: number
  tasks_completed_total: number
  last_matched_at: string | null
  last_matched_with: string[] | null
  last_task_completed_at: string | null
  created_at: string
}

export interface MatchQueue {
  user_id: string
  energy: EnergyLevel
  availability: string[]
  interests: string[]
  joined_at: string
}

export interface Task {
  id: string
  title: string
  category: string
  min_trust_level: number
  is_active: boolean
}

export interface Session {
  id: string
  status: SessionStatus
  task_id: string | null
  created_at: string
  started_at: string | null
  ended_at: string | null
  ended_by: string | null
  chat_unlocked_at: string | null
  min_chat_time_minutes: number
}

export interface SessionParticipant {
  session_id: string
  user_id: string
  anonymous_name: string
}

export interface SessionMessage {
  id: string
  session_id: string
  user_id: string | null
  content: string
  created_at: string
}

export interface Pairings {
  id: string
  user_1_id: string
  user_2_id: string
  session_id: string
  matched_at: string
}

export interface PairingHistory {
  id: string
  user_1_id: string
  user_2_id: string
  session_id: string
  task_id: string
  matched_at: string
  session_duration_minutes: number | null
  ended_reason: SessionStatus
  user_1_rating: number | null
  user_2_rating: number | null
  would_match_again: boolean | null
}

export interface MatchFeedback {
  id: string
  session_id: string
  reporter_id: string
  reported_user_id: string
  rating: number
  reason: string | null
  category: string
  reported_at: string
}

export interface TaskHistory {
  id: string
  user_id: string
  session_id: string
  task_id: string
  completed_at: string
  was_successful: boolean
  user_rating: number
  feedback: string | null
}

export interface RateLimits {
  user_id: string
  action_type: string
  action_count: number
  window_start: string
}

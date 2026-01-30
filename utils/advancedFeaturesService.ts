import { supabase } from '../lib/supabase'
import type { SessionStatus, MatchFeedback, TaskHistory, PairingHistory } from '../types/database'

export async function transitionSessionState(
  sessionId: string,
  newStatus: SessionStatus,
  endedBy?: string
): Promise<boolean> {
  const { error } = await supabase.rpc('transition_session_state', {
    p_session_id: sessionId,
    p_new_status: newStatus,
    p_ended_by: endedBy || null
  })

  if (error) {
    console.error('Error transitioning session state:', error)
    return false
  }

  return true
}

export async function canMatchAgain(
  userId: string,
  partnerId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_match_again', {
    p_user_id: userId,
    p_partner_id: partnerId
  })

  if (error) {
    console.error('Error checking match cooldown:', error)
    return false
  }

  return data || false
}

export async function haveMetBefore(
  user1Id: string,
  user2Id: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('have_met_before', {
    p_user_1_id: user1Id,
    p_user_2_id: user2Id
  })

  if (error) {
    console.error('Error checking if users met before:', error)
    return false
  }

  return data || false
}

export async function checkRateLimit(
  userId: string,
  actionType: string,
  maxActions: number,
  windowMinutes: number
): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_user_id: userId,
    p_action_type: actionType,
    p_max_actions: maxActions,
    p_window_minutes: windowMinutes
  })

  if (error) {
    console.error('Error checking rate limit:', error)
    return false
  }

  return data || false
}

export async function canSendMessage(
  userId: string,
  sessionId: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('can_send_message', {
    p_user_id: userId,
    p_session_id: sessionId
  })

  if (error) {
    console.error('Error checking if can send message:', error)
    return false
  }

  return data || false
}

export async function checkDailySessionLimit(
  userId: string,
  maxSessions: number = 10
): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_daily_session_limit', {
    p_user_id: userId,
    p_max_sessions: maxSessions
  })

  if (error) {
    console.error('Error checking daily session limit:', error)
    return false
  }

  return data || false
}

export async function getAnonymousName(
  userId: string,
  sessionId: string,
  viewerId: string
): Promise<string> {
  const { data, error } = await supabase.rpc('get_anonymous_name', {
    p_user_id: userId,
    p_session_id: sessionId,
    p_viewer_id: viewerId
  })

  if (error) {
    console.error('Error getting anonymous name:', error)
    return 'Anonymous Peer'
  }

  return data || 'Anonymous Peer'
}

export async function recordTaskCompletion(
  userId: string,
  sessionId: string,
  taskId: string,
  successful: boolean,
  rating: number,
  feedback?: string
): Promise<boolean> {
  const { error } = await supabase.rpc('record_task_completion', {
    p_user_id: userId,
    p_session_id: sessionId,
    p_task_id: taskId,
    p_successful: successful,
    p_rating: rating,
    p_feedback: feedback || null
  })

  if (error) {
    console.error('Error recording task completion:', error)
    return false
  }

  return true
}

export async function updateUserReputation(
  userId: string
): Promise<boolean> {
  const { error } = await supabase.rpc('update_user_reputation', {
    p_user_id: userId
  })

  if (error) {
    console.error('Error updating user reputation:', error)
    return false
  }

  return true
}

export async function submitMatchFeedback(
  sessionId: string,
  reportedUserId: string,
  rating: number,
  reason?: string,
  category?: string
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('No authenticated user')
    return false
  }

  const { error } = await supabase
    .from('match_feedback')
    .insert({
      session_id: sessionId,
      reporter_id: user.id,
      reported_user_id: reportedUserId,
      rating,
      reason: reason || null,
      category: category || 'other'
    })

  if (error) {
    console.error('Error submitting match feedback:', error)
    return false
  }

  await updateUserReputation(reportedUserId)
  return true
}

export async function getTaskHistory(
  userId: string,
  limit: number = 50
): Promise<TaskHistory[]> {
  const { data, error } = await supabase
    .from('task_history')
    .select('*')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching task history:', error)
    return []
  }

  return data || []
}

export async function getPairingHistory(
  userId: string,
  limit: number = 50
): Promise<PairingHistory[]> {
  const { data, error } = await supabase
    .from('pairing_history')
    .select('*')
    .or(`user_1_id.eq.${userId},user_2_id.eq.${userId}`)
    .order('matched_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching pairing history:', error)
    return []
  }

  return data || []
}

export async function getSessionDuration(
  sessionId: string
): Promise<number | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('started_at, ended_at')
    .eq('id', sessionId)
    .single()

  if (error) {
    console.error('Error fetching session duration:', error)
    return null
  }

  if (!data.started_at) return null

  const endTime = data.ended_at ? new Date(data.ended_at) : new Date()
  const startTime = new Date(data.started_at)
  const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000)

  return durationMinutes
}

export async function finalizePairingHistory(
  sessionId: string,
  endedReason: SessionStatus
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('No authenticated user')
    return false
  }

  const duration = await getSessionDuration(sessionId)

  const { error } = await supabase
    .from('pairing_history')
    .update({
      session_duration_minutes: duration,
      ended_reason: endedReason
    })
    .eq('session_id', sessionId)

  if (error) {
    console.error('Error finalizing pairing history:', error)
    return false
  }

  return true
}

export function subscribeToSessionStateChanges(
  sessionId: string,
  callback: (status: SessionStatus) => void
) {
  const channel = supabase
    .channel(`session_state:${sessionId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'sessions',
      filter: `id=eq.${sessionId}`
    }, (payload) => {
      const newStatus = payload.new?.status
      if (newStatus) {
        callback(newStatus as SessionStatus)
      }
    })
    .subscribe()

  return channel
}

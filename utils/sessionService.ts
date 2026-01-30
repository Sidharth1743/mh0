import { supabase } from '../lib/supabase'
import type { Session, SessionParticipant, Task, SessionStatus } from '../types/database'
import { transitionSessionState, finalizePairingHistory, recordTaskCompletion } from './advancedFeaturesService'

export async function getSession(
  sessionId: string
): Promise<Session | null> {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) {
    console.error('Error fetching session:', error)
    return null
  }

  return data
}

export async function getSessionWithDetails(sessionId: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      task:tasks(*),
      participants:session_participants(
        *,
        profile:profiles(id, email, full_name, avatar_url, nickname)
      )
    `)
    .eq('id', sessionId)
    .single()

  if (error) {
    console.error('Error fetching session details:', error)
    return null
  }

  return data
}

export async function getSessionParticipants(
  sessionId: string
): Promise<SessionParticipant[]> {
  const { data, error } = await supabase
    .from('session_participants')
    .select('*')
    .eq('session_id', sessionId)

  if (error) {
    console.error('Error fetching participants:', error)
    return []
  }

  return data || []
}

export async function getActiveSessionForUser(
  userId: string
): Promise<Session | null> {
  const { data, error } = await supabase
    .from('session_participants')
    .select('session_id')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return getSession(data.session_id)
}

export async function getTask(taskId: string): Promise<Task | null> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single()

  if (error) {
    console.error('Error fetching task:', error)
    return null
  }

  return data
}

export async function getAllTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('is_active', true)
    .order('min_trust_level', { ascending: true })

  if (error) {
    console.error('Error fetching tasks:', error)
    return []
  }

  return data || []
}

export async function endSession(
  sessionId: string,
  taskId: string | null,
  successful: boolean = true,
  userRating: number = 5
): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'No authenticated user' }
  }

  const transitioned = await transitionSessionState(sessionId, 'completed', user.id)

  if (!transitioned) {
    return { success: false, error: 'Failed to end session' }
  }

  if (taskId) {
    await recordTaskCompletion(user.id, sessionId, taskId, successful, userRating)
  }

  await finalizePairingHistory(sessionId, 'completed')

  return { success: true }
}

export async function abandonSession(sessionId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('No authenticated user')
    return false
  }

  const transitioned = await transitionSessionState(sessionId, 'abandoned', user.id)

  if (!transitioned) {
    return false
  }

  await finalizePairingHistory(sessionId, 'abandoned')

  return true
}

export async function transitionSession(
  sessionId: string,
  newStatus: SessionStatus
): Promise<boolean> {
  return await transitionSessionState(sessionId, newStatus)
}

export function subscribeToSessionChanges(
  sessionId: string,
  callback: (session: Session) => void
) {
  const subscription = supabase
    .channel(`session:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'sessions',
        filter: `id=eq.${sessionId}`
      },
      (payload) => {
        callback(payload.new as Session)
      }
    )
    .subscribe()

  return subscription
}

export function subscribeToParticipantsChanges(
  sessionId: string,
  callback: (participants: SessionParticipant[]) => void
) {
  const subscription = supabase
    .channel(`session_participants:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'session_participants',
        filter: `session_id=eq.${sessionId}`
      },
      async () => {
        const participants = await getSessionParticipants(sessionId)
        callback(participants)
      }
    )
    .subscribe()

  return subscription
}

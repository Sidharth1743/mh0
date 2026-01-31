import { supabase } from '../lib/supabase'
import type { SessionMessage } from '../types/database'
import { canSendMessage } from './advancedFeaturesService'

export async function sendMessage(
  sessionId: string,
  content: string
): Promise<{ message: SessionMessage | null; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { message: null, error: 'No authenticated user' }
  }

  if (!content.trim()) {
    return { message: null, error: 'Message cannot be empty' }
  }

  const canSend = await canSendMessage(user.id, sessionId)

  if (!canSend) {
    return { message: null, error: 'Rate limit exceeded. Please wait before sending more messages.' }
  }

  const { data, error } = await supabase
    .from('session_messages')
    .insert({
      session_id: sessionId,
      content: content.trim(),
      user_id: user.id
    })
    .select()
    .single()

  if (error) {
    console.error('Error sending message:', error)
    return { message: null, error: 'Failed to send message' }
  }

  return { message: data }
}

export async function getMessages(
  sessionId: string,
  limit: number = 50
): Promise<SessionMessage[]> {
  const { data, error } = await supabase
    .from('session_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching messages:', error)
    return []
  }

  return data || []
}

export function subscribeToMessages(
  sessionId: string,
  callback: (message: SessionMessage) => void
) {
  const subscription = supabase
    .channel(`messages:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'session_messages',
        filter: `session_id=eq.${sessionId}`
      },
      (payload) => {
        callback(payload.new as SessionMessage)
      }
    )
    .subscribe()

  return subscription
}

export function subscribeToSessionMessages(
  sessionId: string,
  callback: (messages: SessionMessage[]) => void
) {
  const subscription = supabase
    .channel(`session_messages:${sessionId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'session_messages',
        filter: `session_id=eq.${sessionId}`
      },
      async () => {
        const messages = await getMessages(sessionId)
        callback(messages)
      }
    )
    .subscribe()

  return subscription
}

export async function getMessagesWithProfiles(
  sessionId: string,
  limit: number = 50
) {
  const { data, error } = await supabase
    .from('session_messages')
    .select(`
      *,
      profile:profiles(id, email, full_name, avatar_url, nickname)
    `)
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching messages with profiles:', error)
    return []
  }

  return data || []
}

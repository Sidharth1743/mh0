import { supabase } from '../lib/supabase'
import type { MatchQueue, EnergyLevel } from '../types/database'
import { getProfile } from './profileService'
import { checkDailySessionLimit, canMatchAgain } from './advancedFeaturesService'

export async function findMatch(): Promise<{ sessionId: string | null; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { sessionId: null, error: 'No authenticated user' }
  }

  const profile = await getProfile(user.id)

  if (!profile) {
    return { sessionId: null, error: 'No profile found' }
  }

  const canStart = await checkDailySessionLimit(user.id, 10)

  if (!canStart) {
    return { sessionId: null, error: 'Daily session limit reached' }
  }

  const { data, error } = await supabase.rpc('find_match', {
    p_energy: profile.energy,
    p_availability: profile.availability,
    p_interests: profile.interests
  })

  if (error) {
    console.error('Error finding match:', error)
    return { sessionId: null, error: 'Match failed' }
  }

  return { sessionId: data }
}

export async function joinMatchQueue(
  energy: EnergyLevel,
  availability: string[],
  interests: string[]
): Promise<{ success: boolean; sessionId: string | null; inQueue: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, sessionId: null, inQueue: false, error: 'No authenticated user' }
  }

  const canStart = await checkDailySessionLimit(user.id, 10)

  if (!canStart) {
    return { success: false, sessionId: null, inQueue: false, error: 'Daily session limit reached' }
  }

  const { data, error } = await supabase.rpc('find_match', {
    p_energy: energy,
    p_availability: availability,
    p_interests: interests
  })

  if (error) {
    console.error('Error finding match:', error)
    return { success: false, sessionId: null, inQueue: false, error: 'Match failed' }
  }

  if (data) {
    return { success: true, sessionId: data, inQueue: false }
  }

  return { success: true, sessionId: null, inQueue: true }
}

export async function leaveMatchQueue(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('match_queue')
    .delete()
    .eq('user_id', userId)

  if (error) {
    console.error('Error leaving match queue:', error)
    return false
  }

  return true
}

export async function getMatchQueueStatus(
  userId: string
): Promise<MatchQueue | null> {
  const { data, error } = await supabase
    .from('match_queue')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    console.error('Error fetching queue status:', error)
    return null
  }

  return data
}

export function subscribeToMatchQueue(
  callback: (queue: MatchQueue[]) => void
) {
  const subscription = supabase
    .channel('match_queue')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'match_queue'
      },
      async () => {
        const { data } = await supabase.from('match_queue').select('*')
        callback(data || [])
      }
    )
    .subscribe()

  return subscription
}

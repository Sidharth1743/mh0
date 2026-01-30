import { supabase } from '../lib/supabase'
import type { Profile, EnergyLevel } from '../types/database'

export async function getCurrentProfile(): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('No authenticated user')
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

export async function needsOnboarding(): Promise<boolean> {
  const profile = await getCurrentProfile()
  
  if (!profile) {
    return true
  }

  return !profile.energy || !profile.availability || !profile.interests
}

export async function updateProfile(
  userId: string,
  updates: Partial<Profile>
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }

  return data
}

export async function updateEnergyLevel(
  userId: string,
  energy: EnergyLevel
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ energy })
    .eq('id', userId)

  if (error) {
    console.error('Error updating energy level:', error)
    return false
  }

  return true
}

export async function updateAvailability(
  userId: string,
  availability: string[]
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ availability })
    .eq('id', userId)

  if (error) {
    console.error('Error updating availability:', error)
    return false
  }

  return true
}

export async function updateVibe(
  energy: EnergyLevel,
  availability: string[],
  interests: string[]
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    console.error('No authenticated user')
    return false
  }

  const { error } = await supabase
    .from('profiles')
    .update({ 
      energy, 
      availability, 
      interests 
    })
    .eq('id', user.id)

  if (error) {
    console.error('Error updating vibe:', error)
    return false
  }

  return true
}

export async function updateInterests(
  userId: string,
  interests: string[]
): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .update({ interests })
    .eq('id', userId)

  if (error) {
    console.error('Error updating interests:', error)
    return false
  }

  return true
}

export async function incrementTasksCompleted(userId: string): Promise<boolean> {
  const { error } = await supabase.rpc('increment_tasks_completed', {
    user_id: userId
  })

  if (error) {
    console.error('Error incrementing tasks completed:', error)
    return false
  }

  return true
}

export function subscribeToProfileChanges(
  userId: string,
  callback: (profile: Profile) => void
) {
  const subscription = supabase
    .channel(`profile:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: `id=eq.${userId}`
      },
      (payload) => {
        callback(payload.new as Profile)
      }
    )
    .subscribe()

  return subscription
}

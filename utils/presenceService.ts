import { supabase } from '../lib/supabase'

export interface PresenceState {
  userId: string
  online_at: string
  typing?: boolean
  inSession?: string
}

export function trackPresence(sessionId: string) {
  const channel = supabase.channel(`session:${sessionId}:presence`)

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      console.log('Presence sync:', state)
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences)
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences)
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          await channel.track({
            userId: user.id,
            online_at: new Date().toISOString(),
            inSession: sessionId
          } as PresenceState)
        }
      }
    })

  return {
    channel,
    async trackTyping(isTyping: boolean) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await channel.track({
          userId: user.id,
          online_at: new Date().toISOString(),
          inSession: sessionId,
          typing: isTyping
        } as PresenceState)
      }
    },
    async untrack() {
      await channel.untrack()
    },
    unsubscribe() {
      channel.unsubscribe()
    }
  }
}

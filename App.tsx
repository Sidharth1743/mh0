import 'react-native-url-polyfill/auto'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import { View, Text, ActivityIndicator } from 'react-native'
import { User } from '@supabase/supabase-js'
import * as Linking from 'expo-linking'

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const handleURL = ({ url }: { url: string }) => {
      console.log('App opened with URL:', url)
      if (url.includes('access_token') || url.includes('error')) {
        const { hostname, searchParams } = new URL(url)
        console.log('OAuth callback received:', { hostname, searchParams })
      }
    }

    const subscription2 = Linking.addEventListener('url', handleURL)

    return () => {
      subscription.unsubscribe()
      subscription2.remove()
    }
  }, [])

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    )
  }

  return (
    <View>
      {user ? (
        <View style={{ padding: 20 }}>
          <Text>Welcome!</Text>
          <Text>User ID: {user.id}</Text>
          <Text>Email: {user.email}</Text>
        </View>
      ) : (
        <Auth />
      )}
    </View>
  )
}

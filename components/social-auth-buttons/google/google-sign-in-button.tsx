import { Platform } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import * as AuthSession from 'expo-auth-session'
import { supabase } from '../../../lib/supabase'
import { Button } from '@rneui/themed'

WebBrowser.maybeCompleteAuthSession()

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://www.googleapis.com/oauth2/v4/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
}

export default function GoogleSignInButton() {
  async function signInWithGoogle() {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: undefined,
      path: 'auth/callback',
    })

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUri,
        skipBrowserRedirect: false,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })

    if (error) {
      console.error('Error signing in with Google:', error)
      return
    }

    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url)
      
      if (result.type === 'success') {
        const { url } = result
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        } else {
          console.log('Session:', data)
        }
      }
    }
  }

  return (
    <Button
      title="Sign in with Google"
      buttonStyle={{ backgroundColor: '#4285F4' }}
      onPress={signInWithGoogle}
    />
  )
}

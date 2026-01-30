import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConvexProvider, ConvexReactClient, useMutation } from "convex/react";
import { useColorScheme } from 'react-native';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!);

export {
    // Catch any errors thrown by the Layout component.
    ErrorBoundary
} from 'expo-router';

export const unstable_settings = {
    // Ensure that reloading on `/modal` keeps a back button present.
    initialRouteName: 'onboarding',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const [loaded, error] = useFonts({
        SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
        ...FontAwesome.font,
    });

    // Expo Router uses Error Boundaries to catch errors in the navigation tree.
    useEffect(() => {
        if (error) throw error;
    }, [error]);

    useEffect(() => {
        if (loaded) {
            SplashScreen.hideAsync();
        }
    }, [loaded]);

    if (!loaded) {
        return null;
    }

    return <RootLayoutNav />;
}

function AuthWrapper({ children }: { children: React.ReactNode }) {
    const linkSupabaseAccount = useMutation(api.users.linkSupabaseAccount);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user?.id) {
                const convexUserId = await AsyncStorage.getItem('convex_user_id');
                if (convexUserId) {
                    await linkSupabaseAccount({
                        userId: convexUserId as Id<"users">,
                        supabaseUid: session.user.id
                    });
                    console.log('Linked Supabase account to Convex:', session.user.id);
                }
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    return <>{children}</>;
}

function RootLayoutNav() {
    const colorScheme = useColorScheme();

    return (
        <ConvexProvider client={convex}>
            <AuthWrapper>
                <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                    <Stack>
                        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                    </Stack>
                </ThemeProvider>
            </AuthWrapper>
        </ConvexProvider>
    );
}

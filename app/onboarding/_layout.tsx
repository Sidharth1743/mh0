import { Stack } from 'expo-router';

export default function OnboardingLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="value-prop" />
            <Stack.Screen name="interests" />
            <Stack.Screen name="vibe" />
            <Stack.Screen name="availability" />
            <Stack.Screen name="matching-tease" />
        </Stack>
    );
}

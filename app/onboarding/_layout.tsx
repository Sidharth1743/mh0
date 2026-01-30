import { Stack } from 'expo-router';
import { createContext, useContext, useState } from 'react';

interface OnboardingData {
    interests: string[];
    vibe: string | null;
    availability: string | null;
}

interface OnboardingContextType {
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (!context) throw new Error('useOnboarding must be used within OnboardingProvider');
    return context;
};

export default function OnboardingLayout() {
    const [data, setData] = useState<OnboardingData>({
        interests: [],
        vibe: null,
        availability: null,
    });

    const updateData = (updates: Partial<OnboardingData>) => {
        setData(prev => ({ ...prev, ...updates }));
    };

    return (
        <OnboardingContext.Provider value={{ data, updateData }}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="value-prop" />
                <Stack.Screen name="interests" />
                <Stack.Screen name="vibe" />
                <Stack.Screen name="availability" />
                <Stack.Screen name="matching-tease" />
            </Stack>
        </OnboardingContext.Provider>
    );
}

import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated';

export const useBuddyAnimations = () => {
    const scale = useSharedValue(1);
    const translationY = useSharedValue(0);
    const opacity = useSharedValue(1);
    const [message, setMessage] = useState<string | null>(null);

    const pulse = () => {
        scale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1000 }),
                withTiming(1, { duration: 1000 })
            ),
            -1,
            true
        );
    };

    const react = (type: 'happy' | 'excited' | 'calm' | 'thinking' | 'idle' = 'happy', customMessage?: string) => {
        if (customMessage) setMessage(customMessage);

        switch (type) {
            case 'excited':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                translationY.value = withSpring(-20, { damping: 2 });
                scale.value = withSpring(1.2);
                break;
            case 'calm':
                translationY.value = withSpring(10);
                scale.value = withSpring(0.9);
                break;
            case 'thinking':
                scale.value = withSpring(1.1);
                translationY.value = withTiming(-5, { duration: 500 });
                break;
            case 'happy':
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                scale.value = withSequence(withSpring(1.2), withSpring(1));
                translationY.value = withSpring(-10, { damping: 2 });
                break;
            case 'idle':
            default:
                scale.value = withSpring(1);
                translationY.value = withSpring(0);
                break;
        }
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { translateY: translationY.value }
        ],
        opacity: opacity.value,
    }));

    return {
        scale,
        translationY,
        opacity,
        pulse,
        react,
        animatedStyle,
        message,
        setMessage
    };
};

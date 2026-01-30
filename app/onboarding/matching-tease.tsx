import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeInUp,
    ZoomIn,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BuddyTheme } from '../../constants/BuddyTheme';

const FUN_FACTS = [
    "80% of users complete their first task in <10 min",
    "Most matches happen in under 30 seconds",
    "First collab incoming! 💎",
    "Calculating wavelength overlap...",
    "Synchronizing puzzle pieces..."
];

export default function MatchingTeaseScreen() {
    const [complete, setComplete] = useState(false);
    const [factIndex, setFactIndex] = useState(0);
    const router = useRouter();
    const loadingScale = useSharedValue(1);

    useEffect(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        loadingScale.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1200 }),
                withTiming(1, { duration: 1200 })
            ),
            -1,
            true
        );

        const factInterval = setInterval(() => {
            setFactIndex(prev => (prev + 1) % FUN_FACTS.length);
        }, 1500);

        const timer = setTimeout(() => {
            const level1Tasks = [101, 102, 103, 104, 105, 106, 107, 108];
            const randomId = level1Tasks[Math.floor(Math.random() * level1Tasks.length)];
            setComplete(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

            // Auto-redirect to random task after brief success state
            setTimeout(() => {
                router.replace({
                    pathname: '/task/[id]',
                    params: { id: randomId.toString(), count: '1', level: '1' }
                });
            }, 2000);
        }, 4500);

        return () => {
            clearTimeout(timer);
            clearInterval(factInterval);
        };
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: loadingScale.value }],
    }));

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
            >
                {!complete ? (
                    <Animated.View style={[styles.loaderWrapper, animatedStyle]}>
                        <View style={styles.circle}>
                            <ActivityIndicator size="large" color={BuddyTheme.colors.secondary} />
                        </View>
                        <Text style={styles.title}>Finding Your Perfect Task Co-Pilot...</Text>
                        <Animated.View key={factIndex} entering={FadeInUp} style={styles.factWrapper}>
                            <Text style={styles.factText}>{FUN_FACTS[factIndex]}</Text>
                        </Animated.View>
                    </Animated.View>
                ) : (
                    <Animated.View entering={ZoomIn} style={styles.completeWrapper}>
                        <View style={styles.successContainer}>
                            <Animated.View entering={ZoomIn.delay(300)} style={styles.particleCircle}>
                                <Image source={require('@/assets/images/buddy.png')} style={styles.successFox} />
                            </Animated.View>
                        </View>

                        <Text style={styles.boomTitle}>Boom! Matched.</Text>
                        <Text style={styles.subtitle}>
                            Matched with a mystery partner who shares your vibe. Ready to start your first collab?
                        </Text>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={() => {
                                const level1Tasks = [101, 102, 103, 104, 105, 106, 107, 108];
                                const randomId = level1Tasks[Math.floor(Math.random() * level1Tasks.length)];
                                router.replace({
                                    pathname: '/task/[id]',
                                    params: { id: randomId.toString(), count: '1', level: '1' }
                                });
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>Initializing First Collab...</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BuddyTheme.colors.background,
    },
    content: {
        flexGrow: 1,
        padding: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderWrapper: {
        alignItems: 'center',
    },
    circle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: BuddyTheme.colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 40,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: 2,
        borderColor: BuddyTheme.colors.border,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: BuddyTheme.colors.primary,
        textAlign: 'center',
        marginBottom: 24,
        letterSpacing: -0.5,
    },
    factWrapper: {
        backgroundColor: 'rgba(38, 166, 154, 0.08)',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
    },
    factText: {
        color: BuddyTheme.colors.secondary,
        fontWeight: '700',
        fontSize: 15,
        textAlign: 'center',
    },
    completeWrapper: {
        alignItems: 'center',
        width: '100%',
    },
    successContainer: {
        marginBottom: 32,
    },
    particleCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        backgroundColor: BuddyTheme.colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: BuddyTheme.colors.secondary,
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 10,
    },
    successFox: {
        width: 80,
        height: 80,
        tintColor: '#FFF',
    },
    boomTitle: {
        fontSize: 40,
        fontWeight: '900',
        color: BuddyTheme.colors.primary,
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -1,
    },
    subtitle: {
        fontSize: 18,
        color: BuddyTheme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 28,
    },
    button: {
        backgroundColor: BuddyTheme.colors.primary,
        paddingVertical: 22,
        paddingHorizontal: 48,
        borderRadius: BuddyTheme.borderRadius.lg,
        alignItems: 'center',
        marginTop: 60,
        width: '100%',
        shadowColor: BuddyTheme.colors.primary,
        shadowOpacity: 0.3,
        shadowRadius: 15,
        elevation: 10,
    },
    buttonText: {
        color: BuddyTheme.colors.surface,
        fontSize: 18,
        fontWeight: '900',
    },
});

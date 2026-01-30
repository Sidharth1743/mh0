import { api } from '@/convex/_generated/api';
import { Id } from '@/convex/_generated/dataModel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMutation, useQuery } from 'convex/react';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
import { useOnboarding } from './_layout';

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
    const { data } = useOnboarding();

    // Convex Mutations/Queries
    const updateUserPrefs = useMutation(api.users.updateUserPrefs);
    const findMatch = useMutation(api.users.findMatch);

    // Watch for match!
    const [matchDetails, setMatchDetails] = useState<Id<"matches"> | null>(null);
    const [myUserId, setMyUserId] = useState<Id<"users"> | null>(null);
    const [readyToListen, setReadyToListen] = useState(false);

    // Only query for matches once we have cleaned up old ones
    const activeMatchId = useQuery(api.users.getMyMatch, (myUserId && readyToListen) ? { userId: myUserId } : "skip");

    useEffect(() => {
        if (activeMatchId) {
            console.log('Real-time match detected:', activeMatchId);
            setMatchDetails(activeMatchId);
            setComplete(true);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
    }, [activeMatchId, readyToListen]);

    const cancelAllMatches = useMutation(api.users.cancelAllActiveMatches);

    const performMatching = async () => {
        try {
            console.log('Beginning matching process...');
            // 1. Get the userId we created in index.tsx
            const userIdStr = await AsyncStorage.getItem('convex_user_id');
            console.log('Retrieved stored User ID:', userIdStr);

            if (!userIdStr) {
                console.error('CRITICAL: No Convex User ID found in storage');
                router.replace('/onboarding');
                return;
            }
            const userId = userIdStr as Id<"users">;
            setMyUserId(userId);
            console.log('Listening for matches for user:', userId);

            // 0. RESET STATE: Cancel/End any old matches to avoid stale "resumes"
            // If the user hit "Dive In", they want a FRESH match, not an old one.
            console.log('Cleaning up old sessions...');
            await cancelAllMatches({ userId });
            console.log('Old sessions cleaned. Ready to listen for new matches.');
            setReadyToListen(true);

            // 2. Update prefs (This puts them in the "Matching Pool", isMatching=true)
            console.log('Updating user preferences...');
            await updateUserPrefs({
                userId,
                interests: data.interests,
                energyLevel: data.vibe || 'medium',
                availability: data.availability || 'today'
            });
            console.log('User preferences updated.');

            // 3. Try to find Match proactively
            console.log('Attempting to find a match proactively...');
            const foundMatchId = await findMatch({ userId });
            console.log('Find Match Result:', foundMatchId);

            if (foundMatchId) {
                console.log('Match found immediately/proactively!', foundMatchId);
                setMatchDetails(foundMatchId);
                setComplete(true);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } else {
                console.log('No immediate match. Entering waiting mode...');
            }

        } catch (e) {
            console.error('Matching process encountered an error:', e);
        }
    };

    useEffect(() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        performMatching();

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

        return () => {
            clearInterval(factInterval);
        };
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: loadingScale.value }],
    }));

    const onlineCount = useQuery(api.users.getOnlineUsers) || 0;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.onlineBadge}>
                <View style={styles.onlineDot} />
                <Text style={styles.onlineText}>{onlineCount} Online</Text>
            </View>
            <View style={styles.content}>
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
                                if (matchDetails) {
                                    router.replace(`/task/${matchDetails}`);
                                } else {
                                    router.replace('/(tabs)');
                                }
                            }}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.buttonText}>Jump Into First Task</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BuddyTheme.colors.background,
    },
    content: {
        flex: 1,
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
    onlineBadge: {
        position: 'absolute',
        top: 60, // Below status bar
        left: 24,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255,255,255,0.9)', // More opaque for visibility
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        zIndex: 100, // Higher z-index
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    onlineDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#4ADE80',
        marginRight: 8,
    },
    onlineText: {
        fontSize: 13,
        fontWeight: '700',
        color: BuddyTheme.colors.textSecondary,
    },
});

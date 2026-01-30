import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeIn,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BuddyTheme } from '../../constants/BuddyTheme';

const PulsingLine = ({ delay = 0, style }: { delay?: number, style?: any }) => {
    const opacity = useSharedValue(0.1);

    useEffect(() => {
        opacity.value = withRepeat(
            withSequence(
                withTiming(0.4, { duration: 2000 }),
                withTiming(0.1, { duration: 2000 })
            ),
            -1,
            true
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
    }));

    return <Animated.View style={[styles.connectingLine, animatedStyle, style]} />;
};

export default function WelcomeScreen() {
    const router = useRouter();
    const [foxMessage, setFoxMessage] = useState<string | null>(null);
    const foxScale = useSharedValue(1);
    const foxUnfurl = useSharedValue(0);

    const onFoxPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        foxScale.value = withSequence(
            withSpring(1.2),
            withSpring(1)
        );
        foxUnfurl.value = withTiming(1, { duration: 800 });
        setFoxMessage("You've just unlocked your first connection spark! ✨");
    };

    const foxAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: foxScale.value }],
    }));

    const messageAnimatedStyle = useAnimatedStyle(() => ({
        opacity: foxUnfurl.value,
        transform: [{ translateY: withSpring(foxUnfurl.value * -20) }],
    }));

    const handleGetStarted = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.push('/onboarding/value-prop');
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Background Decorative Constellation */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                <PulsingLine style={{ top: '20%', left: '10%', width: 100, transform: [{ rotate: '45deg' }] }} />
                <PulsingLine style={{ top: '40%', right: '15%', width: 150, transform: [{ rotate: '-30deg' }] }} />
                <PulsingLine style={{ bottom: '30%', left: '20%', width: 80, transform: [{ rotate: '80deg' }] }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.topSection}>
                    <Animated.View entering={FadeInDown.delay(200)}>
                        <Text style={styles.headline}>TaskFriends</Text>
                        <Text style={styles.subheadline}>
                            Friends aren't made by bios. They're made by doing cool stuff together.
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeIn.delay(600)} style={styles.bodyWrapper}>
                        <Text style={styles.bodyText}>
                            Skip the awkward 'hey what's up?' forever. We match you anonymously for short,
                            fun shared tasks and trust grows from there.
                        </Text>
                    </Animated.View>

                    <Animated.View entering={FadeIn.delay(800)} style={styles.teaserWrapper}>
                        <Text style={styles.teaserText}>
                            Ready to skip the small talk?
                        </Text>
                    </Animated.View>
                </View>

                <View style={styles.visualSection}>
                    <Pressable onPress={onFoxPress} style={styles.silhouetteContainer}>
                        <Animated.View style={[styles.silhouetteWrapper, foxAnimatedStyle]}>
                            <Image
                                source={require('@/assets/images/buddy.png')}
                                style={styles.silhouette}
                                resizeMode="contain"
                            />
                        </Animated.View>
                        {foxMessage && (
                            <Animated.View style={[styles.foxMessageBubble, messageAnimatedStyle]}>
                                <Text style={styles.foxMessageText}>{foxMessage}</Text>
                            </Animated.View>
                        )}
                    </Pressable>
                </View>

                <Animated.View entering={FadeInDown.delay(1000)} style={styles.footer}>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleGetStarted}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Dive In – No Small Talk Needed</Text>
                    </TouchableOpacity>
                </Animated.View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BuddyTheme.colors.background,
    },
    connectingLine: {
        position: 'absolute',
        height: 1,
        backgroundColor: BuddyTheme.colors.secondary,
    },
    content: {
        flexGrow: 1,
        paddingHorizontal: 32,
        paddingBottom: 40,
        justifyContent: 'space-between',
    },
    topSection: {
        marginTop: 60,
    },
    headline: {
        fontSize: 44,
        fontWeight: 'bold',
        color: BuddyTheme.colors.primary,
        letterSpacing: -1.5,
        marginBottom: 12,
    },
    subheadline: {
        fontSize: 22,
        fontWeight: '600',
        color: BuddyTheme.colors.textPrimary,
        lineHeight: 30,
        marginBottom: 24,
    },
    bodyWrapper: {
        marginBottom: 20,
    },
    bodyText: {
        fontSize: 17,
        color: BuddyTheme.colors.textSecondary,
        lineHeight: 26,
    },
    teaserWrapper: {
        backgroundColor: 'rgba(38, 166, 154, 0.08)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    teaserText: {
        fontSize: 15,
        fontWeight: '700',
        color: BuddyTheme.colors.secondary,
    },
    visualSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    silhouetteContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    silhouetteWrapper: {
        width: 220,
        height: 220,
        opacity: 0.9,
    },
    silhouette: {
        width: '100%',
        height: '100%',
    },
    foxMessageBubble: {
        position: 'absolute',
        top: -60,
        backgroundColor: BuddyTheme.colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderBottomRightRadius: 2,
        width: 200,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    foxMessageText: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    footer: {
        width: '100%',
    },
    button: {
        backgroundColor: BuddyTheme.colors.secondary,
        paddingVertical: 22,
        borderRadius: BuddyTheme.borderRadius.lg,
        alignItems: 'center',
        shadowColor: BuddyTheme.colors.secondary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 6,
    },
    buttonText: {
        color: BuddyTheme.colors.surface,
        fontSize: 18,
        fontWeight: '800',
    },
});

import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { ArrowRight, Hammer, Shield, Sparkles, Users } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BuddyTheme } from '../../constants/BuddyTheme';

const { width } = Dimensions.get('window');

const CARDS = [
    {
        title: "The Old Way",
        desc: "Profiles first → awkward silence. Swipe, bio, ghosted. Sound familiar?",
        icon: Users,
        accent: '#F1F5F9',
        type: 'old'
    },
    {
        title: "Our Way",
        desc: "Tasks first → instant teamwork. Jump into a quick collab: vote on ideas, solve riddles.",
        icon: Hammer,
        accent: '#E0F2F1',
        teaser: "Your first shared win in under 10 min?"
    },
    {
        title: "Trust Unlocks Magically",
        desc: "Start hidden. Complete tasks → unlock chat, voice, reveals. You control the pace.",
        icon: Shield,
        accent: '#F3E5F5'
    },
    {
        title: "Ready for Adventure?",
        desc: "Pick your interests and watch matches light up. Who's your first task partner?",
        icon: Sparkles,
        accent: '#FFF8E1'
    }
];

export default function ValuePropScreen() {
    const [activeTab, setActiveTab] = useState(0);
    const scrollX = useSharedValue(0);
    const router = useRouter();
    const hasReachedEnd = useRef(false);

    const handleScroll = (event: any) => {
        const scrollOffset = event.nativeEvent.contentOffset.x;
        scrollX.value = scrollOffset;
        const index = Math.round(scrollOffset / width);
        if (index !== activeTab) {
            setActiveTab(index);
            Haptics.selectionAsync();
            if (index === CARDS.length - 1) {
                hasReachedEnd.current = true;
            }
        }
    };

    const foxAnimatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            scrollX.value,
            [0, width * (CARDS.length - 1)],
            [20, -20],
            Extrapolate.CLAMP
        );
        return {
            transform: [{ translateX }],
        };
    });

    const goNext = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        router.push('/onboarding/interests');
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>The TaskFriends Way</Text>
                </View>

                <View style={styles.carouselContainer}>
                    <ScrollView
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
                        style={styles.scroll}
                    >
                        {CARDS.map((card, index) => (
                            <View key={index} style={styles.cardWrapper}>
                                <View style={[styles.card, { backgroundColor: BuddyTheme.colors.surface }]}>
                                    <View style={[styles.iconContainer, { backgroundColor: card.accent }]}>
                                        <card.icon size={42} color={card.type === 'old' ? '#64748B' : BuddyTheme.colors.secondary} />
                                    </View>
                                    <Text style={[styles.cardTitle, card.type === 'old' && { color: '#64748B' }]}>{card.title}</Text>
                                    <Text style={styles.cardDesc}>{card.desc}</Text>
                                    {card.teaser && (
                                        <View style={styles.teaserBadge}>
                                            <Text style={styles.teaserText}>{card.teaser}</Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))}
                    </ScrollView>

                    {/* Parallax Fox Silhouette Background Motif */}
                    <Animated.View style={[styles.parallaxFox, foxAnimatedStyle]} pointerEvents="none">
                        <Image
                            source={require('@/assets/images/buddy.png')}
                            style={styles.foxImage}
                            resizeMode="contain"
                        />
                    </Animated.View>
                </View>

                <View style={styles.footer}>
                    <View style={styles.pagination}>
                        {CARDS.map((_, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.dot,
                                    activeTab === i ? styles.dotActive : null
                                ]}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        style={[
                            styles.button,
                            activeTab < CARDS.length - 1 && styles.buttonDimmed
                        ]}
                        onPress={goNext}
                        disabled={activeTab < CARDS.length - 1}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>
                            {activeTab === CARDS.length - 1 ? "Pick My Interests" : "Swipe to Continue"}
                        </Text>
                        {activeTab === CARDS.length - 1 && <ArrowRight size={20} color="#FFF" style={{ marginLeft: 8 }} />}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: BuddyTheme.colors.background,
    },
    header: {
        paddingTop: 40,
        paddingHorizontal: 32,
        alignItems: 'center',
    },
    title: {
        fontSize: 30,
        fontWeight: '800',
        color: BuddyTheme.colors.primary,
        letterSpacing: -1,
    },
    contentContainer: {
        flexGrow: 1,
    },
    carouselContainer: {
        height: 550,
    },
    scroll: {
        flex: 1,
    },
    cardWrapper: {
        width: width,
        padding: 32,
        justifyContent: 'center',
    },
    card: {
        borderRadius: BuddyTheme.borderRadius.xl,
        padding: 40,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 16 },
        shadowOpacity: 0.1,
        shadowRadius: 32,
        elevation: 8,
        borderWidth: 1.5,
        borderColor: BuddyTheme.colors.border,
        zIndex: 10,
    },
    iconContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 32,
    },
    cardTitle: {
        fontSize: 26,
        fontWeight: '800',
        color: BuddyTheme.colors.primary,
        marginBottom: 16,
        textAlign: 'center',
    },
    cardDesc: {
        fontSize: 18,
        color: BuddyTheme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 28,
    },
    teaserBadge: {
        marginTop: 24,
        backgroundColor: 'rgba(38, 166, 154, 0.1)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
    teaserText: {
        color: BuddyTheme.colors.secondary,
        fontWeight: '700',
        fontSize: 14,
    },
    parallaxFox: {
        position: 'absolute',
        bottom: -40,
        right: 20,
        width: 300,
        height: 300,
        opacity: 0.05,
    },
    foxImage: {
        width: '100%',
        height: '100%',
    },
    footer: {
        padding: 32,
        paddingBottom: 40,
    },
    pagination: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 32,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D1D5DB',
    },
    dotActive: {
        width: 24,
        backgroundColor: BuddyTheme.colors.secondary,
    },
    button: {
        backgroundColor: BuddyTheme.colors.primary,
        paddingVertical: 20,
        borderRadius: BuddyTheme.borderRadius.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonDimmed: {
        opacity: 0.5,
    },
    buttonText: {
        color: BuddyTheme.colors.surface,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

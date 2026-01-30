import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Check, Sparkles } from 'lucide-react-native';
import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BuddyTheme } from '../../constants/BuddyTheme';
import { useOnboarding } from './_layout';

const INTERESTS = [
    { label: 'Music', teaser: 'Ready for collaborative playlists? 🎧' },
    { label: 'Fitness', teaser: 'Find a virtual training partner! 🏋️' },
    { label: 'Software', teaser: 'Riddle battles for logic masters.' },
    { label: 'Literature', teaser: 'Co-curate the ultimate reading list.' },
    { label: 'Culinary', teaser: 'Trade secret ingredients.' },
    { label: 'Gaming', teaser: 'Riddle battles & strategy duos.' },
    { label: 'Cinema', teaser: 'Debate the best plot twists.' },
    { label: 'Exploration', teaser: 'Virtual scavenger hunts await.' },
    { label: 'Design', teaser: 'Moodboard collabs starting soon.' },
    { label: 'Science', teaser: 'Solve mystery experiments.' }
];

import { useBuddyAnimations } from '@/hooks/useBuddyAnimations';

export default function InterestsScreen() {
    const [selected, setSelected] = useState<string[]>([]);
    const [activeTeaser, setActiveTeaser] = useState<string | null>(null);
    const router = useRouter();
    const buddy = useBuddyAnimations();
    const { updateData } = useOnboarding();

    const toggleInterest = (interest: any) => {
        if (selected.includes(interest.label)) {
            setSelected(selected.filter(i => i !== interest.label));
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (selected.length < 5) {
            setSelected([...selected, interest.label]);
            setActiveTeaser(interest.teaser);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

            buddy.react('happy');

            if (selected.length + 1 === 5) {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
                    <Text style={styles.title}>What Gets You Going?</Text>
                    <Text style={styles.subtitle}>
                        Pick 3–5 vibes — these spark your first tasks. No wrong picks. The weirder, the better matches.
                    </Text>
                </Animated.View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
                    {INTERESTS.map((interest, index) => (
                        <Animated.View
                            key={interest.label}
                            entering={FadeInUp.delay(100 + index * 40)}
                        >
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={[
                                    styles.chip,
                                    selected.includes(interest.label) && styles.chipSelected
                                ]}
                                onPress={() => toggleInterest(interest)}
                            >
                                <Text style={[
                                    styles.chipText,
                                    selected.includes(interest.label) && styles.chipTextSelected
                                ]}>
                                    {interest.label}
                                </Text>
                                {selected.includes(interest.label) && (
                                    <View style={styles.checkWrapper}>
                                        <Check size={14} color="#fff" strokeWidth={3} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </ScrollView>

                {activeTeaser && (
                    <Animated.View entering={FadeInUp} style={styles.teaserPopup}>
                        <Sparkles size={16} color={BuddyTheme.colors.secondary} />
                        <Text style={styles.teaserText}>{activeTeaser}</Text>
                    </Animated.View>
                )}

                <View style={styles.footer}>
                    <View style={styles.mascotStatus}>
                        <Animated.View style={[styles.miniFox, buddy.animatedStyle]}>
                            <Image source={require('@/assets/images/buddy.png')} style={styles.foxImage} />
                        </Animated.View>
                        <View style={styles.progressSection}>
                            <Text style={styles.progressLabel}>
                                {selected.length < 3
                                    ? `Need ${3 - selected.length} more pieces`
                                    : selected.length === 5
                                        ? "Solid lineup — ready for epic collabs! 🚀"
                                        : `${selected.length}/5 pieces connected`}
                            </Text>
                            <View style={styles.track}>
                                <View style={[styles.bar, { width: `${(selected.length / 5) * 100}%` }]} />
                            </View>
                        </View>
                    </View>

                    <Animated.View entering={FadeInUp.delay(400)}>
                        <TouchableOpacity
                            style={[styles.button, selected.length < 3 && styles.buttonDisabled]}
                            disabled={selected.length < 3}
                            onPress={() => {
                                updateData({ interests: selected });
                                router.push('/onboarding/vibe');
                            }}
                        >
                            <Text style={styles.buttonText}>Next: Your Energy Style</Text>
                        </TouchableOpacity>
                    </Animated.View>
                </View>
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
        padding: 32,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: BuddyTheme.colors.primary,
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 17,
        color: BuddyTheme.colors.textSecondary,
        lineHeight: 24,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        paddingBottom: 20,
    },
    chip: {
        paddingHorizontal: 22,
        paddingVertical: 16,
        borderRadius: BuddyTheme.borderRadius.full,
        borderWidth: 1.5,
        borderColor: BuddyTheme.colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BuddyTheme.colors.surface,
    },
    chipSelected: {
        backgroundColor: BuddyTheme.colors.secondary,
        borderColor: BuddyTheme.colors.secondary,
        shadowColor: BuddyTheme.colors.secondary,
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    chipText: {
        color: BuddyTheme.colors.textPrimary,
        fontSize: 17,
        fontWeight: '600',
    },
    chipTextSelected: {
        color: BuddyTheme.colors.surface,
    },
    checkWrapper: {
        marginLeft: 10,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 10,
        padding: 2,
    },
    teaserPopup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(38, 166, 154, 0.08)',
        padding: 12,
        borderRadius: 12,
        marginTop: 10,
        marginBottom: 20,
    },
    teaserText: {
        color: BuddyTheme.colors.secondary,
        fontWeight: '700',
        fontSize: 14,
    },
    footer: {
        marginTop: 'auto',
    },
    mascotStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
        marginBottom: 24,
        padding: 16,
        backgroundColor: BuddyTheme.colors.surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: BuddyTheme.colors.border,
    },
    miniFox: {
        width: 50,
        height: 50,
    },
    foxImage: {
        width: '100%',
        height: '100%',
    },
    progressSection: {
        flex: 1,
    },
    progressLabel: {
        fontSize: 14,
        fontWeight: '700',
        color: BuddyTheme.colors.primary,
        marginBottom: 6,
    },
    track: {
        height: 6,
        backgroundColor: BuddyTheme.colors.border,
        borderRadius: 3,
        overflow: 'hidden',
    },
    bar: {
        height: '100%',
        backgroundColor: BuddyTheme.colors.secondary,
    },
    button: {
        backgroundColor: BuddyTheme.colors.primary,
        paddingVertical: 22,
        borderRadius: BuddyTheme.borderRadius.lg,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#CBD5E1',
    },
    buttonText: {
        color: BuddyTheme.colors.surface,
        fontSize: 18,
        fontWeight: '800',
    },
});

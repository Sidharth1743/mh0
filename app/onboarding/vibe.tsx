import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Activity, Wind, Zap } from 'lucide-react-native';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BuddyTheme } from '../../constants/BuddyTheme';

import { useBuddyAnimations } from '@/hooks/useBuddyAnimations';
import { useOnboarding } from './_layout';

const VIBES = [
    { id: 'low', label: 'Calm', icon: Wind, desc: 'Quiet focus, low intensity', feedback: "I'll fetch my slippers! 🐾", reaction: 'calm' },
    { id: 'medium', label: 'Stable', icon: Activity, desc: 'Productive and balanced', feedback: "Perfect—let's keep it steady!", reaction: 'happy' },
    { id: 'high', label: 'Dynamic', icon: Zap, desc: 'High energy, fast-paced', feedback: "Zoomies mode enabled! 🚀", reaction: 'excited' },
];

export default function VibeScreen() {
    const [selected, setSelected] = useState<string | null>(null);
    const router = useRouter();
    const buddy = useBuddyAnimations();
    const { updateData } = useOnboarding();

    const selectVibe = (vibe: any) => {
        setSelected(vibe.id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        buddy.react(vibe.reaction as any);
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
                    <Text style={styles.title}>Match Your Energy</Text>
                    <Text style={styles.subtitle}>
                        We pair similar vibes so tasks flow smoothly. Low = chill votes. High = creative chaos.
                    </Text>
                </Animated.View>

                <View style={styles.options}>
                    {VIBES.map((vibe, index) => (
                        <Animated.View
                            key={vibe.id}
                            entering={FadeInUp.delay(200 + index * 100)}
                        >
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[
                                    styles.option,
                                    selected === vibe.id && styles.optionSelected
                                ]}
                                onPress={() => selectVibe(vibe)}
                            >
                                <View style={[
                                    styles.iconBox,
                                    selected === vibe.id && styles.iconBoxSelected
                                ]}>
                                    <vibe.icon size={28} color={selected === vibe.id ? BuddyTheme.colors.surface : BuddyTheme.colors.primary} />
                                </View>
                                <View style={styles.optionText}>
                                    <Text style={[
                                        styles.optionLabel,
                                        selected === vibe.id && styles.optionLabelSelected
                                    ]}>
                                        {vibe.label}
                                    </Text>
                                    <Text style={styles.optionDesc}>{vibe.desc}</Text>
                                </View>
                                {selected === vibe.id && (
                                    <Animated.View entering={FadeInUp} style={styles.selectedCheck}>
                                        <Zap size={14} color={BuddyTheme.colors.secondary} fill={BuddyTheme.colors.secondary} />
                                    </Animated.View>
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                <View style={styles.visualFeedback}>
                    <Animated.View style={[styles.foxWrapper, buddy.animatedStyle]}>
                        <Image source={require('@/assets/images/buddy.png')} style={styles.foxImage} />
                    </Animated.View>
                    {selected && (
                        <Animated.View entering={FadeInUp} style={styles.feedbackBubble}>
                            <Text style={styles.feedbackText}>
                                {VIBES.find(v => v.id === selected)?.feedback}
                            </Text>
                        </Animated.View>
                    )}
                </View>

                <View style={styles.footer}>
                    <Animated.View entering={FadeInUp.delay(600)}>
                        <TouchableOpacity
                            style={[styles.button, !selected && styles.buttonDisabled]}
                            disabled={!selected}
                            onPress={() => {
                                updateData({ vibe: selected });
                                router.push('/onboarding/availability');
                            }}
                        >
                            <Text style={styles.buttonText}>Next: When You're Free</Text>
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
        marginBottom: 32,
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
    options: {
        gap: 16,
    },
    option: {
        padding: 22,
        borderRadius: BuddyTheme.borderRadius.lg,
        borderWidth: 1.5,
        borderColor: BuddyTheme.colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: BuddyTheme.colors.surface,
        gap: 16,
    },
    optionSelected: {
        borderColor: BuddyTheme.colors.secondary,
        backgroundColor: 'rgba(38, 166, 154, 0.03)',
        transform: [{ translateY: -2 }],
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    iconBox: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: BuddyTheme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconBoxSelected: {
        backgroundColor: BuddyTheme.colors.secondary,
    },
    optionText: {
        flex: 1,
    },
    optionLabel: {
        color: BuddyTheme.colors.textPrimary,
        fontSize: 18,
        fontWeight: '700',
    },
    optionLabelSelected: {
        color: BuddyTheme.colors.secondary,
    },
    optionDesc: {
        color: BuddyTheme.colors.textSecondary,
        fontSize: 15,
        marginTop: 2,
    },
    selectedCheck: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: 'rgba(38, 166, 154, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    visualFeedback: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    foxWrapper: {
        width: 120,
        height: 120,
        opacity: 0.2,
    },
    foxImage: {
        width: '100%',
        height: '100%',
    },
    feedbackBubble: {
        backgroundColor: BuddyTheme.colors.primary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 10,
    },
    feedbackText: {
        color: '#FFF',
        fontWeight: '700',
        fontSize: 14,
    },
    footer: {
        marginTop: 'auto',
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

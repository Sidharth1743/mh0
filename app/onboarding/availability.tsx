import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { Calendar, Clock, Sun, Zap } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    FadeInDown,
    FadeInUp,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BuddyTheme } from '../../constants/BuddyTheme';

const TIMES = [
    { id: '10min', label: '10 Minute Task', desc: 'Short, efficient sync', icon: Zap },
    { id: '30min', label: '30 Minute Session', desc: 'Detailed collaboration', icon: Clock },
    { id: 'today', label: 'Later Today', desc: 'Flexible availability', icon: Sun },
    { id: 'weekend', label: 'Weekend Window', desc: 'Unstructured deep work', icon: Calendar },
];

export default function AvailabilityScreen() {
    const [selected, setSelected] = useState<string | null>(null);
    const router = useRouter();
    const pulse = useSharedValue(1);

    useEffect(() => {
        if (selected) {
            pulse.value = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 1000 }),
                    withTiming(1, { duration: 1000 })
                ),
                -1,
                true
            );
        } else {
            pulse.value = 1;
        }
    }, [selected]);

    const selectTime = (id: string) => {
        setSelected(id);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }],
        opacity: interpolate(pulse.value, [1, 1.1], [0.1, 0.3]),
    }));


    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
                    <Text style={styles.title}>When Can We Start?</Text>
                    <Text style={styles.subtitle}>
                        Pick your window — we'll find ready partners fast. Quick 10-min tasks or weekend deep dives.
                    </Text>
                </Animated.View>

                <View style={styles.options}>
                    {TIMES.map((time, index) => (
                        <Animated.View
                            key={time.id}
                            entering={FadeInUp.delay(200 + index * 100)}
                        >
                            <TouchableOpacity
                                activeOpacity={0.8}
                                style={[
                                    styles.option,
                                    selected === time.id && styles.optionSelected
                                ]}
                                onPress={() => selectTime(time.id)}
                            >
                                <View style={[
                                    styles.iconBox,
                                    selected === time.id && styles.iconBoxSelected
                                ]}>
                                    <time.icon size={26} color={selected === time.id ? BuddyTheme.colors.surface : BuddyTheme.colors.secondary} />
                                </View>
                                <View style={styles.optionText}>
                                    <Text style={[
                                        styles.optionLabel,
                                        selected === time.id && styles.optionLabelSelected
                                    ]}>
                                        {time.label}
                                    </Text>
                                    <Text style={styles.optionDesc}>{time.desc}</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                <View style={styles.visualSection}>
                    {selected && (
                        <>
                            <Animated.View style={[styles.pulseCircle, pulseStyle]} />
                            <Animated.View entering={FadeInUp} style={styles.matchTeaser}>
                                <Text style={styles.teaserText}>Sparks flying... ready to match! 🔥</Text>
                            </Animated.View>
                        </>
                    )}
                    <Image source={require('@/assets/images/buddy.png')} style={styles.fadedFox} />
                </View>

                <View style={styles.footer}>
                    <Animated.View entering={FadeInUp.delay(600)}>
                        <TouchableOpacity
                            style={[styles.button, !selected && styles.buttonDisabled]}
                            disabled={!selected}
                            onPress={() => router.push('/onboarding/matching-tease')}
                        >
                            <Text style={styles.buttonText}>Find My First Task Partner!</Text>
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
        padding: 20,
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
        backgroundColor: 'rgba(38, 166, 154, 0.05)',
        transform: [{ scale: 1.02 }],
    },
    iconBox: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: 'rgba(38, 166, 154, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
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
        fontSize: 14,
        marginTop: 4,
    },
    visualSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    fadedFox: {
        width: 100,
        height: 100,
        opacity: 0.1,
    },
    pulseCircle: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
        borderWidth: 2,
        borderColor: BuddyTheme.colors.secondary,
    },
    matchTeaser: {
        position: 'absolute',
        bottom: 20,
        backgroundColor: BuddyTheme.colors.secondary,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
    },
    teaserText: {
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

import { useRouter } from 'expo-router';
import { Coffee, Rocket, Ship } from 'lucide-react-native';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const VIBES = [
    { id: 'low', label: 'Low', icon: Coffee, desc: 'Chill mode' },
    { id: 'medium', label: 'Medium', icon: Ship, desc: 'Balanced' },
    { id: 'high', label: 'High', icon: Rocket, desc: 'Full energy' },
];

export default function VibeScreen() {
    const [selected, setSelected] = useState<string | null>(null);
    const router = useRouter();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Animated.View entering={FadeInDown.delay(200)}>
                    <Text style={styles.title}>How's your vibe today?</Text>
                    <Text style={styles.subtitle}>We'll match you with someone on the same wavelength.</Text>
                </Animated.View>

                <View style={styles.options}>
                    {VIBES.map((vibe, index) => (
                        <Animated.View
                            key={vibe.id}
                            entering={FadeInUp.delay(300 + index * 100)}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    selected === vibe.id && styles.optionSelected
                                ]}
                                onPress={() => setSelected(vibe.id)}
                            >
                                <vibe.icon size={32} color={selected === vibe.id ? '#FFFFFF' : '#3B82F6'} />
                                <View style={styles.optionText}>
                                    <Text style={[
                                        styles.optionLabel,
                                        selected === vibe.id && styles.optionLabelSelected
                                    ]}>
                                        {vibe.label}
                                    </Text>
                                    <Text style={styles.optionDesc}>{vibe.desc}</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </View>

                <Animated.View entering={FadeInUp.delay(700)}>
                    <TouchableOpacity
                        style={[styles.button, !selected && styles.buttonDisabled]}
                        disabled={!selected}
                        onPress={() => router.push('/onboarding/availability')}
                    >
                        <Text style={styles.buttonText}>Next</Text>
                    </TouchableOpacity>
                </Animated.View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0F172A',
    },
    content: {
        flex: 1,
        padding: 24,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#F8FAFC',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#94A3B8',
        marginBottom: 40,
    },
    options: {
        gap: 16,
        flex: 1,
    },
    option: {
        padding: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#334155',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(51, 65, 85, 0.4)',
        gap: 20,
    },
    optionSelected: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    optionText: {
        flex: 1,
    },
    optionLabel: {
        color: '#CBD5E1',
        fontSize: 20,
        fontWeight: 'bold',
    },
    optionLabelSelected: {
        color: '#FFFFFF',
    },
    optionDesc: {
        color: '#94A3B8',
        fontSize: 14,
    },
    button: {
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonDisabled: {
        backgroundColor: '#1E293B',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

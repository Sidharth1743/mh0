import { useRouter } from 'expo-router';
import { Calendar, Clock, Sun, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const TIMES = [
    { id: '10min', label: 'Right Now', desc: '10 min quick task', icon: Zap },
    { id: '30min', label: '30 min slot', desc: 'Planned window', icon: Clock },
    { id: 'today', label: 'Today', desc: 'Flexible timing', icon: Sun },
    { id: 'weekend', label: 'Weekend', desc: 'Extended session', icon: Calendar },
];

export default function AvailabilityScreen() {
    const [selected, setSelected] = useState<string | null>(null);
    const router = useRouter();

    const handleFinish = () => {
        // In a real app, we would save to Convex here
        router.replace('/(tabs)');
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Animated.View entering={FadeInDown.delay(200)}>
                    <Text style={styles.title}>When are you free?</Text>
                    <Text style={styles.subtitle}>We'll match you with people in the same window.</Text>
                </Animated.View>

                <View style={styles.options}>
                    {TIMES.map((time, index) => (
                        <Animated.View
                            key={time.id}
                            entering={FadeInUp.delay(300 + index * 100)}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.option,
                                    selected === time.id && styles.optionSelected
                                ]}
                                onPress={() => setSelected(time.id)}
                            >
                                <View style={styles.iconContainer}>
                                    <time.icon size={24} color={selected === time.id ? '#FFFFFF' : '#3B82F6'} />
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

                <Animated.View entering={FadeInUp.delay(700)}>
                    <TouchableOpacity
                        style={[styles.button, !selected && styles.buttonDisabled]}
                        disabled={!selected}
                        onPress={handleFinish}
                    >
                        <Text style={styles.buttonText}>Find Buddies</Text>
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
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#334155',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(51, 65, 85, 0.4)',
        gap: 16,
    },
    optionSelected: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionText: {
        flex: 1,
    },
    optionLabel: {
        color: '#CBD5E1',
        fontSize: 18,
        fontWeight: 'bold',
    },
    optionLabelSelected: {
        color: '#FFFFFF',
    },
    optionDesc: {
        color: '#94A3B8',
        fontSize: 13,
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

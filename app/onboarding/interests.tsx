import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

const INTERESTS = [
    'Music', 'Fitness', 'Tech', 'Books', 'Cooking', 'Gaming', 'Movies',
    'Travel', 'Art', 'Science', 'Outdoors', 'Humor', 'DIY', 'Pets', 'Food'
];

export default function InterestsScreen() {
    const [selected, setSelected] = useState<string[]>([]);
    const router = useRouter();

    const toggleInterest = (interest: string) => {
        if (selected.includes(interest)) {
            setSelected(selected.filter(i => i !== interest));
        } else if (selected.length < 5) {
            setSelected([...selected, interest]);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Animated.View entering={FadeInDown.delay(200)}>
                    <Text style={styles.title}>Pick what excites you</Text>
                    <Text style={styles.subtitle}>Select up to 5 interests to help us find your task buddy.</Text>
                </Animated.View>

                <ScrollView contentContainerStyle={styles.grid}>
                    {INTERESTS.map((interest, index) => (
                        <Animated.View
                            key={interest}
                            entering={FadeInUp.delay(300 + index * 50)}
                        >
                            <TouchableOpacity
                                style={[
                                    styles.chip,
                                    selected.includes(interest) && styles.chipSelected
                                ]}
                                onPress={() => toggleInterest(interest)}
                            >
                                <Text style={[
                                    styles.chipText,
                                    selected.includes(interest) && styles.chipTextSelected
                                ]}>
                                    {interest}
                                </Text>
                                {selected.includes(interest) && (
                                    <Check size={16} color="#fff" style={styles.checkIcon} />
                                )}
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
                </ScrollView>

                <Animated.View entering={FadeInUp.delay(800)}>
                    <TouchableOpacity
                        style={[styles.button, selected.length === 0 && styles.buttonDisabled]}
                        disabled={selected.length === 0}
                        onPress={() => router.push('/onboarding/vibe')}
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
        marginBottom: 32,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    chip: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 99,
        borderWidth: 1,
        borderColor: '#334155',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(51, 65, 85, 0.4)',
    },
    chipSelected: {
        backgroundColor: '#3B82F6',
        borderColor: '#3B82F6',
    },
    chipText: {
        color: '#CBD5E1',
        fontSize: 16,
        fontWeight: '500',
    },
    chipTextSelected: {
        color: '#FFFFFF',
    },
    checkIcon: {
        marginLeft: 8,
    },
    button: {
        backgroundColor: '#3B82F6',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: 24,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        backgroundColor: '#1E293B',
        shadowOpacity: 0,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
});

import { useRouter } from 'expo-router';
import { AlignLeft, CheckSquare, Layers, Layout, List, MousePointer2, Zap } from 'lucide-react-native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BuddyTheme } from '../../constants/BuddyTheme';

const TASKS = [
    {
        id: '101',
        title: 'Weekend Vibe Rank',
        description: 'Rank activities from relaxing to active. See where you overlap.',
        icon: List,
        color: '#7C3AED',
        duration: '5 min'
    },
    {
        id: '102',
        title: 'The 15-Min Commute',
        description: 'Pick 3 songs for a short drive. Scarcity forces choice.',
        icon: CheckSquare,
        color: '#26A69A',
        duration: '5 min'
    },
    {
        id: '103',
        title: 'Binary Vibe Check',
        description: 'Coffee or Tea? Mountains or Beach? Quick binary picks.',
        icon: MousePointer2,
        color: '#F59E0B',
        duration: '3 min'
    },
    {
        id: '104',
        title: 'Travel Bucket Sort',
        description: 'Sort items into Must-have, Nice-to-have, or Skip.',
        icon: AlignLeft,
        color: '#3B82F6',
        duration: '5 min'
    },
    {
        id: '105',
        title: 'Node Untangler',
        description: 'Work together to untangle a shared node graph.',
        icon: Layers,
        color: '#EF4444',
        duration: '5 min'
    },
    {
        id: '106',
        title: 'Mood Board Build',
        description: 'Assemble a cozy evening board. No words, just vibe.',
        icon: Layout,
        color: '#EC4899',
        duration: '10 min'
    }
];

export default function TaskSelectScreen() {
    const router = useRouter();

    const handleSelect = (id: string) => {
        // In a real app, this would set the active task in Convex
        router.replace({
            pathname: '/task/[id]',
            params: { id }
        });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                <Animated.View entering={FadeInDown.delay(200)} style={styles.header}>
                    <View style={styles.badge}>
                        <Zap size={14} color={BuddyTheme.colors.secondary} fill={BuddyTheme.colors.secondary} />
                        <Text style={styles.badgeText}>MATCH SECURED</Text>
                    </View>
                    <Text style={styles.title}>Choose Your First Collab</Text>
                    <Text style={styles.subtitle}>
                        Pick a micro-task to start building connection with your partner.
                    </Text>
                </Animated.View>

                <View style={styles.grid}>
                    {TASKS.map((task, index) => (
                        <Animated.View
                            key={task.id}
                            entering={FadeInDown.delay(300 + index * 100)}
                            style={styles.cardWrapper}
                        >
                            <TouchableOpacity
                                style={styles.card}
                                activeOpacity={0.8}
                                onPress={() => handleSelect(task.id)}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: task.color + '15' }]}>
                                    <task.icon size={24} color={task.color} />
                                </View>
                                <Text style={styles.cardTitle}>{task.title}</Text>
                                <Text style={styles.cardDescription}>{task.description}</Text>
                                <View style={styles.cardFooter}>
                                    <Text style={styles.duration}>{task.duration}</Text>
                                </View>
                            </TouchableOpacity>
                        </Animated.View>
                    ))}
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
    scrollContent: {
        padding: 24,
    },
    header: {
        marginBottom: 32,
        alignItems: 'center',
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(38, 166, 154, 0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
        marginBottom: 16,
    },
    badgeText: {
        color: BuddyTheme.colors.secondary,
        fontSize: 12,
        fontWeight: '900',
        letterSpacing: 1,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: BuddyTheme.colors.primary,
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: -0.5,
    },
    subtitle: {
        fontSize: 17,
        color: BuddyTheme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
        paddingHorizontal: 20,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    cardWrapper: {
        width: '48%',
        marginBottom: 16,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 24,
        padding: 20,
        height: 200,
        justifyContent: 'space-between',
        borderWidth: 1.5,
        borderColor: BuddyTheme.colors.border,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 15,
        elevation: 5,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: BuddyTheme.colors.primary,
        marginBottom: 4,
    },
    cardDescription: {
        fontSize: 13,
        color: BuddyTheme.colors.textSecondary,
        lineHeight: 18,
    },
    cardFooter: {
        marginTop: 12,
    },
    duration: {
        fontSize: 12,
        fontWeight: '700',
        color: BuddyTheme.colors.textSecondary,
        backgroundColor: BuddyTheme.colors.background,
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    }
});

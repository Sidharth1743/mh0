import { useRouter } from 'expo-router';
import { Layout, Shield, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BuddyTheme } from '../../constants/BuddyTheme';

export default function TabOneScreen() {
  const [isMatching, setIsMatching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const router = useRouter();

  const startMatching = () => {
    setIsMatching(true);
    setTimeout(() => {
      setMatchFound(true);
      setIsMatching(false);
    }, 2500);
  };

  if (matchFound) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.matchContent}>
          <Animated.View entering={FadeIn} style={styles.matchCard}>
            <Text style={styles.matchLabel}>ACTIVE PARTNERSHIP</Text>
            <Text style={styles.matchTitle}>Session Established</Text>
            <Text style={styles.matchSubtitle}>You are matched with Participant #17</Text>

            <View style={styles.commonContainer}>
              <Text style={styles.commonText}>Shared focus: Literature, Technology</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.taskButton}
              onPress={() => router.push('/task/123')}
            >
              <Text style={styles.buttonText}>Initialize Layer 1 Task</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <View style={styles.statsBadge}>
          <Shield size={16} color={BuddyTheme.colors.secondary} />
          <Text style={styles.statsText}>Layer 1</Text>
        </View>
      </View>

      <View style={styles.main}>
        {isMatching ? (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.matchingState}>
            <ActivityIndicator size="large" color={BuddyTheme.colors.secondary} />
            <Text style={styles.matchingText}>Synchronizing nodes...</Text>
            <Text style={styles.matchingSubtext}>Finding a partner within your wavelength.</Text>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn} style={styles.idleState}>
            <View style={styles.heroCircle}>
              <Layout size={40} color={BuddyTheme.colors.primary} />
            </View>
            <Text style={styles.heroTitle}>Initiate Collaboration</Text>
            <Text style={styles.heroDescription}>
              Anonymous, task-based networking. Trust build through shared execution.
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.findButton}
              onPress={startMatching}
            >
              <Zap size={20} color="#FFF" />
              <Text style={styles.findButtonText}>Find Partner</Text>
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
  header: {
    padding: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BuddyTheme.colors.primary,
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(38, 166, 154, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BuddyTheme.borderRadius.full,
    gap: 8,
  },
  statsText: {
    color: BuddyTheme.colors.secondary,
    fontWeight: '700',
    fontSize: 14,
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  idleState: {
    alignItems: 'center',
  },
  heroCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: BuddyTheme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: BuddyTheme.colors.border,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: BuddyTheme.colors.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 17,
    color: BuddyTheme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 26,
  },
  findButton: {
    backgroundColor: BuddyTheme.colors.primary,
    flexDirection: 'row',
    paddingVertical: 20,
    borderRadius: BuddyTheme.borderRadius.lg,
    alignItems: 'center',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  findButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  matchingState: {
    alignItems: 'center',
    gap: 20,
  },
  matchingText: {
    color: BuddyTheme.colors.primary,
    fontSize: 20,
    fontWeight: '600',
  },
  matchingSubtext: {
    color: BuddyTheme.colors.textSecondary,
    fontSize: 15,
  },
  matchContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 32,
  },
  matchCard: {
    backgroundColor: BuddyTheme.colors.surface,
    padding: 40,
    borderRadius: BuddyTheme.borderRadius.xl,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: BuddyTheme.colors.secondary,
    shadowColor: BuddyTheme.colors.secondary,
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  matchLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: BuddyTheme.colors.secondary,
    letterSpacing: 2,
    marginBottom: 16,
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BuddyTheme.colors.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  matchSubtitle: {
    fontSize: 16,
    color: BuddyTheme.colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  commonContainer: {
    backgroundColor: 'rgba(38, 166, 154, 0.08)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: BuddyTheme.borderRadius.md,
    marginBottom: 40,
  },
  commonText: {
    color: BuddyTheme.colors.secondary,
    fontWeight: '600',
    fontSize: 15,
  },
  taskButton: {
    backgroundColor: BuddyTheme.colors.secondary,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: BuddyTheme.borderRadius.lg,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

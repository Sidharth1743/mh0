import { useRouter } from 'expo-router';
import { Shield, Users, Zap } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function TabOneScreen() {
  const [isMatching, setIsMatching] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const router = useRouter();

  // Simulation of matching process
  const startMatching = () => {
    setIsMatching(true);
    setTimeout(() => {
      setMatchFound(true);
      setIsMatching(false);
    }, 3000);
  };

  if (matchFound) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.matchContent}>
          <Animated.View entering={FadeIn} style={styles.matchCard}>
            <Text style={styles.matchTitle}>Match Found! 🎉</Text>
            <Text style={styles.matchSubtitle}>You're matched with MysticReader17</Text>

            <View style={styles.commonContainer}>
              <Text style={styles.commonText}>You both like: Books, Tech</Text>
            </View>

            <TouchableOpacity
              style={styles.taskButton}
              onPress={() => router.push('/task/123')}
            >
              <Text style={styles.buttonText}>Start Level 1 Task</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>TaskFriends</Text>
        <TouchableOpacity style={styles.statsButton}>
          <Shield size={20} color="#3B82F6" />
          <Text style={styles.statsText}>Level 1</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.main}>
        {isMatching ? (
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.matchingState}>
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text style={styles.matchingText}>Searching for buddies...</Text>
            <Text style={styles.matchingSubtext}>87% of first tasks lead to a second one!</Text>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeIn} style={styles.idleState}>
            <View style={styles.heroIcon}>
              <Users size={48} color="#3B82F6" />
            </View>
            <Text style={styles.heroTitle}>Ready for a task?</Text>
            <Text style={styles.heroDescription}>
              No profiles. No small talk. Just doing stuff together.
            </Text>

            <TouchableOpacity
              style={styles.findButton}
              onPress={startMatching}
            >
              <Zap size={20} color="#FFF" />
              <Text style={styles.buttonText}>Find Buddy</Text>
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
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  statsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
    gap: 6,
  },
  statsText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
  main: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  idleState: {
    alignItems: 'center',
  },
  heroIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 16,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  findButton: {
    backgroundColor: '#3B82F6',
    flexDirection: 'row',
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  matchingState: {
    alignItems: 'center',
    gap: 20,
  },
  matchingText: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '600',
  },
  matchingSubtext: {
    color: '#64748B',
    fontSize: 14,
  },
  matchContent: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  matchCard: {
    backgroundColor: '#1E293B',
    padding: 32,
    borderRadius: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  matchTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F8FAFC',
    marginBottom: 8,
  },
  matchSubtitle: {
    fontSize: 16,
    color: '#94A3B8',
    marginBottom: 24,
  },
  commonContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 99,
    marginBottom: 32,
  },
  commonText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  taskButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
  },
});

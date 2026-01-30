import { Calendar, CheckCircle2, History } from 'lucide-react-native';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BuddyTheme } from '../../constants/BuddyTheme';

const PAST_TASKS = [
  { id: '1', title: 'Architecture Analysis', partner: 'Participant #17', date: 'Jan 28, 2026', reactions: 'Sync Successful' },
  { id: '2', title: 'System Documentation', partner: 'Participant #09', date: 'Jan 28, 2026', reactions: 'Collaborative Excellence' },
];

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Session History</Text>
      </View>

      <FlatList
        data={PAST_TASKS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <History size={48} color={BuddyTheme.colors.textSecondary} />
            <Text style={styles.emptyText}>No historical data available.</Text>
            <Text style={styles.emptySubtext}>Validated sessions will appear here.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 100)}
            style={styles.historyCard}
          >
            <View style={styles.cardHeader}>
              <View style={styles.dateContainer}>
                <Calendar size={14} color={BuddyTheme.colors.textSecondary} />
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
              <View style={styles.statusContainer}>
                <CheckCircle2 size={14} color={BuddyTheme.colors.secondary} />
                <Text style={styles.statusText}>Validated</Text>
              </View>
            </View>

            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.partnerText}>Co-contributor: {item.partner}</Text>

            <View style={styles.footer}>
              <Text style={styles.reactionsText}>{item.reactions}</Text>
            </View>
          </Animated.View>
        )}
      />
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: BuddyTheme.colors.primary,
  },
  listContent: {
    paddingHorizontal: 32,
    gap: 16,
    paddingBottom: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: BuddyTheme.colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    color: BuddyTheme.colors.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  historyCard: {
    backgroundColor: BuddyTheme.colors.surface,
    padding: 24,
    borderRadius: BuddyTheme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: BuddyTheme.colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    color: BuddyTheme.colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    color: BuddyTheme.colors.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  taskTitle: {
    color: BuddyTheme.colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  partnerText: {
    color: BuddyTheme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 20,
  },
  footer: {
    borderTopWidth: 1.5,
    borderTopColor: BuddyTheme.colors.background,
    paddingTop: 16,
  },
  reactionsText: {
    color: BuddyTheme.colors.secondary,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

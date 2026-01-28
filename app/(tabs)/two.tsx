import { Calendar, CheckCircle2, History } from 'lucide-react-native';
import React from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const PAST_TASKS = [
  { id: '1', title: 'Book-Tech Mashup', partner: 'MysticReader17', date: 'Jan 28, 2026', reactions: '👍🔥' },
  { id: '2', title: 'Sci-Fi Gadget Vote', partner: 'MysticReader17', date: 'Jan 28, 2026', reactions: '🚀😂' },
];

export default function HistoryScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>

      <FlatList
        data={PAST_TASKS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <History size={48} color="#334155" />
            <Text style={styles.emptyText}>No tasks completed yet.</Text>
            <Text style={styles.emptySubtext}>Your shared moments will appear here.</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInUp.delay(index * 100)}
            style={styles.historyCard}
          >
            <View style={styles.cardHeader}>
              <View style={styles.dateContainer}>
                <Calendar size={14} color="#64748B" />
                <Text style={styles.dateText}>{item.date}</Text>
              </View>
              <View style={styles.statusContainer}>
                <CheckCircle2 size={14} color="#10B981" />
                <Text style={styles.statusText}>Completed</Text>
              </View>
            </View>

            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.partnerText}>with {item.partner}</Text>

            <View style={styles.footer}>
              <Text style={styles.reactionsText}>Reactions: {item.reactions}</Text>
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
    backgroundColor: '#0F172A',
  },
  header: {
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F8FAFC',
  },
  listContent: {
    padding: 24,
    paddingTop: 0,
    gap: 16,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#64748B',
    fontSize: 14,
    marginTop: 8,
  },
  historyCard: {
    backgroundColor: '#1E293B',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    color: '#64748B',
    fontSize: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  taskTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  partnerText: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 16,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: 12,
  },
  reactionsText: {
    color: '#CBD5E1',
    fontSize: 14,
  },
});

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { getDailyQuote } from '../constants/quotes';
import { DailyTask } from '../types';
import { getUserProfile } from '../services/storage';
import { getLatestScan } from '../services/scanStorage';
import { generateDailyTasks } from '../services/taskGenerator';
import {
  loadDailyTasks,
  saveDailyTasks,
  getYesterdayTaskIds,
  toggleTask,
  getStreakData,
  addXP,
  checkAndUpdateStreak,
  StreakData,
} from '../services/taskStorage';
import TaskCard from '../components/TaskCard';

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export default function HomeScreen() {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [userName, setUserName] = useState('');
  const [streak, setStreak] = useState<StreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastLockedInDate: null,
    totalXP: 0,
  });
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Celebration animation
  const celebrationScale = React.useRef(new Animated.Value(0)).current;

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length || 10;
  const allComplete = completedCount === totalTasks && totalTasks > 0;
  const dailyMaxXP = 200;
  const dailyXP = tasks.reduce((sum, t) => {
    if (!t.completed) return sum;
    if (t.priority === 'high') return sum + 30;
    if (t.priority === 'medium') return sum + 20;
    return sum + 10;
  }, 0);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (allComplete) {
      Animated.spring(celebrationScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }).start();
      // Update streak
      checkAndUpdateStreak(completedCount).then(setStreak);
    } else {
      celebrationScale.setValue(0);
    }
  }, [allComplete]);

  const loadData = async () => {
    setLoading(true);

    // Load user name
    const profile = await getUserProfile();
    if (profile) setUserName(profile.name);

    // Load streak
    const streakData = await getStreakData();
    setStreak(streakData);

    // Load or generate today's tasks
    let todayTasks = await loadDailyTasks();
    if (!todayTasks) {
      const latestScan = await getLatestScan();
      const yesterdayIds = await getYesterdayTaskIds();
      todayTasks = generateDailyTasks(latestScan, yesterdayIds);
      await saveDailyTasks(todayTasks);
    }
    setTasks(todayTasks);
    setLoading(false);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleToggle = async (taskId: string) => {
    const updated = await toggleTask(taskId);
    setTasks(updated);

    // Check streak after each toggle
    const completed = updated.filter((t) => t.completed).length;
    if (completed >= 7) {
      const updatedStreak = await checkAndUpdateStreak(completed);
      setStreak(updatedStreak);
    }
  };

  const handleXPGain = async (points: number) => {
    const updatedStreak = await addXP(points);
    setStreak(updatedStreak);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Loading your mission...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Lock in, <Text style={styles.name}>{userName || 'Champion'}</Text>
          </Text>
          <Text style={styles.date}>{formatDate()}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakCount}>{streak.currentStreak}</Text>
        </View>
      </View>

      {/* XP Bar */}
      <View style={styles.xpRow}>
        <Ionicons name="flash" size={16} color={COLORS.secondary} />
        <Text style={styles.xpText}>{streak.totalXP} XP total</Text>
      </View>

      {/* Daily Progress */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>Today's Progress</Text>
          <Text style={styles.progressCount}>
            {completedCount}/{totalTasks}
          </Text>
        </View>
        <View style={styles.progressBarTrack}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${(completedCount / totalTasks) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* Celebration state */}
      {allComplete && (
        <Animated.View
          style={[
            styles.celebration,
            { transform: [{ scale: celebrationScale }] },
          ]}
        >
          <Text style={styles.celebrationIcon}>🏆</Text>
          <Text style={styles.celebrationTitle}>You're locked in today!</Text>
          <Text style={styles.celebrationSub}>
            All tasks completed. Come back tomorrow to keep the streak alive.
          </Text>
        </Animated.View>
      )}

      {/* Task List */}
      <View style={styles.taskList}>
        <Text style={styles.sectionTitle}>
          {allComplete ? 'Completed Tasks' : "Today's Mission"}
        </Text>
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={handleToggle}
            onXPGain={handleXPGain}
          />
        ))}
      </View>

      {/* Daily XP + Quote */}
      <View style={styles.footer}>
        <View style={styles.dailyXP}>
          <Text style={styles.dailyXPLabel}>Daily XP</Text>
          <Text style={styles.dailyXPValue}>
            {dailyXP}/{dailyMaxXP}
          </Text>
        </View>
        <View style={styles.quoteCard}>
          <Ionicons name="chatbubble-outline" size={16} color={COLORS.textMuted} />
          <Text style={styles.quoteText}>{getDailyQuote()}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: SIZES.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SIZES.md,
  },
  greeting: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.text,
  },
  name: {
    color: COLORS.primary,
  },
  date: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusFull,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  streakEmoji: {
    fontSize: 18,
  },
  streakCount: {
    fontSize: SIZES.fontLg,
    fontWeight: '800',
    color: COLORS.text,
  },
  xpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: SIZES.lg,
  },
  xpText: {
    fontSize: SIZES.fontSm,
    color: COLORS.secondary,
    fontWeight: '600',
  },
  progressSection: {
    marginBottom: SIZES.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.sm,
  },
  progressLabel: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  progressCount: {
    fontSize: SIZES.fontSm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  celebration: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    padding: SIZES.lg,
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  celebrationIcon: {
    fontSize: 48,
    marginBottom: SIZES.sm,
  },
  celebrationTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: '800',
    color: COLORS.secondary,
    marginBottom: SIZES.xs,
  },
  celebrationSub: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  taskList: {
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  footer: {
    gap: SIZES.md,
  },
  dailyXP: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dailyXPLabel: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  dailyXPValue: {
    fontSize: SIZES.fontLg,
    fontWeight: '800',
    color: COLORS.secondary,
  },
  quoteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.sm,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quoteText: {
    flex: 1,
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    lineHeight: 20,
  },
});

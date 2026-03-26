import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { FaceScan } from '../types';
import { getScans } from '../services/scanStorage';
import { getStreakData, StreakData } from '../services/taskStorage';
import { getTodayTotal, getWeeklyTotals } from '../services/waterStorage';
import { calculateLockInScore, LockInScoreBreakdown } from '../services/lockInScore';
import { checkAchievements, Achievement } from '../services/achievements';
import AnimatedCounter from '../components/AnimatedCounter';
import ScoreTrendsChart from '../components/ScoreTrendsChart';
import AchievementBadge from '../components/AchievementBadge';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProgressScreen() {
  const [scans, setScans] = useState<FaceScan[]>([]);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [lockInScore, setLockInScore] = useState<LockInScoreBreakdown | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [compareModal, setCompareModal] = useState(false);
  const [compareIdx, setCompareIdx] = useState<[number, number]>([0, 0]);
  const [refreshing, setRefreshing] = useState(false);
  const [totalWaterGal, setTotalWaterGal] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const scanData = await getScans();
    setScans(scanData);

    const streakData = await getStreakData();
    setStreak(streakData);

    const score = await calculateLockInScore();
    setLockInScore(score);

    const achs = await checkAchievements();
    setAchievements(achs);

    // Calculate total water ever consumed (approximate from weekly)
    const weekly = await getWeeklyTotals();
    const weekTotal = weekly.reduce((s, d) => s + d.totalOz, 0);
    setTotalWaterGal(Math.round(weekTotal / 128 * 10) / 10); // oz to gallons
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openCompare = () => {
    if (scans.length >= 2) {
      setCompareIdx([0, scans.length - 1]);
      setCompareModal(true);
    }
  };

  const totalTasks = streak?.totalXP ? Math.floor(streak.totalXP / 15) : 0; // approximate

  // Empty state
  if (!lockInScore && scans.length === 0) {
    return (
      <View style={[styles.container, styles.emptyContainer]}>
        <Ionicons name="trending-up-outline" size={64} color={COLORS.textMuted} />
        <Text style={styles.emptyTitle}>No Progress Yet</Text>
        <Text style={styles.emptyText}>
          Take your first scan to start tracking your glow-up journey.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary} />
      }
    >
      {/* Lock In Score */}
      <View style={styles.heroSection}>
        <Text style={styles.heroLabel}>LOCK IN SCORE</Text>
        <AnimatedCounter
          target={lockInScore?.total ?? 0}
          duration={2000}
          style={styles.heroScore}
        />
        <Text style={styles.heroDays}>
          🔥 You've been locked in for {lockInScore?.daysActive ?? 0} days
        </Text>
        <View style={styles.scoreBreakdown}>
          <ScorePill label="Tasks" value={lockInScore?.taskComponent ?? 0} max={40} />
          <ScorePill label="Streak" value={lockInScore?.streakComponent ?? 0} max={30} />
          <ScorePill label="Scans" value={lockInScore?.scanComponent ?? 0} max={30} />
        </View>
      </View>

      {/* Photo Timeline */}
      {scans.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Scan Timeline</Text>
            {scans.length >= 2 && (
              <TouchableOpacity onPress={openCompare}>
                <Text style={styles.compareLink}>Compare</Text>
              </TouchableOpacity>
            )}
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.timeline}
          >
            {scans.map((scan, i) => (
              <View key={scan.id} style={styles.timelineItem}>
                <Image
                  source={{ uri: scan.photoUri }}
                  style={styles.timelineThumbnail}
                />
                <Text style={styles.timelineDate}>
                  {new Date(scan.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Text style={styles.timelineScore}>
                  {scan.scores.overallPotential}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Score Trends */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Score Trends</Text>
        <View style={styles.chartCard}>
          <ScoreTrendsChart
            scans={scans}
            width={SCREEN_WIDTH - SIZES.md * 2 - 2}
          />
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Achievements</Text>
        <Text style={styles.achievementCount}>
          {achievements.filter((a) => a.earnedAt).length}/{achievements.length} earned
        </Text>
        <View style={styles.achievementGrid}>
          {achievements.map((a) => (
            <AchievementBadge key={a.id} achievement={a} />
          ))}
        </View>
      </View>

      {/* Stats Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Stats</Text>
        <View style={styles.statsGrid}>
          <StatBox label="Scans" value={scans.length.toString()} icon="scan-outline" />
          <StatBox label="Tasks Done" value={totalTasks.toString()} icon="checkbox-outline" />
          <StatBox label="Water (gal)" value={totalWaterGal.toString()} icon="water-outline" />
          <StatBox label="Best Streak" value={(streak?.longestStreak ?? 0).toString()} icon="flame-outline" />
          <StatBox
            label="Days Active"
            value={(lockInScore?.daysActive ?? 0).toString()}
            icon="calendar-outline"
          />
          <StatBox
            label="Total XP"
            value={(streak?.totalXP ?? 0).toString()}
            icon="flash-outline"
          />
        </View>
      </View>

      {/* Comparison Modal */}
      <Modal visible={compareModal} animationType="slide" onRequestClose={() => setCompareModal(false)}>
        <CompareView
          scans={scans}
          indices={compareIdx}
          onClose={() => setCompareModal(false)}
        />
      </Modal>
    </ScrollView>
  );
}

// ── Sub-components ──────────────────────────────────────────────

function ScorePill({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <View style={styles.pill}>
      <Text style={styles.pillValue}>{value}/{max}</Text>
      <Text style={styles.pillLabel}>{label}</Text>
    </View>
  );
}

function StatBox({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <View style={styles.statBox}>
      <Ionicons name={icon as any} size={20} color={COLORS.primary} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function CompareView({
  scans,
  indices,
  onClose,
}: {
  scans: FaceScan[];
  indices: [number, number];
  onClose: () => void;
}) {
  const [before, after] = [scans[indices[0]], scans[indices[1]]];
  if (!before || !after) return null;

  const metrics: { key: keyof FaceScan['scores']; label: string }[] = [
    { key: 'symmetry', label: 'Symmetry' },
    { key: 'jawlineDefinition', label: 'Jawline' },
    { key: 'facialDefinition', label: 'Definition' },
    { key: 'skinClarity', label: 'Skin' },
    { key: 'overallPotential', label: 'Overall' },
  ];

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <ScrollView style={styles.compareContainer} contentContainerStyle={styles.compareContent}>
      <View style={styles.compareHeader}>
        <Text style={styles.compareTitle}>Compare Scans</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={28} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.comparePhotos}>
        <View style={styles.comparePhotoWrap}>
          <Image source={{ uri: before.photoUri }} style={styles.comparePhoto} />
          <Text style={styles.compareDate}>{formatDate(before.timestamp)}</Text>
          <Text style={styles.compareLabel}>Before</Text>
        </View>
        <View style={styles.comparePhotoWrap}>
          <Image source={{ uri: after.photoUri }} style={styles.comparePhoto} />
          <Text style={styles.compareDate}>{formatDate(after.timestamp)}</Text>
          <Text style={styles.compareLabel}>After</Text>
        </View>
      </View>

      <View style={styles.compareDeltas}>
        {metrics.map((m) => {
          const bVal = before.scores[m.key];
          const aVal = after.scores[m.key];
          if (typeof bVal !== 'number' || typeof aVal !== 'number') return null;
          const delta = aVal - bVal;
          const color = delta >= 0 ? COLORS.success : COLORS.error;
          return (
            <View key={m.key} style={styles.compareDeltaRow}>
              <Text style={styles.compareDeltaLabel}>{m.label}</Text>
              <Text style={styles.compareDeltaValues}>
                {bVal} → {aVal}
              </Text>
              <Text style={[styles.compareDeltaChange, { color }]}>
                {delta >= 0 ? '+' : ''}{delta}
              </Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ── Styles ──────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.xl,
    gap: SIZES.md,
  },
  emptyTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.text,
  },
  emptyText: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: SIZES.md,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  heroLabel: {
    fontSize: SIZES.fontXs,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 2,
    marginBottom: SIZES.sm,
  },
  heroScore: {
    fontSize: 72,
    fontWeight: '800',
    color: COLORS.text,
  },
  heroDays: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    marginTop: SIZES.xs,
    marginBottom: SIZES.md,
  },
  scoreBreakdown: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  pill: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusFull,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillValue: {
    fontSize: SIZES.fontSm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  pillLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  section: {
    marginBottom: SIZES.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  sectionTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  compareLink: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.primary,
  },
  timeline: {
    gap: SIZES.sm,
    paddingVertical: SIZES.xs,
  },
  timelineItem: {
    alignItems: 'center',
    width: 80,
  },
  timelineThumbnail: {
    width: 70,
    height: 70,
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  timelineDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  timelineScore: {
    fontSize: SIZES.fontSm,
    fontWeight: '700',
    color: COLORS.primary,
  },
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.sm,
  },
  achievementCount: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
    marginBottom: SIZES.sm,
    marginTop: -SIZES.xs,
  },
  achievementGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  statBox: {
    width: (SCREEN_WIDTH - SIZES.md * 2 - SIZES.sm * 2) / 3,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.sm,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: SIZES.fontLg,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  // Compare Modal
  compareContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  compareContent: {
    paddingTop: 60,
    paddingHorizontal: SIZES.md,
    paddingBottom: 40,
  },
  compareHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  compareTitle: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.text,
  },
  comparePhotos: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginBottom: SIZES.lg,
  },
  comparePhotoWrap: {
    flex: 1,
    alignItems: 'center',
  },
  comparePhoto: {
    width: '100%',
    aspectRatio: 0.75,
    borderRadius: SIZES.radiusMd,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  compareDate: {
    fontSize: SIZES.fontXs,
    color: COLORS.textMuted,
    marginTop: SIZES.xs,
  },
  compareLabel: {
    fontSize: SIZES.fontSm,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  compareDeltas: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.md,
  },
  compareDeltaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SIZES.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  compareDeltaLabel: {
    flex: 1,
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  compareDeltaValues: {
    fontSize: SIZES.fontSm,
    color: COLORS.text,
    marginRight: SIZES.md,
  },
  compareDeltaChange: {
    fontSize: SIZES.fontSm,
    fontWeight: '700',
    minWidth: 35,
    textAlign: 'right',
  },
});

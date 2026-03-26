import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  RefreshControl,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, DEFAULT_WATER_GOAL_OZ } from '../constants';
import { WaterEntry } from '../types';
import { getUserProfile } from '../services/storage';
import {
  addWaterEntry,
  getEntriesToday,
  deleteEntry,
  getWeeklyTotals,
  DailyTotal,
} from '../services/waterStorage';
import WaterProgressRing from '../components/WaterProgressRing';
import WeeklyWaterChart from '../components/WeeklyWaterChart';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function WaterScreen() {
  const [entries, setEntries] = useState<WaterEntry[]>([]);
  const [goalOz, setGoalOz] = useState(DEFAULT_WATER_GOAL_OZ);
  const [weeklyData, setWeeklyData] = useState<DailyTotal[]>([]);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customAmount, setCustomAmount] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const totalOz = entries.reduce((sum, e) => sum + e.amountOz, 0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const profile = await getUserProfile();
    if (profile?.waterGoalOz) setGoalOz(profile.waterGoalOz);

    const todayEntries = await getEntriesToday();
    setEntries(todayEntries);

    const weekly = await getWeeklyTotals();
    setWeeklyData(weekly);
  };

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleAdd = async (oz: number) => {
    if (oz <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await addWaterEntry(oz);
    await loadData();
  };

  const handleCustomAdd = async () => {
    const oz = parseInt(customAmount, 10);
    if (isNaN(oz) || oz <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid number of ounces.');
      return;
    }
    await handleAdd(oz);
    setCustomAmount('');
    setShowCustomModal(false);
  };

  const handleDelete = (entry: WaterEntry) => {
    Alert.alert(
      'Delete Entry',
      `Remove ${entry.amountOz} oz logged at ${formatTime(entry.timestamp)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteEntry(entry.id);
            await loadData();
          },
        },
      ]
    );
  };

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
      <Text style={styles.header}>Water Tracker</Text>

      {/* Progress Ring */}
      <View style={styles.ringSection}>
        <WaterProgressRing currentOz={totalOz} goalOz={goalOz} />
      </View>

      {/* Quick-Add Buttons */}
      <View style={styles.quickAddRow}>
        <QuickAddButton
          icon="water-outline"
          label="8 oz"
          onPress={() => handleAdd(8)}
        />
        <QuickAddButton
          icon="flask-outline"
          label="16 oz"
          onPress={() => handleAdd(16)}
        />
        <QuickAddButton
          icon="add"
          label="Custom"
          onPress={() => setShowCustomModal(true)}
        />
      </View>

      {/* Today's Log */}
      {entries.length > 0 && (
        <View style={styles.logSection}>
          <Text style={styles.sectionTitle}>Today's Log</Text>
          {[...entries].reverse().map((entry) => (
            <TouchableOpacity
              key={entry.id}
              style={styles.logEntry}
              onLongPress={() => handleDelete(entry)}
              activeOpacity={0.7}
            >
              <View style={styles.logLeft}>
                <Ionicons name="water" size={16} color={COLORS.primary} />
                <Text style={styles.logAmount}>{entry.amountOz} oz</Text>
              </View>
              <Text style={styles.logTime}>{formatTime(entry.timestamp)}</Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.logHint}>Long press to delete an entry</Text>
        </View>
      )}

      {/* Weekly Chart */}
      {weeklyData.length > 0 && (
        <View style={styles.chartSection}>
          <WeeklyWaterChart
            data={weeklyData}
            goalOz={goalOz}
            width={SCREEN_WIDTH - SIZES.md * 2}
          />
        </View>
      )}

      {/* Hydration Tip */}
      <View style={styles.tipCard}>
        <Ionicons name="bulb-outline" size={18} color={COLORS.secondary} />
        <Text style={styles.tipText}>
          Proper hydration reduces water retention and puffiness, making your jawline
          and cheekbones more visible. Your body holds onto water when you're dehydrated
          — drinking more actually reduces bloating.
        </Text>
      </View>

      {/* Custom Amount Modal */}
      <Modal
        visible={showCustomModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Amount</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Amount in oz"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              value={customAmount}
              onChangeText={setCustomAmount}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancel}
                onPress={() => {
                  setCustomAmount('');
                  setShowCustomModal(false);
                }}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAdd}
                onPress={handleCustomAdd}
              >
                <Text style={styles.modalAddText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// ── Quick Add Button Component ─────────────────────────────────

function QuickAddButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[styles.quickAddButton, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={styles.quickAddInner}
      >
        <Ionicons name={icon} size={28} color={COLORS.primary} />
        <Text style={styles.quickAddLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Styles ─────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: SIZES.md,
  },
  header: {
    fontSize: SIZES.fontXxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SIZES.lg,
  },
  ringSection: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: SIZES.sm,
    marginBottom: SIZES.xl,
  },
  quickAddButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickAddInner: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.md,
    gap: SIZES.xs,
  },
  quickAddLabel: {
    fontSize: SIZES.fontSm,
    fontWeight: '700',
    color: COLORS.text,
  },
  logSection: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  logEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusSm,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm + 2,
    marginBottom: SIZES.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  logAmount: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
  },
  logTime: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
  },
  logHint: {
    fontSize: SIZES.fontXs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SIZES.xs,
  },
  chartSection: {
    marginBottom: SIZES.xl,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.sm,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    padding: SIZES.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tipText: {
    flex: 1,
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: SIZES.radiusXl,
    borderTopRightRadius: SIZES.radiusXl,
    padding: SIZES.lg,
    paddingBottom: 40,
  },
  modalTitle: {
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.md,
    paddingVertical: 14,
    fontSize: SIZES.fontLg,
    color: COLORS.text,
    marginBottom: SIZES.md,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  modalCancel: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalCancelText: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  modalAdd: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.primary,
  },
  modalAddText: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.background,
  },
});

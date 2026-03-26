import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, DEFAULT_WATER_GOAL_OZ } from '../constants';
import { Goal, GOAL_LABELS, UserProfile } from '../types';
import { getUserProfile, saveUserProfile, clearAllData } from '../services/storage';

const GOALS: Goal[] = ['jawline', 'skin', 'symmetry', 'bloat', 'overall'];
const APP_VERSION = '1.0.0';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [dirty, setDirty] = useState(false);

  // Notification prefs (stored locally, not wired to push yet)
  const [taskReminders, setTaskReminders] = useState(true);
  const [waterReminders, setWaterReminders] = useState(true);
  const [scanReminders, setScanReminders] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const p = await getUserProfile();
    if (p) {
      setProfile(p);
      setName(p.name);
      setAge(p.age.toString());
      setWeight(p.bodyWeight?.toString() ?? '');
      setSelectedGoals(p.goals);
    }
  };

  const toggleGoal = (goal: Goal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
    setDirty(true);
  };

  const handleSave = async () => {
    if (!profile) return;
    const ageNum = parseInt(age, 10);
    if (!name.trim() || isNaN(ageNum) || ageNum < 13) {
      Alert.alert('Invalid', 'Please check name and age.');
      return;
    }

    const weightNum = weight ? parseFloat(weight) : undefined;
    const waterGoal = weightNum ? Math.round(weightNum / 2) : DEFAULT_WATER_GOAL_OZ;

    const updated: UserProfile = {
      ...profile,
      name: name.trim(),
      age: ageNum,
      bodyWeight: weightNum,
      waterGoalOz: waterGoal,
      goals: selectedGoals.length > 0 ? selectedGoals : profile.goals,
    };

    await saveUserProfile(updated);
    setProfile(updated);
    setDirty(false);
    Alert.alert('Saved', 'Profile updated successfully.');
  };

  const handleReset = () => {
    Alert.alert(
      'Reset All Data',
      'This will permanently delete all your scans, tasks, streaks, and progress. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Done', 'All data has been reset. Restart the app to begin fresh.');
          },
        },
      ]
    );
  };

  if (!profile) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.header}>Profile</Text>

      {/* Avatar area */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={40} color={COLORS.primary} />
        </View>
        <Text style={styles.avatarName}>{profile.name}</Text>
        <Text style={styles.avatarMeta}>
          {profile.age} · {profile.gender.charAt(0).toUpperCase() + profile.gender.slice(1)}
        </Text>
      </View>

      {/* Edit Fields */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Personal Info</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={(v) => { setName(v); setDirty(true); }}
          placeholderTextColor={COLORS.textMuted}
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={(v) => { setAge(v); setDirty(true); }}
          keyboardType="number-pad"
          placeholderTextColor={COLORS.textMuted}
        />

        <Text style={styles.label}>Body Weight (lbs)</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={(v) => { setWeight(v); setDirty(true); }}
          keyboardType="numeric"
          placeholder="Used for water goal calculation"
          placeholderTextColor={COLORS.textMuted}
        />
        {weight ? (
          <Text style={styles.waterGoalNote}>
            Water goal: {Math.round(parseFloat(weight) / 2) || DEFAULT_WATER_GOAL_OZ} oz/day
          </Text>
        ) : null}
      </View>

      {/* Goals */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Goals</Text>
        <View style={styles.goalsContainer}>
          {GOALS.map((goal) => (
            <TouchableOpacity
              key={goal}
              style={[
                styles.goalChip,
                selectedGoals.includes(goal) && styles.goalChipActive,
              ]}
              onPress={() => toggleGoal(goal)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.goalText,
                  selectedGoals.includes(goal) && styles.goalTextActive,
                ]}
              >
                {GOAL_LABELS[goal]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Save button */}
      {dirty && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      )}

      {/* Notification Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Ionicons name="alarm-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.toggleLabel}>Morning task reminders</Text>
          </View>
          <Switch
            value={taskReminders}
            onValueChange={setTaskReminders}
            trackColor={{ false: COLORS.border, true: COLORS.primaryDim }}
            thumbColor={taskReminders ? COLORS.primary : COLORS.textMuted}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Ionicons name="water-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.toggleLabel}>Water reminders (every 2h)</Text>
          </View>
          <Switch
            value={waterReminders}
            onValueChange={setWaterReminders}
            trackColor={{ false: COLORS.border, true: COLORS.primaryDim }}
            thumbColor={waterReminders ? COLORS.primary : COLORS.textMuted}
          />
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleInfo}>
            <Ionicons name="scan-outline" size={20} color={COLORS.textSecondary} />
            <Text style={styles.toggleLabel}>Weekly scan reminder</Text>
          </View>
          <Switch
            value={scanReminders}
            onValueChange={setScanReminders}
            trackColor={{ false: COLORS.border, true: COLORS.primaryDim }}
            thumbColor={scanReminders ? COLORS.primary : COLORS.textMuted}
          />
        </View>
      </View>

      {/* Danger Zone */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset} activeOpacity={0.8}>
          <Ionicons name="trash-outline" size={18} color={COLORS.error} />
          <Text style={styles.resetText}>Reset All Data</Text>
        </TouchableOpacity>
      </View>

      {/* Version */}
      <Text style={styles.version}>Lock In AI v{APP_VERSION}</Text>
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
    fontSize: SIZES.fontXxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SIZES.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: SIZES.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.sm,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatarName: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.text,
  },
  avatarMeta: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  section: {
    marginBottom: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  label: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: SIZES.xs,
    marginTop: SIZES.sm,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.md,
    paddingVertical: 12,
    fontSize: SIZES.fontMd,
    color: COLORS.text,
  },
  waterGoalNote: {
    fontSize: SIZES.fontXs,
    color: COLORS.primary,
    marginTop: SIZES.xs,
  },
  goalsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.sm,
  },
  goalChip: {
    paddingHorizontal: SIZES.md,
    paddingVertical: 10,
    borderRadius: SIZES.radiusFull,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  goalChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryGlow,
  },
  goalText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  goalTextActive: {
    color: COLORS.primary,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radiusLg,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: SIZES.lg,
  },
  saveButtonText: {
    fontSize: SIZES.fontMd,
    fontWeight: '700',
    color: COLORS.background,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.md,
    paddingVertical: SIZES.sm,
    marginBottom: SIZES.sm,
  },
  toggleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
    flex: 1,
  },
  toggleLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.text,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.error,
    paddingVertical: 14,
  },
  resetText: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.error,
  },
  version: {
    fontSize: SIZES.fontXs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: SIZES.md,
  },
});

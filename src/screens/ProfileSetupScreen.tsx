import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, DEFAULT_WATER_GOAL_OZ } from '../constants';
import { Goal, GOAL_LABELS, UserProfile } from '../types';
import { saveUserProfile, setOnboardingComplete } from '../services/storage';

interface Props {
  onComplete: () => void;
}

const GENDER_OPTIONS = [
  { value: 'male' as const, label: 'Male', icon: 'male-outline' as const },
  { value: 'female' as const, label: 'Female', icon: 'female-outline' as const },
  { value: 'other' as const, label: 'Other', icon: 'person-outline' as const },
];

const GOALS: Goal[] = ['jawline', 'skin', 'symmetry', 'bloat', 'overall'];

export default function ProfileSetupScreen({ onComplete }: Props) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<UserProfile['gender'] | null>(null);
  const [selectedGoals, setSelectedGoals] = useState<Goal[]>([]);
  const [weight, setWeight] = useState('');

  const toggleGoal = (goal: Goal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const canSubmit = name.trim() && age.trim() && gender && selectedGoals.length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) {
      Alert.alert('Missing Info', 'Please fill in your name, age, gender, and select at least one goal.');
      return;
    }

    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 13 || ageNum > 120) {
      Alert.alert('Invalid Age', 'Please enter a valid age (13-120).');
      return;
    }

    const weightNum = weight ? parseFloat(weight) : undefined;
    const waterGoal = weightNum ? Math.round(weightNum / 2) : DEFAULT_WATER_GOAL_OZ;

    const profile: UserProfile = {
      id: Date.now().toString(),
      name: name.trim(),
      age: ageNum,
      gender: gender!,
      goals: selectedGoals,
      bodyWeight: weightNum,
      waterGoalOz: waterGoal,
      createdAt: new Date().toISOString(),
      onboardingComplete: true,
    };

    await saveUserProfile(profile);
    await setOnboardingComplete(true);
    onComplete();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>Set Up Your Profile</Text>
        <Text style={styles.subheader}>
          Tell us about yourself so we can personalize your plan.
        </Text>

        {/* Name */}
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor={COLORS.textMuted}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
        />

        {/* Age */}
        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          placeholder="Your age"
          placeholderTextColor={COLORS.textMuted}
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
          maxLength={3}
        />

        {/* Gender */}
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderRow}>
          {GENDER_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.value}
              style={[
                styles.genderOption,
                gender === opt.value && styles.genderOptionActive,
              ]}
              onPress={() => setGender(opt.value)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={opt.icon}
                size={24}
                color={gender === opt.value ? COLORS.primary : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.genderLabel,
                  gender === opt.value && styles.genderLabelActive,
                ]}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Goals */}
        <Text style={styles.label}>Goals (select at least one)</Text>
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

        {/* Body Weight (optional) */}
        <Text style={styles.label}>
          Body Weight (lbs){' '}
          <Text style={styles.optional}>— optional</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Used to calculate water intake goal"
          placeholderTextColor={COLORS.textMuted}
          value={weight}
          onChangeText={setWeight}
          keyboardType="numeric"
          maxLength={4}
        />
        <TouchableOpacity style={styles.skipWeight}>
          <Text style={styles.skipWeightText}>I'll add this later</Text>
        </TouchableOpacity>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitButton, !canSubmit && styles.submitDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={!canSubmit}
        >
          <Text style={styles.submitText}>Lock In</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.background} />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.lg,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    fontSize: SIZES.fontXxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SIZES.sm,
  },
  subheader: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    marginBottom: SIZES.xl,
    lineHeight: 22,
  },
  label: {
    fontSize: SIZES.fontSm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SIZES.sm,
    marginTop: SIZES.lg,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  optional: {
    color: COLORS.textMuted,
    fontWeight: '400',
    textTransform: 'none',
    letterSpacing: 0,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: SIZES.md,
    paddingVertical: 14,
    fontSize: SIZES.fontMd,
    color: COLORS.text,
  },
  genderRow: {
    flexDirection: 'row',
    gap: SIZES.sm,
  },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SIZES.sm,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
  },
  genderOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryGlow,
  },
  genderLabel: {
    fontSize: SIZES.fontSm,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  genderLabelActive: {
    color: COLORS.primary,
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
  skipWeight: {
    marginTop: SIZES.sm,
  },
  skipWeightText: {
    fontSize: SIZES.fontSm,
    color: COLORS.textMuted,
    textDecorationLine: 'underline',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusLg,
    marginTop: SIZES.xl,
    gap: SIZES.sm,
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitText: {
    fontSize: SIZES.fontLg,
    fontWeight: '700',
    color: COLORS.background,
  },
});

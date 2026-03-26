import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants';
import { Ionicons } from '@expo/vector-icons';

export default function WaterScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="water-outline" size={64} color={COLORS.primary} />
      <Text style={styles.title}>Water Tracker</Text>
      <Text style={styles.subtitle}>Hydration tracking coming in Phase 4</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SIZES.lg,
    gap: SIZES.md,
  },
  title: {
    fontSize: SIZES.fontXl,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: SIZES.fontMd,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

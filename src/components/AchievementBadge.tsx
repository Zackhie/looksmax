import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { Achievement } from '../services/achievements';

interface Props {
  achievement: Achievement;
}

export default function AchievementBadge({ achievement }: Props) {
  const earned = !!achievement.earnedAt;

  return (
    <View style={[styles.badge, earned && styles.badgeEarned]}>
      <View style={[styles.iconContainer, earned && styles.iconContainerEarned]}>
        <Ionicons
          name={(earned ? achievement.icon : 'lock-closed-outline') as any}
          size={24}
          color={earned ? COLORS.secondary : COLORS.textMuted}
        />
      </View>
      <Text style={[styles.title, earned && styles.titleEarned]} numberOfLines={1}>
        {achievement.title}
      </Text>
      <Text style={styles.description} numberOfLines={2}>
        {achievement.description}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.sm,
    opacity: 0.5,
    minHeight: 120,
  },
  badgeEarned: {
    opacity: 1,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.xs,
  },
  iconContainerEarned: {
    backgroundColor: 'rgba(255, 184, 0, 0.15)',
  },
  title: {
    fontSize: SIZES.fontXs,
    fontWeight: '700',
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 2,
  },
  titleEarned: {
    color: COLORS.text,
  },
  description: {
    fontSize: 10,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 14,
  },
});

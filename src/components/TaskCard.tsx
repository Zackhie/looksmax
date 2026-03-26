import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';
import { CATEGORY_ICONS, CATEGORY_COLORS } from '../constants/taskBank';
import { DailyTask } from '../types';

interface Props {
  task: DailyTask;
  onToggle: (taskId: string) => void;
  onXPGain?: (points: number) => void;
}

const PRIORITY_DOTS: Record<string, string> = {
  high: COLORS.error,
  medium: COLORS.warning,
  low: COLORS.success,
};

const XP_VALUES: Record<string, number> = {
  high: 30,
  medium: 20,
  low: 10,
};

export default function TaskCard({ task, onToggle, onXPGain }: Props) {
  const strikeAnim = useRef(new Animated.Value(task.completed ? 1 : 0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const xpOpacity = useRef(new Animated.Value(0)).current;
  const xpTranslate = useRef(new Animated.Value(0)).current;

  const handleToggle = () => {
    if (!task.completed) {
      // Check off animation
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      Animated.parallel([
        Animated.timing(strikeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: false,
        }),
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.95,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      // XP popup animation
      xpOpacity.setValue(1);
      xpTranslate.setValue(0);
      Animated.parallel([
        Animated.timing(xpOpacity, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(xpTranslate, {
          toValue: -40,
          duration: 1200,
          useNativeDriver: true,
        }),
      ]).start();

      const xp = XP_VALUES[task.priority] ?? 10;
      onXPGain?.(xp);
    } else {
      // Uncheck
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.timing(strikeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }

    onToggle(task.id);
  };

  const categoryColor = CATEGORY_COLORS[task.category] ?? COLORS.primary;
  const categoryIcon = CATEGORY_ICONS[task.category] ?? 'ellipse-outline';
  const priorityColor = PRIORITY_DOTS[task.priority];
  const xp = XP_VALUES[task.priority] ?? 10;

  const textOpacity = strikeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.4],
  });

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      {/* XP popup */}
      <Animated.View
        style={[
          styles.xpPopup,
          {
            opacity: xpOpacity,
            transform: [{ translateY: xpTranslate }],
          },
        ]}
        pointerEvents="none"
      >
        <Text style={styles.xpPopupText}>+{xp} XP</Text>
      </Animated.View>

      <TouchableOpacity
        style={styles.cardInner}
        onPress={handleToggle}
        activeOpacity={0.7}
      >
        {/* Checkbox */}
        <View
          style={[
            styles.checkbox,
            task.completed && styles.checkboxChecked,
            task.completed && { borderColor: categoryColor, backgroundColor: categoryColor },
          ]}
        >
          {task.completed && (
            <Ionicons name="checkmark" size={14} color={COLORS.background} />
          )}
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, { opacity: textOpacity }]}>
          <View style={styles.topRow}>
            <View style={styles.categoryBadge}>
              <Ionicons name={categoryIcon as any} size={14} color={categoryColor} />
            </View>
            <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
          </View>

          <Text
            style={[
              styles.title,
              task.completed && styles.titleCompleted,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>

          <View style={styles.meta}>
            <View style={styles.timeBadge}>
              <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
              <Text style={styles.timeText}>
                {task.estimatedMinutes <= 1 ? 'Ongoing' : `${task.estimatedMinutes} min`}
              </Text>
            </View>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    marginBottom: SIZES.sm,
  },
  cardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusMd,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SIZES.md,
    gap: SIZES.md,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  title: {
    fontSize: SIZES.fontMd,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: COLORS.textMuted,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: SIZES.fontXs,
    color: COLORS.textMuted,
  },
  xpPopup: {
    position: 'absolute',
    right: SIZES.md,
    top: -10,
    zIndex: 10,
  },
  xpPopupText: {
    fontSize: SIZES.fontSm,
    fontWeight: '800',
    color: COLORS.secondary,
  },
});

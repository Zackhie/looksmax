import React, { useEffect, useRef, useState } from 'react';
import { Text, TextStyle, Animated } from 'react-native';

interface Props {
  target: number;
  duration?: number;
  style?: TextStyle;
  delay?: number;
  suffix?: string;
}

export default function AnimatedCounter({
  target,
  duration = 1500,
  style,
  delay = 0,
  suffix = '',
}: Props) {
  const [display, setDisplay] = useState(0);
  const animValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const listener = animValue.addListener(({ value }) => {
      setDisplay(Math.round(value));
    });

    const timeout = setTimeout(() => {
      Animated.timing(animValue, {
        toValue: target,
        duration,
        useNativeDriver: false,
      }).start();
    }, delay);

    return () => {
      clearTimeout(timeout);
      animValue.removeListener(listener);
    };
  }, [target, duration, delay]);

  return <Text style={style}>{display}{suffix}</Text>;
}

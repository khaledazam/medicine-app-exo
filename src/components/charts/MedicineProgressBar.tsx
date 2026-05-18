import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface MedicineProgressBarProps {
  name: string;
  taken: number;
  total: number;
  color?: string;
}

export default function MedicineProgressBar({
  name,
  taken,
  total,
  color,
}: MedicineProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;
  const percentage = total > 0 ? Math.round((taken / total) * 100) : 0;

  const barColor = color || (percentage >= 80 ? '#1a8e2d' : percentage >= 50 ? '#FF9800' : '#E53935');

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: percentage,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const widthInterpolated = animatedWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={[styles.stats, { color: barColor }]}>
          {taken}/{total} ({percentage}%)
        </Text>
      </View>
      <View style={styles.barBg}>
        <Animated.View
          style={[
            styles.barFill,
            {
              width: widthInterpolated,
              backgroundColor: barColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  stats: {
    fontSize: 13,
    fontWeight: '700',
  },
  barBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    overflow: 'hidden',
  },
  barFill: {
    height: 10,
    borderRadius: 5,
  },
});

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AdherenceRingProps {
  percentage: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  label?: string;
  sublabel?: string;
  textColor?: string;
}

export default function AdherenceRing({
  percentage,
  size = 160,
  strokeWidth = 14,
  color = '#1a8e2d',
  bgColor = 'rgba(26, 142, 45, 0.15)',
  label,
  sublabel,
  textColor = '#1a1a1a',
}: AdherenceRingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percentage / 100,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [percentage]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  const displayColor = percentage >= 80
    ? '#1a8e2d'
    : percentage >= 50
    ? '#FF9800'
    : '#E53935';

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.textContainer}>
        <Text style={[styles.percentage, { color: displayColor, fontSize: size * 0.2 }]}>
          {Math.round(percentage)}%
        </Text>
        {label && <Text style={[styles.label, { color: textColor }]}>{label}</Text>}
        {sublabel && <Text style={styles.sublabel}>{sublabel}</Text>}
      </View>

      <Svg width={size} height={size} style={styles.svg}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={displayColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  percentage: {
    fontWeight: '800',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  sublabel: {
    fontSize: 11,
    color: '#999',
    marginTop: 1,
  },
  svg: {},
});

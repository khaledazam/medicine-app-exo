import React from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { useEffect, useRef } from 'react';

const { width } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

function SkeletonBlock({ width: w = '100%', height = 20, borderRadius = 8, style }: SkeletonProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width: w as any,
          height,
          borderRadius,
          backgroundColor: '#E1E9EE',
          opacity,
        },
        style,
      ]}
    />
  );
}

export function CardSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <SkeletonBlock width={50} height={50} borderRadius={25} />
        <View style={styles.cardContent}>
          <SkeletonBlock width="60%" height={16} style={{ marginBottom: 8 }} />
          <SkeletonBlock width="40%" height={12} style={{ marginBottom: 6 }} />
          <SkeletonBlock width="30%" height={12} />
        </View>
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </View>
  );
}

export function HeaderSkeleton() {
  return (
    <View style={styles.headerSkeleton}>
      <SkeletonBlock width={150} height={24} borderRadius={12} style={{ marginBottom: 12 }} />
      <SkeletonBlock width={100} height={100} borderRadius={50} style={{ alignSelf: 'center', marginBottom: 12 }} />
      <SkeletonBlock width={80} height={16} borderRadius={8} style={{ alignSelf: 'center' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 15,
  },
  headerSkeleton: {
    padding: 20,
    paddingTop: 50,
  },
});

export default SkeletonBlock;

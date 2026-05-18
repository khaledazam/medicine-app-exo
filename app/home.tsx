import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Animated, Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle } from "react-native-svg";
import { useFocusEffect } from "@react-navigation/native";
import { useMedicines } from "../src/context/MedicineContext";
import MedicineCard from "../src/components/MedicineCard";
import { ListSkeleton } from "../src/components/LoadingSkeleton";
import EmptyState from "../src/components/EmptyState";

const { width } = Dimensions.get("window");
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const QUICK_ACTIONS = [
  { icon: "add-circle-outline" as const, label: "Add\nMedicine", route: "/medications/add" as const, gradient: ["#4CAF50", "#2E7D32"] as [string, string] },
  { icon: "notifications-outline" as const, label: "Reminders", route: "/reminders" as const, gradient: ["#7B1FA2", "#6A1B9A"] as [string, string] },
  { icon: "bar-chart-outline" as const, label: "Daily\nSummary", route: "/daily-summary" as const, gradient: ["#1565C0", "#0D47A1"] as [string, string] },
  { icon: "calendar-outline" as const, label: "Calendar\nView", route: "/calendar" as const, gradient: ["#2196F3", "#1976D2"] as [string, string] },
  { icon: "alert-circle-outline" as const, label: "Missed\nDoses", route: "/missed-doses" as const, gradient: ["#E53935", "#C62828"] as [string, string] },
  { icon: "medical-outline" as const, label: "Refill\nTracker", route: "/refills" as const, gradient: ["#FF5722", "#E64A19"] as [string, string] },
];

function CircularProgress({ progress, totalDoses, completedDoses }: { progress: number; totalDoses: number; completedDoses: number }) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const size = width * 0.45;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [progress]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={styles.progressContainer}>
      <View style={styles.progressTextContainer}>
        <Text style={styles.progressPercentage}>{Math.round(progress * 100)}%</Text>
        <Text style={styles.progressDetails}>{completedDoses} of {totalDoses} doses</Text>
      </View>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={radius} stroke="rgba(255,255,255,0.2)" strokeWidth={strokeWidth} fill="none" />
        <AnimatedCircle
          cx={size / 2} cy={size / 2} r={radius} stroke="white"
          strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
    </View>
  );
}

export default function HomeScreen() {
  const router = useRouter();
  const {
    medicines, loading, fetchMedicines, markDoseTaken,
    dailySummary, fetchDailySummary,
    missedDosesCount, fetchMissedDoses,
    refillAlertsCount, fetchRefillAlerts,
  } = useMedicines();

  useFocusEffect(
    useCallback(() => {
      fetchMedicines();
      fetchDailySummary();
      fetchMissedDoses();
      fetchRefillAlerts();
    }, [])
  );

  const totalDoses = dailySummary?.dailyStats?.totalDoses || 0;
  const completedDoses = dailySummary?.dailyStats?.totalTaken || 0;
  const progress = totalDoses > 0 ? completedDoses / totalDoses : 0;

  const handleTakeDose = async (medicineId: string, time: string) => {
    try {
      await markDoseTaken(medicineId, time);
      Alert.alert("Success", "Dose marked as taken ✓");
      fetchDailySummary();
      fetchMissedDoses();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to mark dose");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <LinearGradient colors={["#1a8e2d", "#146922"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.flex1}>
              <Text style={styles.greeting}>Daily Progress</Text>
              <Text style={styles.greetingSub}>
                {dailySummary?.dailyStats?.status?.replace(/[✅⚠️❌]/g, '').trim() || 'Keep it up!'}
              </Text>
            </View>

            {/* Alerts */}
            <View style={styles.headerActions}>
              {missedDosesCount > 0 && (
                <TouchableOpacity style={styles.alertBadge} onPress={() => router.push("/missed-doses" as any)}>
                  <Ionicons name="alert-circle" size={20} color="#FF5252" />
                  <Text style={styles.alertCount}>{missedDosesCount}</Text>
                </TouchableOpacity>
              )}
              {refillAlertsCount > 0 && (
                <TouchableOpacity style={styles.alertBadge} onPress={() => router.push("/refills" as any)}>
                  <Ionicons name="cube" size={20} color="#FF9800" />
                  <Text style={styles.alertCount}>{refillAlertsCount}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.profileButton} onPress={() => router.push("/profile" as any)}>
                <Ionicons name="person-outline" size={22} color="white" />
              </TouchableOpacity>
            </View>
          </View>

          <CircularProgress progress={progress} totalDoses={totalDoses} completedDoses={completedDoses} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {QUICK_ACTIONS.map((action) => (
              <Link href={action.route as any} key={action.label} asChild>
                <TouchableOpacity style={styles.actionButton}>
                  <LinearGradient colors={action.gradient} style={styles.actionGradient}>
                    <View style={styles.actionContent}>
                      <View style={styles.actionIcon}>
                        <Ionicons name={action.icon} size={24} color="white" />
                      </View>
                      <Text style={styles.actionLabel}>{action.label}</Text>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </Link>
            ))}
          </View>
        </View>

        {/* Today's Medicines */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Medicines</Text>
            <TouchableOpacity onPress={() => router.push("/calendar" as any)}>
              <Text style={styles.seeAllButton}>See All</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ListSkeleton count={3} />
          ) : medicines.length === 0 ? (
            <EmptyState
              icon="medical-outline"
              title="No Medicines Yet"
              subtitle="Add your first medication to get started"
              actionLabel="Add Medicine"
              onAction={() => router.push("/medications/add")}
            />
          ) : (
            medicines.map((medicine) => (
              <View key={medicine._id} style={{ paddingHorizontal: 0 }}>
                <MedicineCard
                  medicine={medicine}
                  onPress={() => router.push(`/medications/${medicine._id}` as any)}
                  onTakeDose={(time) => handleTakeDose(medicine._id, time)}
                  showTakeButton
                />
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    paddingTop: 50, paddingBottom: 25,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  headerContent: { alignItems: "center", paddingHorizontal: 20 },
  headerTop: {
    flexDirection: "row", alignItems: "center", width: "100%", marginBottom: 16,
  },
  flex1: { flex: 1 },
  greeting: { fontSize: 20, fontWeight: "700", color: "white" },
  greetingSub: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 2 },

  headerActions: { flexDirection: "row", alignItems: "center", gap: 8 },
  alertBadge: {
    flexDirection: "row", alignItems: "center", backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12, paddingHorizontal: 8, paddingVertical: 6, gap: 4,
  },
  alertCount: { color: "white", fontSize: 12, fontWeight: "700" },
  profileButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center",
  },

  progressContainer: { alignItems: "center", justifyContent: "center", marginVertical: 8 },
  progressTextContainer: { position: "absolute", alignItems: "center", justifyContent: "center", zIndex: 1 },
  progressPercentage: { fontSize: 34, fontWeight: "800", color: "white" },
  progressDetails: { fontSize: 13, color: "rgba(255,255,255,0.8)", marginTop: 2 },

  content: { flex: 1, paddingTop: 20 },
  quickActionsContainer: { paddingHorizontal: 20, marginBottom: 24 },
  quickActionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  actionButton: { width: (width - 60) / 3, height: 90, borderRadius: 16, overflow: "hidden" },
  actionGradient: { flex: 1, padding: 12 },
  actionContent: { flex: 1, justifyContent: "space-between" },
  actionIcon: {
    width: 34, height: 34, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  actionLabel: { fontSize: 11, fontWeight: "600", color: "white", marginTop: 4 },

  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1a1a1a" },
  seeAllButton: { color: "#1a8e2d", fontWeight: "600", fontSize: 14 },
});
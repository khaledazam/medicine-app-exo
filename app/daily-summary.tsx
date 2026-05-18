import React, { useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useMedicines } from "../src/context/MedicineContext";
import AdherenceRing from "../src/components/charts/AdherenceRing";
import WeeklyBarChart from "../src/components/charts/WeeklyBarChart";
import MedicineProgressBar from "../src/components/charts/MedicineProgressBar";
import { ListSkeleton } from "../src/components/LoadingSkeleton";

export default function DailySummaryScreen() {
  const router = useRouter();
  const { dailySummary, fetchDailySummary, loading } = useMedicines();

  useFocusEffect(
    useCallback(() => {
      fetchDailySummary();
    }, [])
  );

  const stats = dailySummary?.dailyStats;
  const medicines = dailySummary?.medicines || [];

  // Mock weekly data (in production, you'd aggregate from history)
  const weeklyData = [
    { label: "Mon", value: 85 },
    { label: "Tue", value: 100 },
    { label: "Wed", value: 60 },
    { label: "Thu", value: 90 },
    { label: "Fri", value: 45 },
    { label: "Sat", value: 75 },
    { label: "Sun", value: stats?.overallAdherence || 0 },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1565C0", "#0D47A1"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#1565C0" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Daily Summary</Text>
            <Text style={styles.headerSubtitle}>{dailySummary?.date || "Today"}</Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchDailySummary}>
            <Ionicons name="refresh-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading && !dailySummary ? (
          <ListSkeleton count={3} />
        ) : (
          <>
            {/* Overall Adherence */}
            <View style={styles.section}>
              <View style={styles.adherenceCard}>
                <AdherenceRing
                  percentage={stats?.overallAdherence || 0}
                  size={160}
                  label="Adherence"
                  sublabel={`${stats?.totalTaken || 0}/${stats?.totalDoses || 0} doses`}
                />
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: "#1a8e2d" }]} />
                    <Text style={styles.statLabel}>Taken</Text>
                    <Text style={styles.statValue}>{stats?.totalTaken || 0}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: "#E53935" }]} />
                    <Text style={styles.statLabel}>Missed</Text>
                    <Text style={styles.statValue}>{stats?.totalMissed || 0}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <View style={[styles.statDot, { backgroundColor: "#1565C0" }]} />
                    <Text style={styles.statLabel}>Total</Text>
                    <Text style={styles.statValue}>{stats?.totalDoses || 0}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Weekly Progress */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Weekly Progress</Text>
              <View style={styles.chartCard}>
                <WeeklyBarChart data={weeklyData} height={200} />
              </View>
            </View>

            {/* Per Medicine */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Per Medicine</Text>
              <View style={styles.medicineCard}>
                {medicines.length === 0 ? (
                  <Text style={styles.noDataText}>No medicine data available</Text>
                ) : (
                  medicines.map((med) => (
                    <MedicineProgressBar
                      key={med.medicineId}
                      name={med.medicineName}
                      taken={med.taken}
                      total={med.total}
                    />
                  ))
                )}
              </View>
            </View>

            {/* Status */}
            {stats && (
              <View style={styles.section}>
                <View style={[
                  styles.statusBanner,
                  {
                    backgroundColor: stats.overallAdherence === 100 ? "#E8F5E9"
                      : stats.overallAdherence >= 50 ? "#FFF3E0" : "#FFEBEE",
                  },
                ]}>
                  <Ionicons
                    name={stats.overallAdherence === 100 ? "trophy" : stats.overallAdherence >= 50 ? "trending-up" : "trending-down"}
                    size={28}
                    color={stats.overallAdherence === 100 ? "#1a8e2d" : stats.overallAdherence >= 50 ? "#FF9800" : "#E53935"}
                  />
                  <View style={styles.statusContent}>
                    <Text style={styles.statusTitle}>
                      {stats.overallAdherence === 100 ? "Perfect Day!" : stats.overallAdherence >= 50 ? "Good Progress" : "Need Improvement"}
                    </Text>
                    <Text style={styles.statusSubtitle}>
                      {stats.overallAdherence === 100
                        ? "You've taken all your medications today!"
                        : `You've completed ${stats.overallAdherence}% of today's doses`}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View style={{ height: 30 }} />
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 40, paddingBottom: 24,
    paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "white", justifyContent: "center", alignItems: "center" },
  headerCenter: { flex: 1, marginLeft: 16 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "white" },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  refreshBtn: { padding: 8 },
  content: { flex: 1, paddingTop: 20 },
  section: { marginBottom: 24, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1a1a1a", marginBottom: 12 },

  adherenceCard: {
    backgroundColor: "white", borderRadius: 20, padding: 24, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  statsRow: { flexDirection: "row", justifyContent: "space-around", width: "100%", marginTop: 20 },
  statItem: { alignItems: "center" },
  statDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 4 },
  statLabel: { fontSize: 12, color: "#999", marginBottom: 2 },
  statValue: { fontSize: 20, fontWeight: "800", color: "#1a1a1a" },

  chartCard: {
    backgroundColor: "white", borderRadius: 20, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },

  medicineCard: {
    backgroundColor: "white", borderRadius: 20, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  noDataText: { fontSize: 14, color: "#999", textAlign: "center", padding: 20 },

  statusBanner: {
    flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 20, gap: 16,
  },
  statusContent: { flex: 1 },
  statusTitle: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 4 },
  statusSubtitle: { fontSize: 13, color: "#666", lineHeight: 18 },
});

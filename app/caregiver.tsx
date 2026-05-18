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
import MedicineCard from "../src/components/MedicineCard";
import { ListSkeleton } from "../src/components/LoadingSkeleton";
import EmptyState from "../src/components/EmptyState";

export default function CaregiverScreen() {
  const router = useRouter();
  const { medicines, dailySummary, fetchMedicines, fetchDailySummary, loading } = useMedicines();

  useFocusEffect(
    useCallback(() => {
      fetchMedicines();
      fetchDailySummary();
    }, [])
  );

  const adherence = dailySummary?.dailyStats?.overallAdherence || 0;

  return (
    <View style={styles.container}>
      {/* Caregiver Banner */}
      <View style={styles.banner}>
        <Ionicons name="eye-outline" size={18} color="#1565C0" />
        <Text style={styles.bannerText}>Caregiver View — Read Only</Text>
      </View>

      <LinearGradient colors={["#546E7A", "#37474F"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#546E7A" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Patient Overview</Text>
            <Text style={styles.headerSubtitle}>Shared access view</Text>
          </View>
          <View style={styles.statusDot}>
            <View style={styles.onlineDot} />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ListSkeleton count={3} />
        ) : (
          <>
            {/* Summary Card */}
            <View style={styles.section}>
              <View style={styles.summaryCard}>
                <AdherenceRing
                  percentage={adherence}
                  size={120}
                  label="Today"
                />
                <View style={styles.summaryStats}>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatValue}>{medicines.length}</Text>
                    <Text style={styles.summaryStatLabel}>Medicines</Text>
                  </View>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatValue}>{dailySummary?.dailyStats?.totalTaken || 0}</Text>
                    <Text style={styles.summaryStatLabel}>Taken</Text>
                  </View>
                  <View style={styles.summaryStatItem}>
                    <Text style={styles.summaryStatValue}>{dailySummary?.dailyStats?.totalMissed || 0}</Text>
                    <Text style={styles.summaryStatLabel}>Missed</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Medicines List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Medications</Text>
              {medicines.length === 0 ? (
                <EmptyState
                  icon="medical-outline"
                  title="No Medications"
                  subtitle="The patient hasn't added any medications yet"
                />
              ) : (
                <View style={styles.list}>
                  {medicines.map((med) => (
                    <MedicineCard
                      key={med._id}
                      medicine={med}
                      showTakeButton={false}
                      compact
                    />
                  ))}
                </View>
              )}
            </View>

            {/* Schedule */}
            {dailySummary?.medicines && dailySummary.medicines.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Today's Schedule</Text>
                <View style={styles.scheduleCard}>
                  {dailySummary.medicines.map((med) => (
                    <View key={med.medicineId} style={styles.scheduleRow}>
                      <View style={[styles.statusIndicator, { backgroundColor: med.adherence === 100 ? "#1a8e2d" : med.adherence > 0 ? "#FF9800" : "#E53935" }]} />
                      <View style={styles.scheduleInfo}>
                        <Text style={styles.scheduleName}>{med.medicineName}</Text>
                        <Text style={styles.scheduleDetail}>{med.taken}/{med.total} doses • {med.adherence}%</Text>
                      </View>
                      <Text style={styles.scheduleStatus}>
                        {med.adherence === 100 ? "✅" : med.adherence > 0 ? "⚠️" : "❌"}
                      </Text>
                    </View>
                  ))}
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
  banner: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#E3F2FD", paddingVertical: 8, gap: 8,
    paddingTop: Platform.OS === "ios" ? 50 : 34,
  },
  bannerText: { fontSize: 13, fontWeight: "600", color: "#1565C0" },
  header: {
    paddingTop: 16, paddingBottom: 24, paddingHorizontal: 20,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "white", justifyContent: "center", alignItems: "center" },
  headerCenter: { flex: 1, marginLeft: 16 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "white" },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 2 },
  statusDot: { padding: 8 },
  onlineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#4CAF50" },

  content: { flex: 1, paddingTop: 20 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1a1a1a", marginBottom: 12 },

  summaryCard: {
    backgroundColor: "white", borderRadius: 20, padding: 24,
    flexDirection: "row", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 10, elevation: 3,
  },
  summaryStats: { flex: 1, marginLeft: 24, gap: 12 },
  summaryStatItem: {},
  summaryStatValue: { fontSize: 24, fontWeight: "800", color: "#1a1a1a" },
  summaryStatLabel: { fontSize: 12, color: "#999" },

  list: { gap: 0 },

  scheduleCard: {
    backgroundColor: "white", borderRadius: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, overflow: "hidden",
  },
  scheduleRow: {
    flexDirection: "row", alignItems: "center", padding: 16,
    borderBottomWidth: 1, borderBottomColor: "#f5f5f5",
  },
  statusIndicator: { width: 4, height: 30, borderRadius: 2, marginRight: 14 },
  scheduleInfo: { flex: 1 },
  scheduleName: { fontSize: 15, fontWeight: "600", color: "#333" },
  scheduleDetail: { fontSize: 12, color: "#999", marginTop: 2 },
  scheduleStatus: { fontSize: 20 },
});

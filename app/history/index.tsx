import React, { useState, useCallback } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useMedicines } from "../../src/context/MedicineContext";
import { ListSkeleton } from "../../src/components/LoadingSkeleton";
import EmptyState from "../../src/components/EmptyState";

interface HistoryEntry {
  medicineId: string;
  medicineName: string;
  dosage: string;
  time: string;
  date: string;
  taken: boolean;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { medicines, loading, fetchMedicines } = useMedicines();
  const [selectedFilter, setSelectedFilter] = useState<"all" | "taken" | "missed">("all");

  useFocusEffect(
    useCallback(() => {
      fetchMedicines();
    }, [])
  );

  // Build history from medicine.history arrays
  const history: HistoryEntry[] = [];
  medicines.forEach((med) => {
    if (med.history && Array.isArray(med.history)) {
      med.history.forEach((entry: any) => {
        history.push({
          medicineId: med._id,
          medicineName: med.name,
          dosage: med.dosage,
          time: entry.time || "",
          date: entry.date || entry.timestamp || "",
          taken: entry.taken !== false,
        });
      });
    }
  });

  // Sort by date descending
  history.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredHistory = history.filter((h) => {
    if (selectedFilter === "all") return true;
    if (selectedFilter === "taken") return h.taken;
    if (selectedFilter === "missed") return !h.taken;
    return true;
  });

  // Group by date
  const grouped: Record<string, HistoryEntry[]> = {};
  filteredHistory.forEach((h) => {
    const dateKey = new Date(h.date).toDateString();
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(h);
  });

  const groupedEntries = Object.entries(grouped);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1a8e2d", "#146922"]} style={styles.headerGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} />
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={28} color="#1a8e2d" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>History Log</Text>
        </View>

        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll}>
            {(["all", "taken", "missed"] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterButton, selectedFilter === filter && styles.filterButtonActive]}
                onPress={() => setSelectedFilter(filter)}
              >
                <Text style={[styles.filterText, selectedFilter === filter && styles.filterTextActive]}>
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <ScrollView style={styles.historyContainer} showsVerticalScrollIndicator={false}>
          {loading ? (
            <ListSkeleton count={4} />
          ) : groupedEntries.length === 0 ? (
            <EmptyState
              icon="time-outline"
              title="No History Yet"
              subtitle={selectedFilter !== "all" ? "No entries match this filter" : "Take your first dose to start tracking"}
            />
          ) : (
            groupedEntries.map(([date, doses]) => (
              <View key={date} style={styles.dateGroup}>
                <Text style={styles.dateHeader}>
                  {new Date(date).toLocaleDateString("default", {
                    weekday: "long", month: "long", day: "numeric",
                  })}
                </Text>
                {doses.map((dose, idx) => (
                  <View key={`${dose.medicineId}-${dose.time}-${idx}`} style={styles.historyCard}>
                    <View style={[styles.medicationColor, { backgroundColor: dose.taken ? "#4CAF50" : "#F44336" }]} />
                    <View style={styles.medicationInfo}>
                      <Text style={styles.medicationName}>{dose.medicineName}</Text>
                      <Text style={styles.medicationDosage}>{dose.dosage}</Text>
                      <Text style={styles.timeText}>{dose.time || "---"}</Text>
                    </View>
                    <View style={styles.statusContainer}>
                      {dose.taken ? (
                        <View style={[styles.statusBadge, { backgroundColor: "#E8F5E9" }]}>
                          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                          <Text style={[styles.statusText, { color: "#4CAF50" }]}>Taken</Text>
                        </View>
                      ) : (
                        <View style={[styles.statusBadge, { backgroundColor: "#FFEBEE" }]}>
                          <Ionicons name="close-circle" size={16} color="#F44336" />
                          <Text style={[styles.statusText, { color: "#F44336" }]}>Missed</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  headerGradient: { position: "absolute", top: 0, left: 0, right: 0, height: Platform.OS === "ios" ? 140 : 120 },
  content: { flex: 1, paddingTop: Platform.OS === "ios" ? 50 : 30 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 20, zIndex: 1 },
  backButton: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "white",
    justifyContent: "center", alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3,
  },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "white", marginLeft: 15 },
  filtersContainer: { paddingHorizontal: 20, marginBottom: 20, backgroundColor: "#f8f9fa", paddingTop: 10 },
  filtersScroll: { paddingRight: 20 },
  filterButton: {
    paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20,
    backgroundColor: "white", marginRight: 10, borderWidth: 1, borderColor: "#e0e0e0",
  },
  filterButtonActive: { backgroundColor: "#1a8e2d", borderColor: "#1a8e2d" },
  filterText: { fontSize: 14, fontWeight: "600", color: "#666" },
  filterTextActive: { color: "white" },
  historyContainer: { flex: 1, paddingHorizontal: 20, backgroundColor: "#f8f9fa" },
  dateGroup: { marginBottom: 25 },
  dateHeader: { fontSize: 16, fontWeight: "600", color: "#666", marginBottom: 12 },
  historyCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: "white",
    borderRadius: 16, padding: 16, marginBottom: 12,
    borderWidth: 1, borderColor: "#e0e0e0",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  medicationColor: { width: 12, height: 40, borderRadius: 6, marginRight: 16 },
  medicationInfo: { flex: 1 },
  medicationName: { fontSize: 16, fontWeight: "600", color: "#333", marginBottom: 4 },
  medicationDosage: { fontSize: 14, color: "#666", marginBottom: 2 },
  timeText: { fontSize: 14, color: "#666" },
  statusContainer: { alignItems: "flex-end" },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { marginLeft: 4, fontSize: 14, fontWeight: "600" },
});

import React, { useCallback, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useMedicines } from "../../src/context/MedicineContext";
import { ListSkeleton } from "../../src/components/LoadingSkeleton";
import EmptyState from "../../src/components/EmptyState";

const { width } = Dimensions.get("window");
const DAY_SIZE = (width - 60) / 7;

export default function CalendarScreen() {
  const router = useRouter();
  const { calendarSchedule, fetchCalendarSchedule, loading } = useMedicines();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchCalendarSchedule();
    }, [])
  );

  // Group schedule by date
  const dateMap = new Map<string, typeof calendarSchedule>();
  calendarSchedule.forEach((entry) => {
    const existing = dateMap.get(entry.date) || [];
    existing.push(entry);
    dateMap.set(entry.date, existing);
  });

  const dates = Array.from(dateMap.keys());
  const selectedEntries = selectedDate ? dateMap.get(selectedDate) || [] : [];

  const getDateStatus = (date: string) => {
    const entries = dateMap.get(date) || [];
    if (entries.length === 0) return "none";
    const allTaken = entries.every((e) => e.taken);
    const someTaken = entries.some((e) => e.taken);
    if (allTaken) return "complete";
    if (someTaken) return "partial";
    return "missed";
  };

  const statusColors: Record<string, string> = {
    complete: "#1a8e2d",
    partial: "#FF9800",
    missed: "#E53935",
    none: "#ddd",
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#2196F3", "#1976D2"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#1976D2" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Calendar</Text>
            <Text style={styles.headerSubtitle}>30-day schedule view</Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchCalendarSchedule}>
            <Ionicons name="refresh-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ListSkeleton count={5} />
        ) : dates.length === 0 ? (
          <EmptyState
            icon="calendar-outline"
            title="No Schedule Data"
            subtitle="Add medicines with schedules to see your calendar"
            actionLabel="Add Medicine"
            onAction={() => router.push("/medications/add")}
          />
        ) : (
          <>
            {/* Calendar Grid */}
            <View style={styles.calendarSection}>
              <View style={styles.legend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#1a8e2d" }]} />
                  <Text style={styles.legendText}>All taken</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#FF9800" }]} />
                  <Text style={styles.legendText}>Partial</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: "#E53935" }]} />
                  <Text style={styles.legendText}>Missed</Text>
                </View>
              </View>

              <View style={styles.calendarGrid}>
                {dates.map((date) => {
                  const status = getDateStatus(date);
                  const isSelected = selectedDate === date;
                  const d = new Date(date);
                  const dayNum = d.getDate();
                  const dayName = d.toLocaleDateString("en", { weekday: "short" }).slice(0, 2);

                  return (
                    <TouchableOpacity
                      key={date}
                      style={[styles.calendarDay, isSelected && styles.calendarDaySelected]}
                      onPress={() => setSelectedDate(isSelected ? null : date)}
                    >
                      <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>{dayName}</Text>
                      <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>{dayNum}</Text>
                      <View style={[styles.statusDot, { backgroundColor: statusColors[status] }]} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Selected Day Details */}
            {selectedDate && (
              <View style={styles.detailsSection}>
                <Text style={styles.detailsTitle}>{selectedDate}</Text>
                {selectedEntries.length === 0 ? (
                  <Text style={styles.noEntries}>No doses scheduled</Text>
                ) : (
                  selectedEntries.map((entry, idx) => (
                    <View key={idx} style={styles.entryCard}>
                      <View style={[styles.entryStatus, { backgroundColor: entry.taken ? "#E8F5E9" : "#FFEBEE" }]}>
                        <Ionicons
                          name={entry.taken ? "checkmark-circle" : "close-circle"}
                          size={20}
                          color={entry.taken ? "#1a8e2d" : "#E53935"}
                        />
                      </View>
                      <View style={styles.entryInfo}>
                        <Text style={styles.entryMedicine}>{entry.medicine}</Text>
                        <Text style={styles.entryDetail}>{entry.dosage} • {entry.scheduledTime}</Text>
                      </View>
                      <Text style={styles.entryStatusText}>
                        {entry.taken ? "Taken" : "Pending"}
                      </Text>
                    </View>
                  ))
                )}
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
  calendarSection: { paddingHorizontal: 20, marginBottom: 20 },

  legend: { flexDirection: "row", justifyContent: "center", gap: 20, marginBottom: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, color: "#888" },

  calendarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, justifyContent: "flex-start" },
  calendarDay: {
    width: DAY_SIZE - 6, height: DAY_SIZE + 10, borderRadius: 14,
    backgroundColor: "white", alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03, shadowRadius: 4, elevation: 1,
  },
  calendarDaySelected: { backgroundColor: "#1976D2" },
  dayName: { fontSize: 10, color: "#999", marginBottom: 2 },
  dayNameSelected: { color: "rgba(255,255,255,0.7)" },
  dayNum: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 4 },
  dayNumSelected: { color: "white" },
  statusDot: { width: 6, height: 6, borderRadius: 3 },

  detailsSection: { paddingHorizontal: 20, marginTop: 8 },
  detailsTitle: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 12 },
  noEntries: { fontSize: 14, color: "#999", textAlign: "center", padding: 20 },

  entryCard: {
    flexDirection: "row", alignItems: "center", backgroundColor: "white",
    borderRadius: 14, padding: 14, marginBottom: 8,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 6, elevation: 2,
  },
  entryStatus: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", marginRight: 12 },
  entryInfo: { flex: 1 },
  entryMedicine: { fontSize: 15, fontWeight: "600", color: "#333" },
  entryDetail: { fontSize: 12, color: "#999", marginTop: 2 },
  entryStatusText: { fontSize: 12, fontWeight: "600", color: "#888" },
});

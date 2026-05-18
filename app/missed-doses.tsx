import React, { useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useMedicines } from "../src/context/MedicineContext";
import { ListSkeleton } from "../src/components/LoadingSkeleton";
import EmptyState from "../src/components/EmptyState";

export default function MissedDosesScreen() {
  const router = useRouter();
  const { missedDoses, missedDosesCount, fetchMissedDoses, markDoseTaken, loading } = useMedicines();

  useFocusEffect(
    useCallback(() => {
      fetchMissedDoses();
    }, [])
  );

  const handleTakeDose = async (medicineId: string, time: string) => {
    try {
      await markDoseTaken(medicineId, time);
      Alert.alert("Success", "Dose marked as taken ✓");
      fetchMissedDoses();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to mark dose");
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#E53935", "#C62828"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#E53935" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Missed Doses</Text>
            <Text style={styles.headerSubtitle}>
              {missedDosesCount} dose{missedDosesCount !== 1 ? "s" : ""} missed today
            </Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchMissedDoses}>
            <Ionicons name="refresh-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ListSkeleton count={3} />
        ) : missedDoses.length === 0 ? (
          <EmptyState
            icon="checkmark-circle-outline"
            iconColor="#1a8e2d"
            title="All Caught Up!"
            subtitle="No missed doses today. Keep up the great work!"
          />
        ) : (
          missedDoses.map((dose, idx) => (
            <View key={`${dose.medicineId}-${dose.scheduledTime}-${idx}`} style={styles.card}>
              <View style={styles.cardIconBadge}>
                <Ionicons name="alert-circle" size={24} color="#E53935" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{dose.medicineName}</Text>
                <Text style={styles.cardDosage}>{dose.dosage}</Text>
                <View style={styles.cardTimeRow}>
                  <Ionicons name="time-outline" size={14} color="#999" />
                  <Text style={styles.cardTime}>Scheduled: {dose.scheduledTime}</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.takeBtn}
                onPress={() => handleTakeDose(dose.medicineId, dose.scheduledTime)}
              >
                <Ionicons name="checkmark" size={18} color="white" />
                <Text style={styles.takeBtnText}>Take</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "white",
    justifyContent: "center", alignItems: "center",
  },
  headerCenter: { flex: 1, marginLeft: 16 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "white" },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  refreshBtn: { padding: 8 },

  content: { flex: 1, paddingTop: 20 },
  card: {
    flexDirection: "row", alignItems: "center", backgroundColor: "white",
    borderRadius: 16, padding: 16, marginHorizontal: 20, marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
    borderLeftWidth: 4, borderLeftColor: "#E53935",
  },
  cardIconBadge: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: "#FFEBEE",
    justifyContent: "center", alignItems: "center", marginRight: 14,
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 2 },
  cardDosage: { fontSize: 13, color: "#666", marginBottom: 4 },
  cardTimeRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  cardTime: { fontSize: 12, color: "#999" },
  takeBtn: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#1a8e2d",
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, gap: 4,
  },
  takeBtnText: { color: "white", fontWeight: "600", fontSize: 13 },
});

import React, { useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useMedicines } from "../../src/context/MedicineContext";
import { ListSkeleton } from "../../src/components/LoadingSkeleton";
import EmptyState from "../../src/components/EmptyState";

export default function RefillsScreen() {
  const router = useRouter();
  const { refillAlerts, refillAlertsCount, fetchRefillAlerts, loading } = useMedicines();

  useFocusEffect(
    useCallback(() => {
      fetchRefillAlerts();
    }, [])
  );

  const criticalAlerts = refillAlerts.filter((a) => a.urgency === "CRITICAL");
  const warningAlerts = refillAlerts.filter((a) => a.urgency === "WARNING");

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FF5722", "#E64A19"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#E64A19" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Refill Alerts</Text>
            <Text style={styles.headerSubtitle}>
              {refillAlertsCount} alert{refillAlertsCount !== 1 ? "s" : ""}
              {criticalAlerts.length > 0 ? ` • ${criticalAlerts.length} critical` : ""}
            </Text>
          </View>
          <TouchableOpacity style={styles.refreshBtn} onPress={fetchRefillAlerts}>
            <Ionicons name="refresh-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ListSkeleton count={3} />
        ) : refillAlerts.length === 0 ? (
          <EmptyState
            icon="checkmark-circle-outline"
            iconColor="#1a8e2d"
            title="All Stocked Up!"
            subtitle="All your medicines have sufficient stock"
          />
        ) : (
          <>
            {/* Critical */}
            {criticalAlerts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionBadge, { backgroundColor: "#FFEBEE" }]}>
                    <Ionicons name="alert-circle" size={16} color="#E53935" />
                  </View>
                  <Text style={styles.sectionTitle}>Critical — Out of Stock</Text>
                </View>
                {criticalAlerts.map((alert) => (
                  <View key={alert.medicineId} style={[styles.card, styles.cardCritical]}>
                    <View style={styles.cardIcon}>
                      <Ionicons name="warning" size={24} color="#E53935" />
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName}>{alert.medicineName}</Text>
                      <Text style={styles.cardDosage}>{alert.dosage}</Text>
                      <View style={styles.stockBar}>
                        <View style={[styles.stockBarFill, { width: "0%", backgroundColor: "#E53935" }]} />
                      </View>
                      <Text style={styles.cardStock}>0 remaining</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Warning */}
            {warningAlerts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={[styles.sectionBadge, { backgroundColor: "#FFF3E0" }]}>
                    <Ionicons name="warning-outline" size={16} color="#FF9800" />
                  </View>
                  <Text style={styles.sectionTitle}>Warning — Low Stock</Text>
                </View>
                {warningAlerts.map((alert) => {
                  const fillPercent = alert.refillThreshold > 0
                    ? Math.min(100, (alert.currentQuantity / (alert.refillThreshold * 3)) * 100)
                    : 50;

                  return (
                    <View key={alert.medicineId} style={[styles.card, styles.cardWarning]}>
                      <View style={styles.cardIcon}>
                        <Ionicons name="cube-outline" size={24} color="#FF9800" />
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardName}>{alert.medicineName}</Text>
                        <Text style={styles.cardDosage}>{alert.dosage}</Text>
                        <View style={styles.stockBar}>
                          <View style={[styles.stockBarFill, { width: `${fillPercent}%`, backgroundColor: "#FF9800" }]} />
                        </View>
                        <Text style={styles.cardStock}>
                          {alert.currentQuantity} remaining (refill at {alert.refillThreshold})
                        </Text>
                      </View>
                    </View>
                  );
                })}
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
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  sectionBadge: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#333" },

  card: {
    flexDirection: "row", backgroundColor: "white", borderRadius: 16,
    padding: 16, marginBottom: 12, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  cardCritical: { borderLeftWidth: 4, borderLeftColor: "#E53935" },
  cardWarning: { borderLeftWidth: 4, borderLeftColor: "#FF9800" },
  cardIcon: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: "#f5f5f5",
    justifyContent: "center", alignItems: "center", marginRight: 14,
  },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 2 },
  cardDosage: { fontSize: 13, color: "#666", marginBottom: 8 },
  stockBar: { height: 6, borderRadius: 3, backgroundColor: "#f0f0f0", marginBottom: 6, overflow: "hidden" },
  stockBarFill: { height: 6, borderRadius: 3 },
  cardStock: { fontSize: 12, color: "#999" },
});

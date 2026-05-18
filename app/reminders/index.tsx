import React, { useCallback } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect } from "@react-navigation/native";
import { useReminders } from "../../src/context/ReminderContext";
import { useMedicines } from "../../src/context/MedicineContext";
import ReminderCard from "../../src/components/ReminderCard";
import { ListSkeleton } from "../../src/components/LoadingSkeleton";
import EmptyState from "../../src/components/EmptyState";

export default function RemindersListScreen() {
  const router = useRouter();
  const { reminders, loading, fetchReminders, toggleDone, deleteReminder } = useReminders();
  const { medicines } = useMedicines();

  useFocusEffect(
    useCallback(() => {
      fetchReminders();
    }, [])
  );

  const getMedicineName = (medicineId: string) => {
    const med = medicines.find((m) => m._id === medicineId);
    return med?.name || "Unknown Medicine";
  };

  const handleToggle = async (id: string, current: boolean) => {
    try {
      await toggleDone(id, !current);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to toggle reminder");
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert("Delete Reminder", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteReminder(id);
          } catch (err: any) {
            Alert.alert("Error", err.message || "Failed to delete");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#7B1FA2", "#6A1B9A"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#7B1FA2" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Reminders</Text>
            <Text style={styles.headerSubtitle}>{reminders.length} reminder{reminders.length !== 1 ? "s" : ""}</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={() => router.push("/reminders/add")}>
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ListSkeleton count={3} />
        ) : reminders.length === 0 ? (
          <EmptyState
            icon="notifications-outline"
            title="No Reminders"
            subtitle="Create reminders to stay on track with your medications"
            actionLabel="Add Reminder"
            onAction={() => router.push("/reminders/add")}
          />
        ) : (
          <View style={styles.list}>
            {reminders.map((reminder) => (
              <ReminderCard
                key={reminder._id}
                reminder={reminder}
                medicineName={getMedicineName(reminder.medicine)}
                onPress={() => router.push(`/reminders/edit/${reminder._id}` as any)}
                onToggleDone={() => handleToggle(reminder._id, reminder.isTakenToday)}
                onDelete={() => handleDelete(reminder._id)}
              />
            ))}
          </View>
        )}
        <View style={{ height: 30 }} />
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
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "white",
    justifyContent: "center", alignItems: "center",
  },
  headerCenter: { flex: 1, marginLeft: 16 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "white" },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.8)", marginTop: 2 },
  addBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center", alignItems: "center",
  },
  content: { flex: 1, paddingTop: 20 },
  list: { paddingHorizontal: 20 },
});

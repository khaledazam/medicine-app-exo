import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, Platform, ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useReminders } from "../../src/context/ReminderContext";
import { useMedicines } from "../../src/context/MedicineContext";

const REPEAT_OPTIONS = ["once", "daily", "weekly", "custom"] as const;

export default function AddReminderScreen() {
  const router = useRouter();
  const { addReminder } = useReminders();
  const { medicines, fetchMedicines } = useMedicines();
  const [saving, setSaving] = useState(false);

  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("08:00");
  const [repeatType, setRepeatType] = useState<typeof REPEAT_OPTIONS[number]>("daily");
  const [note, setNote] = useState("");

  useEffect(() => {
    if (medicines.length === 0) fetchMedicines();
  }, []);

  const handleSave = async () => {
    if (!selectedMedicine) {
      Alert.alert("Error", "Please select a medicine");
      return;
    }
    if (!dosage.trim()) {
      Alert.alert("Error", "Please enter dosage");
      return;
    }
    if (!time.trim()) {
      Alert.alert("Error", "Please enter a time");
      return;
    }

    try {
      setSaving(true);
      await addReminder({
        medicine: selectedMedicine,
        dosage: dosage.trim(),
        time: time.trim(),
        repeat: repeatType,
        note: note.trim(),
      });

      Alert.alert("Success", "Reminder created!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to create reminder");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#7B1FA2", "#6A1B9A"]} style={styles.headerGradient} />
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#7B1FA2" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Reminder</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
          {/* Select Medicine */}
          <Text style={styles.sectionTitle}>Select Medicine</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.medicineScroll}>
            {medicines.map((med) => (
              <TouchableOpacity
                key={med._id}
                style={[styles.medicineChip, selectedMedicine === med._id && styles.medicineChipSelected]}
                onPress={() => {
                  setSelectedMedicine(med._id);
                  setDosage(med.dosage);
                }}
              >
                <Ionicons name="medical" size={16} color={selectedMedicine === med._id ? "white" : "#7B1FA2"} />
                <Text style={[styles.medicineChipText, selectedMedicine === med._id && styles.medicineChipTextSelected]}>
                  {med.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dosage</Text>
            <TextInput style={styles.input} value={dosage} onChangeText={setDosage} placeholder="e.g., 500mg" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Time</Text>
            <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="08:00" />
          </View>

          <Text style={styles.sectionTitle}>Repeat</Text>
          <View style={styles.repeatGrid}>
            {REPEAT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={[styles.repeatChip, repeatType === opt && styles.repeatChipSelected]}
                onPress={() => setRepeatType(opt)}
              >
                <Text style={[styles.repeatChipText, repeatType === opt && styles.repeatChipTextSelected]}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Note (optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={note}
              onChangeText={setNote}
              placeholder="Add a note..."
              multiline
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <LinearGradient colors={["#7B1FA2", "#6A1B9A"]} style={styles.saveGradient}>
              {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>Create Reminder</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  headerGradient: { position: "absolute", top: 0, left: 0, right: 0, height: Platform.OS === "ios" ? 140 : 120 },
  content: { flex: 1, paddingTop: Platform.OS === "ios" ? 50 : 30 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 20, zIndex: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "white", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "white", marginLeft: 15 },
  form: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 12, marginTop: 8 },
  medicineScroll: { marginBottom: 20 },
  medicineChip: {
    flexDirection: "row", alignItems: "center", backgroundColor: "white",
    borderRadius: 20, paddingVertical: 10, paddingHorizontal: 16,
    marginRight: 10, borderWidth: 1.5, borderColor: "#E1BEE7", gap: 6,
  },
  medicineChipSelected: { backgroundColor: "#7B1FA2", borderColor: "#7B1FA2" },
  medicineChipText: { fontSize: 14, fontWeight: "600", color: "#7B1FA2" },
  medicineChipTextSelected: { color: "white" },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: "600", color: "#555", marginBottom: 6, marginLeft: 4 },
  input: { backgroundColor: "white", borderRadius: 14, borderWidth: 1, borderColor: "#e8e8e8", padding: 14, fontSize: 15, color: "#333" },
  textArea: { height: 80, textAlignVertical: "top" },
  repeatGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  repeatChip: { backgroundColor: "white", borderRadius: 14, paddingVertical: 10, paddingHorizontal: 20, borderWidth: 1.5, borderColor: "#E1BEE7" },
  repeatChipSelected: { backgroundColor: "#7B1FA2", borderColor: "#7B1FA2" },
  repeatChipText: { fontSize: 14, fontWeight: "600", color: "#7B1FA2" },
  repeatChipTextSelected: { color: "white" },
  footer: { padding: 20 },
  saveButton: { borderRadius: 16, overflow: "hidden" },
  saveDisabled: { opacity: 0.7 },
  saveGradient: { paddingVertical: 16, alignItems: "center" },
  saveText: { color: "white", fontSize: 17, fontWeight: "700" },
});

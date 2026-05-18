import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, Platform, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useReminders } from "../../../src/context/ReminderContext";
import { useMedicines } from "../../../src/context/MedicineContext";

const REPEAT_OPTIONS = ["once", "daily", "weekly", "custom"] as const;

export default function EditReminderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { reminders, updateReminder, fetchReminders } = useReminders();
  const { medicines } = useMedicines();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [dosage, setDosage] = useState("");
  const [time, setTime] = useState("");
  const [repeatType, setRepeatType] = useState<typeof REPEAT_OPTIONS[number]>("daily");
  const [note, setNote] = useState("");

  useEffect(() => {
    const rem = reminders.find((r) => r._id === id);
    if (rem) {
      setSelectedMedicine(rem.medicine);
      setDosage(rem.dosage);
      setTime(rem.times?.join(", ") || "");
      setRepeatType((rem.repeatType as any) || "daily");
      setNote(rem.note || "");
      setLoading(false);
    } else {
      fetchReminders().then(() => setLoading(false));
    }
  }, [id, reminders]);

  const handleSave = async () => {
    if (!dosage.trim() || !time.trim()) {
      Alert.alert("Error", "Dosage and time are required");
      return;
    }
    try {
      setSaving(true);
      await updateReminder(id!, {
        medicine: selectedMedicine,
        dosage: dosage.trim(),
        time: time.trim(),
        repeat: repeatType,
        note: note.trim(),
      });
      Alert.alert("Success", "Reminder updated", [{ text: "OK", onPress: () => router.back() }]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#7B1FA2" /></View>;
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#7B1FA2", "#6A1B9A"]} style={styles.headerGradient} />
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#7B1FA2" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Reminder</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dosage</Text>
            <TextInput style={styles.input} value={dosage} onChangeText={setDosage} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Time</Text>
            <TextInput style={styles.input} value={time} onChangeText={setTime} placeholder="08:00" />
          </View>
          <Text style={styles.sectionTitle}>Repeat</Text>
          <View style={styles.repeatGrid}>
            {REPEAT_OPTIONS.map((opt) => (
              <TouchableOpacity key={opt} style={[styles.repeatChip, repeatType === opt && styles.repeatChipSelected]} onPress={() => setRepeatType(opt)}>
                <Text style={[styles.repeatChipText, repeatType === opt && styles.repeatChipTextSelected]}>
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Note</Text>
            <TextInput style={[styles.input, styles.textArea]} value={note} onChangeText={setNote} multiline textAlignVertical="top" />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.saveButton, saving && styles.saveDisabled]} onPress={handleSave} disabled={saving}>
            <LinearGradient colors={["#7B1FA2", "#6A1B9A"]} style={styles.saveGradient}>
              {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>Save Changes</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  headerGradient: { position: "absolute", top: 0, left: 0, right: 0, height: Platform.OS === "ios" ? 140 : 120 },
  content: { flex: 1, paddingTop: Platform.OS === "ios" ? 50 : 30 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingBottom: 20, zIndex: 1 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "white", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "white", marginLeft: 15 },
  form: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#333", marginBottom: 12, marginTop: 8 },
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

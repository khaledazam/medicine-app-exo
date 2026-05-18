import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, Platform, ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMedicines } from "../../../src/context/MedicineContext";

export default function EditMedicineScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { medicines, updateMedicine, fetchMedicines } = useMedicines();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [scheduleText, setScheduleText] = useState("");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState("");
  const [refillAlertAt, setRefillAlertAt] = useState("");

  useEffect(() => {
    const med = medicines.find((m) => m._id === id);
    if (med) {
      setName(med.name);
      setDosage(med.dosage);
      setScheduleText(med.schedule?.join(", ") || "");
      setNotes(med.notes || "");
      setQuantity(String(med.quantity || 0));
      setRefillAlertAt(String(med.refillAlertAt || 5));
      setLoading(false);
    } else {
      fetchMedicines().then(() => setLoading(false));
    }
  }, [id, medicines]);

  const handleSave = async () => {
    if (!name.trim() || !dosage.trim()) {
      Alert.alert("Error", "Name and dosage are required");
      return;
    }

    const schedule = scheduleText
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    if (schedule.length === 0) {
      Alert.alert("Error", "At least one schedule time is required (e.g., 08:00, 14:00)");
      return;
    }

    try {
      setSaving(true);
      await updateMedicine(id!, {
        name: name.trim(),
        dosage: dosage.trim(),
        schedule,
        notes: notes.trim(),
        quantity: Number(quantity) || 0,
        refillAlertAt: Number(refillAlertAt) || 5,
      });

      Alert.alert("Success", "Medicine updated successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to update medicine");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a8e2d" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1a8e2d", "#146922"]} style={styles.headerGradient} />
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color="#1a8e2d" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Medicine</Text>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Medicine Name</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Medicine name" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Dosage</Text>
            <TextInput style={styles.input} value={dosage} onChangeText={setDosage} placeholder="e.g., 500mg" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Schedule Times (comma separated)</Text>
            <TextInput style={styles.input} value={scheduleText} onChangeText={setScheduleText} placeholder="08:00, 14:00, 20:00" />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={styles.label}>Quantity</Text>
              <TextInput style={styles.input} value={quantity} onChangeText={setQuantity} keyboardType="numeric" />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={styles.label}>Refill Alert At</Text>
              <TextInput style={styles.input} value={refillAlertAt} onChangeText={setRefillAlertAt} keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Additional notes..."
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
          >
            <LinearGradient colors={["#1a8e2d", "#146922"]} style={styles.saveGradient}>
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveText}>Save Changes</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
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
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "white", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: "white", marginLeft: 15 },
  form: { padding: 20, paddingBottom: 10 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: "600", color: "#555", marginBottom: 6, marginLeft: 4 },
  input: { backgroundColor: "white", borderRadius: 14, borderWidth: 1, borderColor: "#e8e8e8", padding: 14, fontSize: 15, color: "#333" },
  textArea: { height: 100, textAlignVertical: "top" },
  row: { flexDirection: "row" },
  footer: { padding: 20 },
  saveButton: { borderRadius: 16, overflow: "hidden", marginBottom: 10 },
  saveButtonDisabled: { opacity: 0.7 },
  saveGradient: { paddingVertical: 16, alignItems: "center" },
  saveText: { color: "white", fontSize: 17, fontWeight: "700" },
  cancelButton: { alignItems: "center", paddingVertical: 12 },
  cancelText: { color: "#999", fontSize: 15, fontWeight: "500" },
});

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useMedicines } from "../../src/context/MedicineContext";
import { Medicine } from "../../src/services/medicinesService";

export default function MedicineDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { medicines, markDoseTaken, deleteMedicine, fetchMedicines, uploadPrescription } = useMedicines();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const found = medicines.find((m) => m._id === id);
    if (found) {
      setMedicine(found);
      setLoading(false);
    } else {
      fetchMedicines().then(() => setLoading(false));
    }
  }, [id, medicines]);

  const handleTakeDose = async (time: string) => {
    if (!medicine) return;
    try {
      await markDoseTaken(medicine._id, time);
      Alert.alert("Success", "Dose marked as taken ✓");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to mark dose");
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Medicine",
      `Are you sure you want to delete ${medicine?.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMedicine(medicine!._id);
              router.back();
            } catch (err: any) {
              Alert.alert("Error", err.message || "Failed to delete");
            }
          },
        },
      ]
    );
  };

  const handleUploadPrescription = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "You need to grant permission to access your gallery.");
        return;
      }

      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets.length > 0) {
        if (!medicine) return;
        setUploadingImage(true);
        const imageUri = pickerResult.assets[0].uri;
        await uploadPrescription(medicine._id, imageUri);
        Alert.alert("Success", "Prescription uploaded successfully.");
      }
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err.message || "Failed to upload prescription image.");
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1a8e2d" />
      </View>
    );
  }

  if (!medicine) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="medical-outline" size={64} color="#ccc" />
        <Text style={styles.notFoundText}>Medicine not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isLowStock = medicine.quantity <= (medicine.refillAlertAt || 5);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1a8e2d", "#146922"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#1a8e2d" />
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerActionBtn}
              onPress={() => router.push(`/medications/edit/${medicine._id}` as any)}
            >
              <Ionicons name="create-outline" size={22} color="white" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionBtn} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={22} color="#FF5252" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.headerContent}>
          <View style={styles.medicineBadge}>
            <Ionicons name="medical" size={32} color="#1a8e2d" />
          </View>
          <Text style={styles.medicineName}>{medicine.name}</Text>
          <Text style={styles.medicineDosage}>{medicine.dosage}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.scheduleGrid}>
            {medicine.schedule?.map((time, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.scheduleItem}
                onPress={() => handleTakeDose(time)}
              >
                <View style={styles.scheduleIcon}>
                  <Ionicons name="time" size={18} color="#1a8e2d" />
                </View>
                <Text style={styles.scheduleTime}>{time}</Text>
                <View style={styles.takeChip}>
                  <Ionicons name="checkmark" size={14} color="white" />
                  <Text style={styles.takeChipText}>Take</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stock Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Stock Information</Text>
          <View style={[styles.stockCard, isLowStock && styles.stockCardWarning]}>
            <View style={styles.stockRow}>
              <View style={styles.stockItem}>
                <Text style={styles.stockLabel}>Remaining</Text>
                <Text style={[styles.stockValue, isLowStock && styles.stockValueWarning]}>
                  {medicine.quantity}
                </Text>
              </View>
              <View style={styles.stockDivider} />
              <View style={styles.stockItem}>
                <Text style={styles.stockLabel}>Refill At</Text>
                <Text style={styles.stockValue}>{medicine.refillAlertAt || 5}</Text>
              </View>
              <View style={styles.stockDivider} />
              <View style={styles.stockItem}>
                <Text style={styles.stockLabel}>Status</Text>
                <Text style={[styles.stockStatus, { color: isLowStock ? "#E53935" : "#1a8e2d" }]}>
                  {isLowStock ? "Low" : "OK"}
                </Text>
              </View>
            </View>
            {isLowStock && (
              <View style={styles.stockWarning}>
                <Ionicons name="warning" size={16} color="#E53935" />
                <Text style={styles.stockWarningText}>Stock is running low! Consider refilling.</Text>
              </View>
            )}
          </View>
        </View>

        {/* Notes */}
        {medicine.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesCard}>
              <Ionicons name="document-text-outline" size={20} color="#888" />
              <Text style={styles.notesText}>{medicine.notes}</Text>
            </View>
          </View>
        ) : null}

        {/* Prescription Image */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Prescription</Text>
          {medicine.prescriptionImage ? (
            <View style={styles.prescriptionCard}>
              <Image 
                source={{ uri: `${process.env.EXPO_PUBLIC_API_URL?.replace('/api', '')}/${medicine.prescriptionImage}` }} 
                style={styles.prescriptionImage} 
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.reuploadBtn} onPress={handleUploadPrescription} disabled={uploadingImage}>
                <Ionicons name="camera-reverse-outline" size={20} color="white" />
                <Text style={styles.reuploadBtnText}>{uploadingImage ? "Uploading..." : "Replace Image"}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.uploadCard} onPress={handleUploadPrescription} disabled={uploadingImage}>
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#1a8e2d" />
              ) : (
                <Ionicons name="cloud-upload-outline" size={32} color="#1a8e2d" />
              )}
              <Text style={styles.uploadText}>
                {uploadingImage ? "Uploading..." : "Upload Prescription"}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  notFoundText: { fontSize: 16, color: "#666", marginTop: 12 },
  goBackText: { fontSize: 15, color: "#1a8e2d", fontWeight: "600", marginTop: 12 },

  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "white",
    justifyContent: "center", alignItems: "center",
  },
  headerActions: { flexDirection: "row", gap: 10 },
  headerActionBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center", alignItems: "center",
  },
  headerContent: { alignItems: "center" },
  medicineBadge: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: "white",
    justifyContent: "center", alignItems: "center", marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  medicineName: { fontSize: 24, fontWeight: "800", color: "white" },
  medicineDosage: { fontSize: 16, color: "rgba(255,255,255,0.8)", marginTop: 4 },

  content: { flex: 1, paddingTop: 20 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1a1a1a", marginBottom: 12 },

  scheduleGrid: { gap: 10 },
  scheduleItem: {
    flexDirection: "row", alignItems: "center", backgroundColor: "white",
    borderRadius: 16, padding: 16, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05,
    shadowRadius: 8, elevation: 2,
  },
  scheduleIcon: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: "#E8F5E9",
    justifyContent: "center", alignItems: "center", marginRight: 12,
  },
  scheduleTime: { flex: 1, fontSize: 18, fontWeight: "700", color: "#333" },
  takeChip: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#1a8e2d",
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 4,
  },
  takeChipText: { color: "white", fontWeight: "600", fontSize: 13 },

  stockCard: {
    backgroundColor: "white", borderRadius: 16, padding: 20,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  stockCardWarning: { borderColor: "#FFCDD2", borderWidth: 1 },
  stockRow: { flexDirection: "row", justifyContent: "space-around" },
  stockItem: { alignItems: "center" },
  stockLabel: { fontSize: 12, color: "#999", marginBottom: 4 },
  stockValue: { fontSize: 28, fontWeight: "800", color: "#1a1a1a" },
  stockValueWarning: { color: "#E53935" },
  stockStatus: { fontSize: 16, fontWeight: "700" },
  stockDivider: { width: 1, backgroundColor: "#f0f0f0" },
  stockWarning: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#FFF3F3",
    borderRadius: 12, padding: 12, marginTop: 16, gap: 8,
  },
  stockWarningText: { color: "#E53935", fontSize: 13, flex: 1 },

  notesCard: {
    flexDirection: "row", backgroundColor: "white", borderRadius: 16,
    padding: 16, gap: 12, shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05,
    shadowRadius: 8, elevation: 2,
  },
  notesText: { flex: 1, fontSize: 14, color: "#666", lineHeight: 20 },

  prescriptionCard: {
    backgroundColor: "white", borderRadius: 16, overflow: "hidden", 
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  prescriptionImage: {
    width: "100%", height: 250, backgroundColor: "#f5f5f5"
  },
  reuploadBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)", padding: 12, position: "absolute",
    bottom: 15, right: 15, borderRadius: 20, gap: 6,
  },
  reuploadBtnText: { color: "white", fontWeight: "600", fontSize: 13 },
  uploadCard: {
    alignItems: "center", justifyContent: "center", backgroundColor: "white",
    borderRadius: 16, padding: 30, gap: 12, borderStyle: "dashed",
    borderWidth: 2, borderColor: "#E8F5E9",
  },
  uploadText: { fontSize: 15, color: "#1a8e2d", fontWeight: "600" },
});

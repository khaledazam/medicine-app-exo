import React, { useEffect, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { authService, User } from "../src/services/authService";
import { tokenManager } from "../src/services/api";

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await authService.getProfile();
      setUser(response.user);
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await authService.logout();
          router.replace("/auth");
        },
      },
    ]);
  };

  const initials = user ? `${(user.firstname?.[0] || "").toUpperCase()}${(user.lastname?.[0] || "").toUpperCase()}` : "??";

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#1a8e2d", "#146922"]} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={24} color="#1a8e2d" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.userName}>
            {user ? `${user.firstname || ""} ${user.lastname || ""}`.trim() : "Loading..."}
          </Text>
          <Text style={styles.userHandle}>@{user?.username || "---"}</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={20} color="#1a8e2d" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>
                  {user ? `${user.firstname || ""} ${user.lastname || ""}`.trim() : "---"}
                </Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="at-outline" size={20} color="#1a8e2d" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Username</Text>
                <Text style={styles.infoValue}>{user?.username || "---"}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.card}>
            {[
              { icon: "medical-outline" as const, label: "My Medicines", route: "/home" },
              { icon: "notifications-outline" as const, label: "Reminders", route: "/reminders" },
              { icon: "bar-chart-outline" as const, label: "Daily Summary", route: "/daily-summary" },
              { icon: "calendar-outline" as const, label: "Calendar", route: "/calendar" },
              { icon: "alert-circle-outline" as const, label: "Missed Doses", route: "/missed-doses" },
              { icon: "people-outline" as const, label: "Caregiver View", route: "/caregiver" },
            ].map((item, idx) => (
              <React.Fragment key={item.label}>
                {idx > 0 && <View style={styles.divider} />}
                <TouchableOpacity style={styles.linkRow} onPress={() => router.push(item.route as any)}>
                  <Ionicons name={item.icon} size={20} color="#1a8e2d" />
                  <Text style={styles.linkLabel}>{item.label}</Text>
                  <Ionicons name="chevron-forward" size={18} color="#ccc" />
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#E53935" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>MedRemind v1.0.0</Text>
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    paddingTop: Platform.OS === "ios" ? 56 : 40, paddingBottom: 30,
    borderBottomLeftRadius: 30, borderBottomRightRadius: 30,
  },
  headerRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, marginBottom: 20,
  },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "white", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "white" },
  avatarSection: { alignItems: "center" },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: "white",
    justifyContent: "center", alignItems: "center", marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 5,
  },
  avatarText: { fontSize: 28, fontWeight: "800", color: "#1a8e2d" },
  userName: { fontSize: 22, fontWeight: "700", color: "white" },
  userHandle: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 2 },

  content: { flex: 1, paddingTop: 20 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: { fontWeight: "700", color: "#888", marginBottom: 10, marginLeft: 4, textTransform: "uppercase", letterSpacing: 0.5, fontSize: 12 },

  card: {
    backgroundColor: "white", borderRadius: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    overflow: "hidden",
  },
  infoRow: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  infoContent: { flex: 1 },
  infoLabel: { fontSize: 12, color: "#999", marginBottom: 2 },
  infoValue: { fontSize: 15, fontWeight: "600", color: "#333" },

  linkRow: { flexDirection: "row", alignItems: "center", padding: 16, gap: 14 },
  linkLabel: { flex: 1, fontSize: 15, fontWeight: "500", color: "#333" },

  divider: { height: 1, backgroundColor: "#f0f0f0", marginHorizontal: 16 },

  logoutButton: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    backgroundColor: "#FFEBEE", borderRadius: 16, padding: 16, gap: 8,
  },
  logoutText: { fontSize: 16, fontWeight: "700", color: "#E53935" },
  version: { textAlign: "center", fontSize: 12, color: "#ccc", marginTop: 10, marginBottom: 10 },
});

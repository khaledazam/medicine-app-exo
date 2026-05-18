import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { tokenManager } from "../src/services/api";
import { authService } from "../src/services/authService";

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Check for existing session
    const checkAuth = async () => {
      try {
        const token = await tokenManager.getToken();
        if (token) {
          // Validate token by fetching profile
          try {
            await authService.getProfile();
            // Token valid — go to home
            setTimeout(() => router.replace("/home"), 1500);
            return;
          } catch {
            // Token invalid — clear and go to auth
            await tokenManager.removeToken();
          }
        }
        // No token or invalid — go to auth
        setTimeout(() => router.replace("/auth"), 2000);
      } catch (error) {
        setTimeout(() => router.replace("/auth"), 2000);
      }
    };

    checkAuth();
  }, []);

  return (
    <LinearGradient
      colors={["#1a8e2d", "#146922", "#0d4f18"]}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View
          style={[styles.logoCircle, { transform: [{ scale: pulseAnim }] }]}
        >
          <Ionicons name="medical" size={50} color="#1a8e2d" />
        </Animated.View>
        <Text style={styles.appName}>MedRemind</Text>
        <Text style={styles.tagline}>Your health, on schedule</Text>
      </Animated.View>

      <Animated.View style={[styles.bottomSection, { opacity: fadeAnim }]}>
        <View style={styles.loadingDots}>
          <View style={[styles.dot, styles.dotActive]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  appName: {
    color: "white",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: 1.5,
  },
  tagline: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 16,
    marginTop: 8,
    fontWeight: "400",
  },
  bottomSection: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
  },
  loadingDots: {
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: {
    backgroundColor: "white",
  },
});

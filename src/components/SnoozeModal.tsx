import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SnoozeModalProps {
  visible: boolean;
  medicineName: string;
  onSnooze: (minutes: number) => void;
  onDismiss: () => void;
  onTakeNow: () => void;
}

const SNOOZE_OPTIONS = [
  { label: '10 minutes', minutes: 10, icon: 'time-outline' as const },
  { label: '30 minutes', minutes: 30, icon: 'timer-outline' as const },
  { label: '1 hour', minutes: 60, icon: 'hourglass-outline' as const },
];

export default function SnoozeModal({
  visible,
  medicineName,
  onSnooze,
  onDismiss,
  onTakeNow,
}: SnoozeModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View style={styles.iconCircle}>
              <Ionicons name="notifications" size={28} color="#1a8e2d" />
            </View>
            <Text style={styles.title}>Medication Reminder</Text>
            <Text style={styles.subtitle}>Time to take {medicineName}</Text>
          </View>

          <TouchableOpacity style={styles.takeNowButton} onPress={onTakeNow}>
            <Ionicons name="checkmark-circle" size={22} color="white" />
            <Text style={styles.takeNowText}>Take Now</Text>
          </TouchableOpacity>

          <Text style={styles.snoozeLabel}>Or snooze for...</Text>

          <View style={styles.snoozeOptions}>
            {SNOOZE_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.minutes}
                style={styles.snoozeOption}
                onPress={() => onSnooze(option.minutes)}
              >
                <Ionicons name={option.icon} size={20} color="#666" />
                <Text style={styles.snoozeOptionText}>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={styles.dismissButton} onPress={onDismiss}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#ddd',
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
  },
  takeNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a8e2d',
    borderRadius: 16,
    padding: 16,
    gap: 8,
    marginBottom: 20,
  },
  takeNowText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '700',
  },
  snoozeLabel: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 12,
  },
  snoozeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  snoozeOption: {
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    gap: 6,
  },
  snoozeOptionText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  dismissButton: {
    alignItems: 'center',
    padding: 14,
  },
  dismissText: {
    fontSize: 15,
    color: '#999',
    fontWeight: '500',
  },
});

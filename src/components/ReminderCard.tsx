import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Reminder } from '../services/reminderService';

interface ReminderCardProps {
  reminder: Reminder;
  medicineName?: string;
  onPress?: () => void;
  onToggleDone?: () => void;
  onDelete?: () => void;
}

export default function ReminderCard({
  reminder,
  medicineName,
  onPress,
  onToggleDone,
  onDelete,
}: ReminderCardProps) {
  const repeatLabel = {
    once: 'Once',
    daily: 'Daily',
    weekly: 'Weekly',
    custom: 'Custom',
  }[reminder.repeatType] || 'Daily';

  return (
    <TouchableOpacity
      style={[styles.card, reminder.isTakenToday && styles.cardDone]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <TouchableOpacity
        style={[styles.checkbox, reminder.isTakenToday && styles.checkboxDone]}
        onPress={onToggleDone}
      >
        {reminder.isTakenToday && (
          <Ionicons name="checkmark" size={16} color="white" />
        )}
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={[styles.medicineName, reminder.isTakenToday && styles.textDone]}>
          {medicineName || 'Medicine'}
        </Text>
        <Text style={styles.dosage}>{reminder.dosage}</Text>
        <View style={styles.meta}>
          <View style={styles.timeBadge}>
            <Ionicons name="time-outline" size={12} color="#1a8e2d" />
            <Text style={styles.timeText}>
              {reminder.times?.join(', ') || '--:--'}
            </Text>
          </View>
          <View style={styles.repeatBadge}>
            <Ionicons name="repeat-outline" size={12} color="#666" />
            <Text style={styles.repeatText}>{repeatLabel}</Text>
          </View>
        </View>
        {reminder.note ? (
          <Text style={styles.note} numberOfLines={1}>📝 {reminder.note}</Text>
        ) : null}
      </View>

      {onDelete && (
        <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
          <Ionicons name="trash-outline" size={18} color="#E53935" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDone: {
    backgroundColor: '#f8fdf8',
    opacity: 0.8,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#1a8e2d',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  checkboxDone: {
    backgroundColor: '#1a8e2d',
    borderColor: '#1a8e2d',
  },
  info: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  textDone: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  dosage: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  timeText: {
    fontSize: 12,
    color: '#1a8e2d',
    fontWeight: '600',
  },
  repeatBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  repeatText: {
    fontSize: 12,
    color: '#666',
  },
  note: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

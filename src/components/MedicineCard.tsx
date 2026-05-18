import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Medicine } from '../services/medicinesService';

interface MedicineCardProps {
  medicine: Medicine;
  onPress?: () => void;
  onTakeDose?: (time: string) => void;
  showTakeButton?: boolean;
  compact?: boolean;
}

export default function MedicineCard({
  medicine,
  onPress,
  onTakeDose,
  showTakeButton = true,
  compact = false,
}: MedicineCardProps) {
  const isLowStock = medicine.quantity <= (medicine.refillAlertAt || 5);
  const nextTime = medicine.schedule?.[0] || '--:--';

  return (
    <TouchableOpacity
      style={[styles.card, compact && styles.cardCompact]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconBadge, isLowStock && styles.iconBadgeWarning]}>
        <Ionicons
          name="medical"
          size={compact ? 20 : 24}
          color={isLowStock ? '#E53935' : '#1a8e2d'}
        />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{medicine.name}</Text>
        <Text style={styles.dosage}>{medicine.dosage}</Text>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color="#888" />
            <Text style={styles.metaText}>
              {medicine.schedule?.length || 0}x daily
            </Text>
          </View>
          {medicine.quantity > 0 && (
            <View style={[styles.metaItem, isLowStock && styles.metaItemWarning]}>
              <Ionicons
                name="cube-outline"
                size={14}
                color={isLowStock ? '#E53935' : '#888'}
              />
              <Text style={[styles.metaText, isLowStock && styles.metaTextWarning]}>
                {medicine.quantity} left
              </Text>
            </View>
          )}
        </View>
      </View>

      {showTakeButton && onTakeDose && (
        <TouchableOpacity
          style={styles.takeButton}
          onPress={() => onTakeDose(nextTime)}
        >
          <Ionicons name="checkmark" size={20} color="white" />
        </TouchableOpacity>
      )}

      {!showTakeButton && onPress && (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
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
  cardCompact: {
    padding: 12,
    marginBottom: 8,
  },
  iconBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  iconBadgeWarning: {
    backgroundColor: '#FFEBEE',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  dosage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItemWarning: {
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 12,
    color: '#888',
  },
  metaTextWarning: {
    color: '#E53935',
    fontWeight: '600',
  },
  takeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1a8e2d',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});

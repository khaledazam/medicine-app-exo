import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { medicinesService, Medicine } from '../../services/medicinesService';
import React from 'react';

export default function MedicinesListScreen() {
    const [medicines, setMedicines] = useState<Medicine[]>([]);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            loadMedicines();
        }, [])
    );

    const loadMedicines = async () => {
        try {
            setLoading(true);
            const data = await medicinesService.getAllMedicines();
            setMedicines(data);
        } catch (error) {
            Alert.alert('Error', (error as Error).message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <ActivityIndicator size="large" />;

    return (
        <View style={{ flex: 1, padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>أدويتي</Text>
            <FlatList
                data={medicines}
                keyExtractor={(item) => item._id}
                renderItem={({ item }) => (
                    <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{item.name}</Text>
                        <Text style={{ color: '#666' }}>الجرعة: {item.dosage}</Text>
                        <Text style={{ color: '#666' }}>الأوقات: {item.schedule.join(', ')}</Text>
                    </View>
                )}
            />
        </View>
    );
}

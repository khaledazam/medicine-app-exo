import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterScreen() {
    const [firstname, setFirstname] = useState('');
    const [lastname, setLastname] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [cpassword, setCpassword] = useState('');
    const { register, loading } = useAuth();

    const handleRegister = async () => {
        try {
            if (!username || !password || password !== cpassword) {
                Alert.alert('Error', 'Please fill all fields and ensure passwords match');
                return;
            }
            await register(firstname, lastname, username, password, cpassword);
        } catch (error) {
            Alert.alert('Registration Failed', (error as Error).message);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Register</Text>
            <TextInput style={styles.input} placeholder="First Name" value={firstname} onChangeText={setFirstname} />
            <TextInput style={styles.input} placeholder="Last Name" value={lastname} onChangeText={setLastname} />
            <TextInput style={styles.input} placeholder="Username" value={username} onChangeText={setUsername} autoCapitalize="none" />
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
            <TextInput style={styles.input} placeholder="Confirm Password" value={cpassword} onChangeText={setCpassword} secureTextEntry />
            <Button title={loading ? 'Loading...' : 'Register'} onPress={handleRegister} disabled={loading} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
    },
});

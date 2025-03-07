import { useState } from 'react';
import { View, TextInput, Pressable, Alert, StyleSheet, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { useAuthStore } from '@/lib/AuthStore';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { signup } = useAuthStore();

    const handleSignup = async () => {
        try {
            await signup(email, password);

            router.replace('/(tabs)'); // Redirect to home after signup
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Signup Failed', error.message);
            } else {
                Alert.alert('Signup Failed', 'An unknown error occurred');
            }
        }
    };

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
            />
            <TextInput
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
            />
            <View style={styles.buttonContainer}>
                <Pressable onPress={handleSignup} style={styles.button}>
                    <Text style={styles.buttonText}>Sign Up</Text>
                </Pressable>
            </View>
            <View style={styles.linkContainer}>
                <Text>Already have an account?</Text>
                <Link href="/login" style={styles.link}>Login</Link>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingInline: 24,
        paddingBottom: '20%',
        backgroundColor: '#E8F5E9',
    },
    input: {
        height: 40,
        borderColor: '#4CAF50',
        borderWidth: 1,
        marginBottom: 12,
        paddingHorizontal: 8,
        backgroundColor: '#FFFFFF',
    },
    buttonContainer: {
        width: '50%',
        alignSelf: 'center',
        borderRadius: 8,
        overflow: 'hidden',
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 12,
        alignItems: 'center',
        borderRadius: 8,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    link: {
        color: '#4CAF50',
        marginLeft: 4,
    },
});
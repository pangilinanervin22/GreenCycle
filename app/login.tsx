import { useEffect, useState } from 'react';
import { View, TextInput, Pressable, Alert, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Link, Redirect, router } from 'expo-router';
import { useAuthStore } from '@/lib/AuthStore';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, user, loading, initializeAuth } = useAuthStore();

    // Initialize auth state on mount
    useEffect(() => {
        initializeAuth();
    }, []);

    // Show a loading indicator while checking auth state
    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (user) {
        return <Redirect href="/(tabs)" />;
    }

    const handleLogin = async () => {
        try {
            await login(email, password);
            router.replace('/(tabs)'); // Redirect to home after login
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Login Failed', error.message);
            } else {
                Alert.alert('Login Failed', 'An unknown error occurred');
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
                <Pressable onPress={handleLogin} style={styles.button}>
                    <Text style={styles.buttonText}>Login</Text>
                </Pressable>
            </View>
            <View style={styles.linkContainer}>
                <Text>Don't have an account?</Text>
                <Link href="/signup" style={styles.link}>Sign up</Link>
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

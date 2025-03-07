import { useState } from 'react';
import { View, TextInput, Pressable, Alert, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import { useAuthStore } from '@/lib/AuthStore';
import Colors from '@/constants/Colors';

export default function Signup() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { signup, loading } = useAuthStore();

    const handleSignup = async () => {
        if (password !== confirmPassword) {
            Alert.alert('Passwords do not match');
            return;
        }
        try {
            await signup(email, password);
            router.replace('/(tabs)');
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
            <Image
                source={require('../assets/images/logo.svg')}
                style={styles.logo}
                cachePolicy="memory-disk"
                contentFit="contain"
            />
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Create Account</Text>
                <Text style={styles.subText}>Sign up to get started</Text>
            </View>
            <Text style={styles.label}>Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholderTextColor={Colors.light.text}
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholderTextColor={Colors.light.text}
            />
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                style={styles.input}
                placeholderTextColor={Colors.light.text}
            />
            <View style={styles.buttonContainer}>
                <Pressable onPress={handleSignup} style={styles.button}>
                    {loading ? (
                        <ActivityIndicator color={Colors.light.text} />
                    ) : (
                        <Text style={styles.buttonText}>Sign Up</Text>
                    )}
                </Pressable>
            </View>
            <View style={styles.linkContainer}>
                <Text style={styles.linkText}>Already have an account?</Text>
                <Link href="/login" style={styles.link}>Login</Link>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        display: 'flex',
        flex: 1,
        justifyContent: 'flex-start',
        paddingInline: 24,
        paddingTop: '30%',
        backgroundColor: Colors.light.background,
    },
    logo: {
        position: 'absolute',
        top: 0,
        right: 16,
        width: '15%',
        height: '15%',
    },
    welcomeContainer: {
        marginBottom: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 4,
    },
    welcomeText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: Colors.light.text,
    },
    subText: {
        fontSize: 16,
        color: Colors.light.text,
        fontWeight: '400',
    },
    label: {
        fontSize: 16,
        color: Colors.light.text,
        marginBottom: 8,
    },
    input: {
        height: 40,
        borderColor: Colors.light.text,
        borderWidth: 2,
        marginBottom: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        color: Colors.light.text,
        backgroundColor: 'transparent',
    },
    buttonContainer: {
        width: '50%',
        alignSelf: 'center',
        borderRadius: 8,
        overflow: 'hidden',
    },
    button: {
        backgroundColor: 'transparent',
        padding: 12,
        alignItems: 'center',
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: Colors.light.text,
        marginTop: 12,
    },
    buttonText: {
        color: Colors.light.text,
        fontWeight: 'bold',
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    linkText: {
        color: Colors.light.text,
    },
    link: {
        fontSize: 16,
        color: Colors.light.text,
        marginLeft: 4,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});
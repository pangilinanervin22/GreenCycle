import { useEffect, useState } from 'react';
import { View, TextInput, Pressable, Alert, StyleSheet, Text, ActivityIndicator, useColorScheme } from 'react-native';
import { Image } from 'expo-image';
import { Link, Redirect, router } from 'expo-router';
import { useAuthStore } from '@/lib/AuthStore';
import Colors from '@/constants/Colors';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, user, loading, initializeAuth } = useAuthStore();
    const colorScheme = useColorScheme();
    const selectedTheme = colorScheme === 'dark' ? 'dark' : 'light';
    const theme = Colors[selectedTheme];

    useEffect(() => {
        initializeAuth();
    }, []);

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
            router.replace('/(tabs)');
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
            <Image
                source={require('../assets/images/logo_white.svg')}
                style={styles.logo}
                cachePolicy="memory-disk"
                contentFit="contain"
            />
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Welcome Back</Text>
                <Text style={styles.subText}>Login to continue</Text>
            </View>
            <Text style={styles.label}>Email</Text>
            <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholderTextColor={Colors.dark.secondaryTextColor}
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                style={styles.input}
                placeholderTextColor={Colors.dark.secondaryTextColor}
            />
            <View style={styles.buttonContainer}>
                <Pressable onPress={handleLogin} style={styles.button}>
                    <Text style={styles.buttonText}>Login</Text>
                </Pressable>
            </View>
            <View style={styles.linkContainer}>
                <Text style={styles.linkText}>Don't have an account?</Text>
                <Link href="/signup" style={styles.link}>
                    Sign up
                </Link>
            </View>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: '30%',
        backgroundColor: Colors.dark.backgroundColor,
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
        alignItems: 'center',
        justifyContent: 'center',
    },
    welcomeText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: Colors.dark.secondaryTextColor,
    },
    subText: {
        fontSize: 16,
        color: Colors.dark.secondaryTextColor,
    },
    label: {
        fontSize: 16,
        color: Colors.dark.secondaryTextColor,
        marginBottom: 8,
    },
    input: {
        height: 40,
        borderColor: Colors.dark.secondaryTextColor,
        borderWidth: 1.5,
        marginBottom: 12,
        paddingHorizontal: 8,
        borderRadius: 8,
        color: Colors.dark.secondaryTextColor,
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
        borderWidth: 1,
        borderColor: Colors.dark.secondaryTextColor,
        marginTop: 12,
    },
    buttonText: {
        color: Colors.dark.secondaryTextColor,
        fontWeight: 'bold',
    },
    linkContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 12,
    },
    linkText: {
        color: Colors.dark.secondaryTextColor,
    },
    link: {
        fontSize: 16,
        color: Colors.dark.secondaryTextColor,
        marginLeft: 4,
        fontWeight: 'bold',
        textDecorationLine: 'underline',
    },
});

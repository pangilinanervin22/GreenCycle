import { useEffect } from 'react';
import { View, TextInput, Pressable, Alert, StyleSheet, Text, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Image } from 'expo-image';
import { Link, Redirect, router } from 'expo-router';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/lib/AuthStore';
import Colors from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';

const loginSchema = z.object({
    email: z.string().email('Invalid email address').nonempty('Email is required'),
    password: z.string().min(9, 'Password must be at least 9 characters').nonempty('Password is required'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
    const { login, user, loading, initializeAuth } = useAuthStore();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

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

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data.email, data.password);
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
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            {/* Arrow button on the left side */}
            <Pressable style={styles.arrowButton} onPress={() => router.back()}>
                <FontAwesome name="arrow-left" size={24} color={Colors.dark.secondaryTextColor} />
            </Pressable>

            {/* Logo on the right */}
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
            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={styles.input}
                        placeholderTextColor={Colors.dark.secondaryTextColor}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />
            {errors.email && <Text style={{ color: 'red' }}>{errors.email.message}</Text>}

            <Text style={styles.label}>Password</Text>
            <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        secureTextEntry
                        style={styles.input}
                        placeholderTextColor={Colors.dark.secondaryTextColor}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />
            {errors.password && <Text style={{ color: 'red' }}>{errors.password.message}</Text>}

            <View style={styles.buttonContainer}>
                <Pressable onPress={handleSubmit(onSubmit)} style={styles.button}>
                    <Text style={styles.buttonText}>Login</Text>
                </Pressable>
            </View>
            <View style={styles.linkContainer}>
                <Text style={styles.linkText}>Don't have an account?</Text>
                <Link href="/signup" style={styles.link}>
                    Sign up
                </Link>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: '30%',
        backgroundColor: Colors.dark.backgroundColor,
    },
    arrowButton: {
        position: 'absolute',
        top: 40,
        left: 16,
        zIndex: 1,
        padding: 8,
    },
    logo: {
        position: 'absolute',
        top: 40,
        right: 16,
        width: 60,
        height: 60,
        zIndex: 1,
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

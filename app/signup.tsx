import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/lib/AuthStore';
import { View, TextInput, Pressable, Alert, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Link, router } from 'expo-router';
import Colors from '@/constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';


const SignupSchema = z
    .object({
        email: z.string().email('Invalid email'),
        password: z.string().min(9, 'Password must be at least 9 characters'),
        confirmPassword: z.string().min(9, 'Password must be at least 9 characters'),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Passwords do not match',
        path: ['confirmPassword'],
    });

export default function Signup() {
    const { signup, loading } = useAuthStore();
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({ resolver: zodResolver(SignupSchema) });

    const onSubmit = async (data: { email: string; password: string; confirmPassword: string }) => {
        try {
            await signup(data.email, data.password);
            router.replace('/(tabs)');
        } catch (error) {
            Alert.alert('Signup Failed', error instanceof Error ? error.message : 'Unknown error');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.topContainer}>
                <Pressable onPress={() => router.push('/start')} style={styles.backButton}>
                    <FontAwesome name="arrow-left" size={24} color={Colors.light.text} />
                </Pressable>
                <Image
                    source={require('../assets/images/logo.svg')}
                    style={styles.logo}
                    cachePolicy="memory-disk"
                    contentFit="contain"
                />
            </View>
            <View style={styles.welcomeContainer}>
                <Text style={styles.welcomeText}>Create Account</Text>
                <Text style={styles.subText}>Sign up to get started</Text>
            </View>
            <Text style={styles.label}>Email</Text>
            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        placeholder="Enter email"
                        style={styles.input}
                        placeholderTextColor={Colors.light.text}
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
                        placeholder="Enter password"
                        style={styles.input}
                        placeholderTextColor={Colors.light.text}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />
            {errors.password && <Text style={{ color: 'red' }}>{errors.password.message}</Text>}

            <Text style={styles.label}>Confirm Password</Text>
            <Controller
                control={control}
                name="confirmPassword"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        secureTextEntry
                        placeholder="Confirm password"
                        style={styles.input}
                        placeholderTextColor={Colors.light.text}
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />
            {errors.confirmPassword && <Text style={{ color: 'red' }}>{errors.confirmPassword.message}</Text>}

            <View style={styles.buttonContainer}>
                <Pressable onPress={handleSubmit(onSubmit)} style={styles.button}>
                    {loading ? <ActivityIndicator color={Colors.light.text} /> : <Text style={styles.buttonText}>Sign Up</Text>}
                </Pressable>
            </View>
            <View style={styles.linkContainer}>
                <Text style={styles.linkText}>Already have an account?</Text>
                <Link href="/login" style={styles.link}>
                    Login
                </Link>
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
    topContainer: {
        position: 'absolute',
        top: 40,
        left: 24,
        right: 24,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 1,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 18,
        color: Colors.light.text,
        fontWeight: 'bold',
    },
    logo: {
        width: 60,
        height: 60,
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
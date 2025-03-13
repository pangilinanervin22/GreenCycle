import { StyleSheet, Text, View, TextInput, Button } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '@/lib/AuthStore';
import { useRouter } from 'expo-router';

interface ProfileFormData {
    name: string;
    description?: string;
    email?: string;
}

const schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().optional(),
    email: z.string().email().optional(),
});

export default function ProfileDetails() {
    const { user, updateAccount } = useAuthStore();
    const router = useRouter();

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            name: user?.name || '',
            description: user?.description || '',
            email: user?.email || '',
        },
    });

    const onSubmit = async (data: ProfileFormData) => {
        await updateAccount(data.name, data.description);

        router.push('/profile');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Edit Your Profile</Text>

            <Controller
                name="name"
                control={control}
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        style={styles.input}
                        placeholder="Name"
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />
            {errors.name && <Text>{errors.name.message}</Text>}

            <Controller
                name="description"
                control={control}
                render={({ field: { onChange, value } }) => (
                    <TextInput
                        style={styles.input}
                        placeholder="Description"
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />

            <Controller
                name="email"
                control={control}
                render={({ field: { value } }) => (
                    <TextInput
                        style={[styles.input, { backgroundColor: '#f0f0f0' }]}
                        editable={false}
                        value={value}
                    />
                )}
            />

            <Button title="Submit" onPress={handleSubmit(onSubmit)} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 22,
        marginBottom: 8,
        color: '#000',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 12,
        padding: 8,
        borderRadius: 4,
    },
});

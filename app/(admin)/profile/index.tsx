import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { Button, Image } from 'react-native';
import { useAuthStore } from '@/lib/AuthStore';

export default function ProfilePage() {
    const router = useRouter();
    const { user, logout } = useAuthStore();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome, {user?.name}</Text>
            <View style={styles.separator} />
            <Text style={styles.info}>{user?.description}</Text>
            <View style={styles.separator} />
            <Button title="Edit Profile" onPress={() => router.push(`/(tabs)/profile/[${user?.id}]`)} />
            <Button title="Logout" onPress={logout} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
        alignItems: 'center',
        paddingTop: 50,
        paddingHorizontal: 20
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 20
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 5,
        color: '#000'
    },
    username: {
        fontSize: 18,
        fontWeight: '500',
        color: '#000'
    },
    separator: {
        marginVertical: 20,
        height: 1,
        width: '80%',
        backgroundColor: '#ccc'
    },
    info: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 20,
        color: '#000'
    }
});

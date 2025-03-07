import { StyleSheet } from 'react-native';
import { Text, View } from '@/components/Themed';
import { useRouter } from 'expo-router';
import { Button } from 'react-native';

export default function ProfilePage() {
    const router = useRouter();
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile Page</Text>
            <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
            <Button
                title="Go to Home"
                onPress={() => router.push('/(tabs)')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
});

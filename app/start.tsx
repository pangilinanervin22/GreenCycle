import { View, StyleSheet, Text } from 'react-native';
import { Link } from 'expo-router';

export default function StartTab() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>GreenCycle</Text>
            <View style={styles.buttonContainer}>
                <Link href="/login" style={styles.button}>
                    <Text style={styles.buttonText}>Login</Text>
                </Link>
                <Link href="/signup" style={styles.button}>
                    <Text style={styles.buttonText}>Sign up</Text>
                </Link>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingInline: 24,
        backgroundColor: '#E8F5E9',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 24,
        color: '#4CAF50',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },
    button: {
        backgroundColor: '#4CAF50',
        padding: 12,
        alignItems: 'center',
        borderRadius: 8,
        flex: 1,
        marginHorizontal: 5,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

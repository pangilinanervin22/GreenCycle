import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams, } from 'expo-router';

export default function ProfileDetails() {
    const { id } = useLocalSearchParams();

    return (
        <View style={styles.container} >
            <Text style={styles.title} onPress={() => alert('Button pressed!')}>
                {id}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    notFound: {
        fontWeight: 'bold',
        fontSize: 16,
    },
    title: {
        fontWeight: 'bold',
        fontSize: 22,
        marginBottom: 8,
        color: '#000',
    },
    image: {
        width: '100%',
        height: 250,
        borderRadius: 6,
        marginBottom: 8,
    },
    description: {
        fontSize: 16,
        color: '#000',
    },
});

'/post/2'
import { View, StyleSheet, Text } from 'react-native';
import { Link } from 'expo-router';
import { Image } from 'expo-image';



export default function StartTab() {
    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/images/landing_background.png')}
                style={styles.titleImage}
                contentFit="cover"
            />
            <View style={styles.titleContainer}>
                <Image
                    source={require('../assets/images/logo.svg')}
                    style={styles.logo}
                    contentFit="fill"
                />
                <Text style={styles.title}>GreenCycle</Text>
            </View>
            <View style={styles.buttonContainer}>
                <Link href="/login" style={styles.transparentButton}>
                    <Text style={styles.buttonText}>LOGIN</Text>
                </Link>
                <Link href="/signup" style={styles.button}>
                    <Text style={styles.buttonText}>SIGNUP</Text>
                </Link>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        width: '100%',
        height: '100%',
        paddingBottom: '5%',
    },
    titleImage: {
        width: '120%',
        height: '50%',
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    logo: {
        width: 80,
        height: 80,
        marginRight: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#00512C',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
        width: '90%',
    },
    button: {
        backgroundColor: '#00512C',
        paddingVertical: 12,
        marginHorizontal: 12,
        alignItems: 'center',
        borderRadius: 16,
        flex: 1,
        textAlign: 'center',
    },
    transparentButton: {
        backgroundColor: 'transparent',
        paddingVertical: 12,
        marginHorizontal: 12,
        alignItems: 'center',
        borderRadius: 16,
        flex: 1,
        textAlign: 'center',
        borderColor: '#00512C',
        borderWidth: 2,
    },
    buttonText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
});

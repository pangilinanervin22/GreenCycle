import { Image } from 'expo-image';
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

type DefaultLoadingProps = {
    loading: boolean;
};

export default function DefaultLoading({ loading }: DefaultLoadingProps) {
    if (!loading) return null;

    return (
        <View style={styles.container}>
            <Image
                source={require('../assets/images/logo.svg')}
                style={styles.image}
                contentFit="contain"
                cachePolicy="memory-disk"
            />
            <Text style={styles.title}>Green Recycle</Text>
            <ActivityIndicator size="large" color="green" />
            <Text style={styles.loadingText}>Loading...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        gap: 20,
    },
    image: {
        width: 100,
        height: 100,
        marginVertical: 20,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    loadingText: {
        marginVertical: 10,
        color: 'gray',
    },
});
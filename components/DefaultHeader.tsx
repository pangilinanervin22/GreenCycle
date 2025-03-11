import { Image } from 'expo-image';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DefaultTitleHeader() {
    return (
        <View style={styles.header}>
            <Image
                source={require('../assets/images/logo.svg')}
                style={styles.logo}
                contentFit='contain'
            />
            <Text style={styles.title}>GreenCycle</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        paddingBottom: 10,
    },
    logo: {
        width: 40,
        height: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        height: "100%",
        textAlignVertical: 'top',
        color: '#00512C',
    },
});
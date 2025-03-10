import { Alert, Button, Pressable, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { Link, Stack, useLocalSearchParams, useNavigation } from 'expo-router';
import { usePostStore } from '@/lib/PostStore';
import { useEffect } from 'react';
import { FontAwesome } from '@expo/vector-icons';

export default function PostDetail() {
    const { id } = useLocalSearchParams();
    const { findPost, posts } = usePostStore();
    const currentPost = findPost(id as string);
    console.log(currentPost, id, posts);

    if (!currentPost) {
        return (
            <View style={styles.container}>
                <Text style={styles.notFound}>Post not found.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container} >
            <Text style={styles.title} onPress={() => alert('Button pressed!')}>
                {currentPost.title}
            </Text>
            <Image
                style={styles.image}
                contentFit="cover"
                source={{ uri: currentPost.image_url }}
            />
            <Text style={styles.description}>{currentPost.description}</Text>
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
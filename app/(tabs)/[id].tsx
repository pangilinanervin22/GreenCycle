import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { usePostStore } from '@/lib/PostStore';

export default function PostDetail() {
    const { id } = useLocalSearchParams();
    const { findPost } = usePostStore();
    const currentPost = findPost(id as string);

    if (!currentPost) {
        return (
            <View style={styles.container}>
                <Text style={styles.notFound}>Post not found.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Image style={styles.image} contentFit="cover" source={{ uri: currentPost.image_url }} />
            <Text style={styles.title}>{currentPost.title}</Text>
            <Text style={styles.description}>{currentPost.description}</Text>
            <Text style={styles.subtitle}>Author: {currentPost.author_name}</Text>
            <Text style={styles.subtitle}>Likes: {currentPost.likes.count || 0}</Text>
            <Text style={styles.subtitle}>Ingredients:</Text>
            {currentPost.ingredients?.map((ingredient, i) => (
                <Text key={i} style={styles.ingredientItem}>
                    {ingredient}
                </Text>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 16,
        paddingVertical: 24,
        backgroundColor: '#f5f5f5',
    },
    notFound: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 24,
        marginBottom: 16,
        color: '#333',
        alignSelf: 'center',
    },
    image: {
        width: '100%',
        height: 250,
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#ddd',
    },
    description: {
        fontSize: 16,
        color: '#444',
        marginBottom: 12,
        lineHeight: 22,
        textAlign: 'justify',
    },
    subtitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 12,
        color: '#333',
    },
    ingredientItem: {
        fontSize: 14,
        color: '#555',
        marginLeft: 16,
        marginTop: 4,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        backgroundColor: '#fff',
        padding: 8,
    },
});
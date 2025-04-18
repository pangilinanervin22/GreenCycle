import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { usePostStore } from '@/lib/PostStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCallback } from 'react';
import { StarRating } from '@/components/StarRating';

export default function PostDetail() {
    const { id } = useLocalSearchParams();
    const { findPost, toggleLike, fetchPosts } = usePostStore();
    const router = useRouter();
    const currentPost = findPost(id as string);

    useFocusEffect(
        useCallback(() => {
            fetchPosts();
        }, [])
    );

    if (!currentPost) {
        return (
            <View style={styles.container}>
                <Text style={styles.notFound}>Post not found.</Text>
            </View>
        );
    }

    const handleLike = async () => {
        try {
            await toggleLike(id as string);
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    return (
        <>
            <ScrollView contentContainerStyle={styles.container}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.push('/(tabs)')}>
                    <FontAwesome name="arrow-left" size={20} color="#00512C" />
                </TouchableOpacity>
                <Image style={styles.image} contentFit="cover" source={{ uri: currentPost.image_url }} cachePolicy="memory-disk" />
                <View style={styles.allContent}>
                    <Text style={styles.title}>{currentPost.title}</Text>
                    <View style={styles.ratingContainer}>
                        <StarRating
                            rating={currentPost.rating.average || 0}
                            onRate={() => router.push(`/(tabs)/post/${currentPost.id}/ratings`)}
                        />
                        <Text style={styles.ratingText}>
                            {currentPost.rating.total > 0 ? currentPost.rating.average.toFixed(1) : 'No ratings yet'} ({currentPost.rating.total} ratings)
                        </Text>
                    </View>
                    <View style={styles.profileAndLikesContainer}>
                        <TouchableOpacity
                            style={styles.authorContainer}
                            onPress={() => router.push(`/(tabs)/profile/${currentPost.author_id}`)}
                        >
                            <FontAwesome name="user" size={16} color="#00512C" style={styles.icon} />
                            <Text style={styles.subtitleAuthor}>{currentPost.author_name}</Text>
                        </TouchableOpacity>
                        <View style={styles.likesContainer}>
                            <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
                                <FontAwesome name="heart" size={16} color="#00512C" style={styles.icon} />
                                <Text style={styles.subTitleLikes}>{currentPost.likes.count || 0}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <Text style={styles.description}>{currentPost.description}</Text>
                    <Text style={styles.subTitle}>Procedure</Text>
                    <Text style={styles.description}>{currentPost.procedure}</Text>
                    <Text style={styles.subTitle}>Ingredients:</Text>
                    {currentPost.ingredients?.map((ingredient, i) => (
                        <Text key={i} style={styles.ingredientItem}>
                            {ingredient}
                        </Text>
                    ))}
                </View>
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 5,
        paddingVertical: 15,
        paddingBottom: 100,
        backgroundColor: '#fff',
    },
    backButton: {
        position: 'absolute',
        top: 30,
        left: 15,
        zIndex: 10,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 50,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    notFound: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    allContent: {
        backgroundColor: '#e4f0e9',
        padding: 16,
        borderRadius: 30,
        marginTop: -60,
    },
    image: {
        width: '100%',
        height: 250,
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: '#ddd',
    },
    title: {
        fontWeight: 'bold',
        fontSize: 24,
        marginTop: 10,
        paddingLeft: 8,
        color: '#00512C',
        textAlign: 'left',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 8,
        marginVertical: 10,
    },
    ratingText: {
        marginLeft: 8,
        fontSize: 16,
        color: '#666',
    },
    profileAndLikesContainer: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        paddingLeft: 8,
        marginTop: 5,
        width: '100%',
    },
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        color: '#00512C',
    },
    likesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        color: '#00512C',
    },
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 8,
    },
    subtitleAuthor: {
        fontSize: 16,
        paddingLeft: 8,
        color: '#333',
    },
    subTitleLikes: {
        fontSize: 16,
        fontWeight: '600',
        paddingLeft: 8,
        color: '#333',
    },
    subTitle: {
        fontSize: 20,
        fontWeight: '600',
        paddingLeft: 8,
        marginTop: 10,
        color: '#00512C',
    },
    description: {
        fontSize: 14,
        color: '#444',
        paddingLeft: 8,
        marginTop: 15,
        width: '90%',
        marginBottom: 12,
        textAlign: 'justify',
    },
    ingredientItem: {
        fontSize: 16,
        color: '#555',
        marginLeft: 8,
        marginTop: 8,
        marginBottom: 8,
        paddingVertical: 15,
        borderRadius: 8,
        backgroundColor: '#fff',
        padding: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
        shadowOffset: { width: 0, height: 2 },
    },
});
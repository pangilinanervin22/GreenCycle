import { ScrollView, StyleSheet, Text, View, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { usePostStore } from '@/lib/PostStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/AuthStore';
import { StarRating } from '@/components/StarRating';
import { Image } from 'expo-image';

export default function RatingScreen() {
    const { id } = useLocalSearchParams();
    const { findPost, updatePostRating, deleteRating } = usePostStore();
    const { user } = useAuthStore();
    const router = useRouter();
    const currentPost = findPost(id as string);

    const [newRating, setNewRating] = useState(0);
    const [comment, setComment] = useState('');
    const [existingRating, setExistingRating] = useState<any | null>(null);

    useEffect(() => {
        if (user && currentPost) {
            const userRating = currentPost.rating.reviews.find(r => r.user_id === user.id);
            if (userRating) {
                setExistingRating(userRating);
                setNewRating(userRating.star);
                setComment(userRating.comment || '');
            }
        }
    }, [user, currentPost]);

    const handleSubmitRating = async () => {
        if (!user) {
            Alert.alert('Error', 'Please login to rate recipes');
            return;
        }

        if (newRating > 0) {
            await updatePostRating(id as string, newRating, comment);

            setExistingRating({
                ...(existingRating || {}),
                value: newRating,
                comment,
                updatedAt: new Date(),
            });

            Alert.alert('Success', existingRating ? 'Rating updated!' : 'Rating submitted!');
        }
    };

    const handleDeleteRating = async () => {
        if (!existingRating) return;

        Alert.alert(
            'Delete Rating',
            'Are you sure you want to delete your rating?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        await deleteRating(id as string);
                        setExistingRating(null);
                        setNewRating(0);
                        setComment('');
                    }
                }
            ]
        );
    };

    if (!currentPost) {
        return (
            <View style={styles.container}>
                <Text style={styles.notFound}>Post not found.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <FontAwesome name="arrow-left" size={20} color="#00512C" />
            </TouchableOpacity>

            <View style={styles.ratingContainer}>
                <Text style={styles.mainTitle}>
                    {currentPost.title}
                </Text>
                <Image
                    source={{ uri: currentPost.image_url }}
                    style={styles.image}
                    contentFit="cover"
                    cachePolicy="memory-disk" />
                <Text style={styles.title}>
                    {existingRating ? 'Update Your Rating' : 'Rate this Recipe'}
                </Text>

                <StarRating rating={newRating} onRate={setNewRating} />
                <TextInput
                    style={styles.commentInput}
                    placeholder="Add a comment (optional)"
                    value={comment}
                    onChangeText={setComment}
                    multiline
                />
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        existingRating && styles.updateButton
                    ]}
                    onPress={handleSubmitRating}
                >
                    <Text style={styles.submitButtonText}>
                        {existingRating ? 'Update Rating' : 'Submit Rating'}
                    </Text>
                </TouchableOpacity>

                {existingRating && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={handleDeleteRating}
                    >
                        <Text style={styles.deleteButtonText}>Delete Rating</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.ratingsList}>
                <Text style={styles.sectionTitle}>
                    All Ratings ({currentPost.rating.total})
                </Text>
                {currentPost.rating.reviews.map((rating) => (
                    <View
                        key={rating.user_id}
                        style={[
                            styles.ratingItem,
                            rating.user_id === user?.id && styles.userRatingItem
                        ]}
                    >
                        <View style={styles.ratingHeader}>
                            <Text style={styles.authorName}>
                                {rating.author_name} {rating.user_id === user?.id && '(You)'}
                            </Text>
                            <StarRating rating={rating.star} onRate={() => { }} />
                        </View>
                        {rating.comment && <Text style={styles.comment}>{rating.comment}</Text>}
                        <Text style={styles.date}>
                            {new Date(rating.created_at).toLocaleDateString()}
                        </Text>
                    </View>
                ))}
            </View>
        </ScrollView>
    );
}


// Add these new styles:
const styles = StyleSheet.create({
    container: {
        padding: 16,
        paddingBottom: 100,
    },
    notFound: {
        fontSize: 16,
        color: '#333',
        textAlign: 'center',
        marginTop: 20,
    },
    mainTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#00512C',
        marginBottom: 16,
        textAlign: 'left',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#00512C',
        marginBottom: 16,
        textAlign: 'center',
    },
    backButton: {
        alignSelf: 'flex-start',
        padding: 10,
        marginBottom: 16,
    },
    ratingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#e8f5e9',
        padding: 10,
        borderRadius: 20,
        marginVertical: 10,
    },
    ratingButtonText: {
        marginLeft: 8,
        color: '#00512C',
        fontWeight: '600',
    },
    ratingContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        margin: 16,
        elevation: 2,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginVertical: 16,
        minHeight: 100,
    },
    submitButton: {
        backgroundColor: '#00512C',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    submitButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    ratingsList: {
        margin: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#00512C',
        marginBottom: 16,
    },
    ratingItem: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 8,
        marginBottom: 12,
        elevation: 1,
    },
    ratingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    authorName: {
        fontWeight: 'bold',
        color: '#333',
    },
    comment: {
        color: '#666',
        marginVertical: 8,
    },
    date: {
        color: '#999',
        fontSize: 12,
    },
    updateButton: {
        backgroundColor: '#FFA500',
    },
    deleteButton: {
        backgroundColor: '#ff4444',
        padding: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },
    deleteButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    userRatingItem: {
        borderColor: '#00512C',
        borderWidth: 1,
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 8,
        marginBottom: 16,
    },
});
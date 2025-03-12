import { ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { usePostStore } from '@/lib/PostStore';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';

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
            <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
                <FontAwesome name="arrow-left" size={20} color="#00512C" />
            </TouchableOpacity>
            <Image style={styles.image} contentFit="cover" source={{ uri: currentPost.image_url }} />
            
            
            <View style ={styles.allcontent}>
            <Text style={styles.title}>{currentPost.title}</Text>
            <View style={styles.authorContainer}>
                    <FontAwesome name="user" size={16} color="#00512C" style={styles.icon} />
                    <Text style={styles.subtitle}>{currentPost.author_name}</Text>
                </View>
                <View style={styles.likesContainer}>
                    <FontAwesome name="heart" size={16} color="#00512C" style={styles.icon} />
                    <Text style={styles.subtitlelikes}>{currentPost.likes.count || 0}</Text>
                </View>
            <Text style={styles.description}>{currentPost.description}</Text>
            <Text style={styles.subtitleIngredients}>Ingredients:</Text>
            {currentPost.ingredients?.map((ingredient, i) => (
                <Text key={i} style={styles.ingredientItem}>
                    {ingredient}
                </Text>
            ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 5,
        paddingVertical: 15,
        backgroundColor: '#f5f5f5',
        paddingBottom: 100,
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
    allcontent: {
        backgroundColor: '#fff',
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
    authorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
        color: '#00512C',
        paddingLeft: 8,
    },
    likesContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 8,
        marginTop: 5,
        color: '#00512C',
    },
    icon: {
        marginRight: 8,
    },
    subtitle: {
        fontSize: 16,
        paddingLeft: 8,
        color: '#333',
    },
    subtitlelikes: {
        fontSize: 16,
        fontWeight: '600',
        paddingLeft: 8,
        color: '#333',
    },
    subtitleIngredients: {
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
        boxShadow: '0 2px 5px rgba(0, 0, 0, 0.6)',
        borderRadius: 8,
        backgroundColor: '#fff',
        padding: 8,
    },
});
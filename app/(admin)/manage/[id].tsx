import { ScrollView, StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { router } from 'expo-router';
import { useState } from 'react';
import { usePostStore } from '@/lib/PostStore';
import { PostStatus } from '@/lib/PostStore';

export default function PostDetail() {
    const { id } = useLocalSearchParams();
    const { findPost, updatePostStatus } = usePostStore();
    const currentPost = findPost(id as string);
    const [currentStatus, setCurrentStatus] = useState(currentPost?.status || '');

    if (!currentPost) {
        return (
            <View style={styles.container}>
                <Text style={styles.notFound}>Post not found.</Text>
            </View>
        );
    }

    const handleStatusChange = async (newStatus: PostStatus) => {
        try {
            await updatePostStatus(id as string, newStatus);
            setCurrentStatus(newStatus);
            Alert.alert('Success', 'Status updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update status');
            console.error('Status update failed:', error);
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'ACCEPTED': return styles.acceptedStatus;
            case 'REQUESTING': return styles.requestingStatus;
            case 'REJECTED': return styles.rejectedStatus;
            default: return styles.defaultStatus;
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <FontAwesome name="arrow-left" size={20} color="#00512C" />
            </TouchableOpacity>
            <Image style={styles.image} contentFit="cover" source={{ uri: currentPost.image_url }} />
            <View style={styles.allcontent}>
                {/* Status Section */}
                <View style={styles.statusSection}>
                    <View style={[styles.statusBadge, getStatusStyle(currentStatus)]}>
                        <Text style={styles.statusText}>
                            Current Status: {currentStatus.toLocaleUpperCase()}
                        </Text>
                    </View>


                    <View style={styles.adminControls}>
                        <Text style={styles.modalatorTitle}>Admin Controls</Text>
                        <View style={styles.statusButtonsContainer}>
                            <TouchableOpacity
                                style={[styles.statusButton, styles.acceptedButton]}
                                onPress={() => handleStatusChange('ACCEPTED')}
                            >
                                <Text style={styles.buttonText}>ACCEPT</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.statusButton, styles.requestingButton]}
                                onPress={() => handleStatusChange('REQUESTING')}
                            >
                                <Text style={styles.buttonText}>REQUESTING</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.statusButton, styles.rejectedButton]}
                                onPress={() => handleStatusChange('REJECTED')}
                            >
                                <Text style={styles.buttonText}>REJECT</Text>
                            </TouchableOpacity>
                        </View>
                    </View>


                    <View style={styles.modalatorInfo}>
                        <Text style={styles.infoTitle}>Status Information:</Text>
                        <Text style={styles.infoText}>
                            • Accepted: Visible to all users{"\n"}
                            • Requesting: Awaiting moderator approval{"\n"}
                            • Rejected: Violates community guidelines
                        </Text>
                    </View>
                </View>

                {/* Existing Content */}
                <Text style={styles.title}>{currentPost.title}</Text>
                <View style={styles.authorContainer}>
                    <FontAwesome name="user" size={16} color="#00512C" style={styles.icon} />
                    <Text style={styles.subtitle}>{currentPost.author_name}</Text>
                </View>
                <View style={styles.likesContainer}>
                    <View style={styles.likeButton}>
                        <FontAwesome name="heart" size={16} color="#00512C" style={styles.icon} />
                        <Text style={styles.subtitlelikes}>{currentPost.likes.count || 0}</Text>
                    </View>
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
    likeButton: {
        flexDirection: 'row',
        alignItems: 'center',
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
        borderRadius: 8,
        backgroundColor: '#fff',
        padding: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    statusSection: {
        marginBottom: 20,
    },
    statusBadge: {
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 16,
        alignSelf: 'flex-start',
        marginBottom: 15,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#000',
    },
    acceptedStatus: {
        backgroundColor: '#e6f4ea',
    },
    requestingStatus: {
        backgroundColor: '#fff8e1',
    },
    rejectedStatus: {
        backgroundColor: '#fce8e6',
    },
    defaultStatus: {
        backgroundColor: '#f8f9fa',
    },
    adminControls: {
        marginBottom: 20,
    },
    statusButtonsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 10,
    },
    statusButton: {
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        minWidth: 100,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 14,
    },
    acceptedButton: {
        backgroundColor: '#137333',
    },
    requestingButton: {
        backgroundColor: '#f9ab00',
    },
    rejectedButton: {
        backgroundColor: '#c5221f',
    },
    modalatorInfo: {
        backgroundColor: '#f8f9fa',
        borderRadius: 8,
        padding: 16,
        marginTop: 15,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#00512C',
        marginBottom: 10,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
    },
    modalatorTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#00512C',
        marginBottom: 8,
    },
});
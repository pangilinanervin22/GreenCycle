import { StyleSheet, ScrollView, TouchableOpacity, View, Text } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuthStore } from "@/lib/AuthStore";
import { PostStatus, usePostStore } from "@/lib/PostStore";
import { Image } from "expo-image";
import { useCallback } from "react";

export default function ProfilePage() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { posts, deletePost, fetchPosts } = usePostStore();

    const userPosts = posts.filter((post) => post.author_id === user?.id);

    useFocusEffect(
        useCallback(() => {
            fetchPosts();
        }, [])
    );

    // create delete post function
    function clickDeletePost(id: string) {
        try {
            deletePost(id);
        } catch (error) {
            alert("Failed to delete post. Please try again later.");
        }
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Welcome, {user?.name}</Text>
                <Text style={styles.info}>{user?.description}</Text>

                {/* Profile Actions */}
                <View style={styles.profileActions}>
                    <TouchableOpacity
                        style={styles.profileEditButton}
                        onPress={() => router.push(`/(tabs)/profile/edit`)}
                    >
                        <Text style={styles.profileButtonText}>Edit Profile</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.profileLogoutButton}
                        onPress={logout}
                    >
                        <Text style={[styles.profileButtonText, styles.logoutButtonText]}>Log Out</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.subTitle}>Your Posts</Text>
                {userPosts.length > 0 ? (
                    userPosts.map((post) => {
                        const statusStyle = getStatusStyle(post.status);
                        return (
                            <View key={post.id} style={styles.postCard}>
                                {post.image_url && (
                                    <Image
                                        source={{ uri: post.image_url }}
                                        style={styles.postImage}
                                        contentFit="cover"
                                        cachePolicy={'memory-disk'}
                                    />
                                )}
                                <View style={styles.titleContainer}>
                                    <Text style={styles.postTitle}>{post.title}</Text>
                                    <View style={[
                                        styles.statusBadge,
                                        { backgroundColor: statusStyle.backgroundColor }
                                    ]}>
                                        <Text style={[
                                            styles.statusText,
                                            { color: statusStyle.textColor }
                                        ]}>
                                            {post.status}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.postDescription}>
                                    {post.description}
                                </Text>
                                {/* Post Actions */}
                                <View style={styles.postActions}>
                                    <TouchableOpacity
                                        style={styles.postActionEdit}
                                        onPress={() => router.push(`/(tabs)/create/${post.id}`)}
                                    >
                                        <Text style={styles.postActionText}>Edit Post</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.postActionDelete}
                                        onPress={() => clickDeletePost(post.id)}
                                    >
                                        <Text style={[styles.postActionText, styles.postActionDeleteText]}>Delete</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })
                ) : (
                    <Text style={styles.emptyText}>
                        You have not created any posts yet.
                    </Text>
                )}
            </View>
        </ScrollView>
    );
}

const getStatusStyle = (status: PostStatus) => {
    switch (status) {
        case "ACCEPTED":
            return { backgroundColor: "#d4edda", textColor: "#155724" };
        case "REJECTED":
            return { backgroundColor: "#f8d7da", textColor: "#721c24" };
        case "REQUESTING":
        default:
            return { backgroundColor: "#fff3cd", textColor: "#856404" };
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        marginBottom: "20%",
    },
    innerContainer: {
        alignItems: "center",
        paddingVertical: 30,
        paddingHorizontal: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: "800",
        marginBottom: 8,
        color: "#00512C",
    },
    info: {
        fontSize: 16,
        textAlign: "center",
        marginBottom: 24,
        color: "#4a4a4a",
        lineHeight: 24,
        maxWidth: 300,
    },
    profileActions: {
        flexDirection: "row",
        gap: 12,
        width: "100%",
        marginBottom: 24,
    },
    profileEditButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        borderWidth: 2,
        borderColor: "#00512C",
    },
    profileLogoutButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#AF3030",
    },
    profileButtonText: {
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
    logoutButtonText: {
        color: "white",
    },
    subTitle: {
        fontSize: 22,
        fontWeight: "700",
        marginVertical: 16,
        color: "#1a1a1a",
        alignSelf: "flex-start",
        width: "100%",
    },
    postCard: {
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        width: "100%",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    postImage: {
        width: "100%",
        height: 180,
        borderRadius: 8,
        marginBottom: 12,
        backgroundColor: "#e0e0e0",
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    postTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1a1a1a",
        flexShrink: 1,
        marginRight: 8,
    },
    statusBadge: {
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 15,
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    postDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
        marginBottom: 12,
    },
    postActions: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 8,
        justifyContent: 'flex-end',
    },
    postActionEdit: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: "rgba(0, 81, 44, 0.1)",
        width: '35%',
    },
    postActionDelete: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: "rgba(175, 48, 48, 0.1)",
        width: '35%',
    },
    postActionText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#00512C",
        width: "100%",
        textAlign: "center",
    },
    postActionDeleteText: {
        color: "#AF3030",
    },
    emptyText: {
        textAlign: "center",
        fontSize: 16,
        color: "#888",
        marginTop: 20,
        width: "100%",
    },
});
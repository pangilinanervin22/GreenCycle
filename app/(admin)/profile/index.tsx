import { StyleSheet, ScrollView, TouchableOpacity, View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuthStore } from "@/lib/AuthStore";
import { usePostStore } from "@/lib/PostStore";

export default function ProfilePage() {
    const router = useRouter();
    const { user, logout } = useAuthStore();
    const { posts } = usePostStore();

    return (
        <ScrollView style={styles.container}>
            <View style={styles.innerContainer}>
                <Text style={styles.title}>Welcome, {user?.name}</Text>
                <Text style={styles.info}>{user?.description}</Text>

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.editButton]}
                        onPress={() => router.push(`/(admin)/profile/${user?.id}`)}
                    >
                        <Text style={styles.buttonText}>{'Edit Profile'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.button, styles.logoutButton]}
                        onPress={logout}
                    >
                        <Text style={styles.buttonText}>{'Logout'}</Text>
                    </TouchableOpacity>
                </View>

            </View>
        </ScrollView>
    );
}

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
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 24,
        gap: 16, // Adds space between buttons
    },
    button: {
        flex: 1, // Ensures both buttons take equal width
        paddingVertical: 12,
        borderRadius: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        alignItems: "center",
        justifyContent: "center",
    },
    editButton: {
        backgroundColor: "#00512C",
    },
    logoutButton: {
        backgroundColor: "#AF3030",
    },
    buttonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "600",
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
    postTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#1a1a1a",
        marginBottom: 4,
    },
    postDescription: {
        fontSize: 14,
        color: "#666",
        lineHeight: 20,
    },
    emptyText: {
        textAlign: "center",
        fontSize: 16,
        color: "#888",
        marginTop: 20,
        width: "100%",
    },
});
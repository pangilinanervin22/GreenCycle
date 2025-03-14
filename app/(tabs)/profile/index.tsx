import { StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Text, View } from "@/components/Themed";
import { useRouter } from "expo-router";
import { Button, Image } from "react-native";
import { useAuthStore } from "@/lib/AuthStore";
import { usePostStore } from "@/lib/PostStore";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { posts } = usePostStore();

  const userPosts = posts.filter((post) => post.author_id === user?.id);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>Welcome, {user?.name}</Text>
        <Text style={styles.info}>{user?.description}</Text>

        <View style={styles.editButton}>
          <Button
            title="Edit Profile"
            onPress={() => router.push(`/(tabs)/profile/[${user?.id}]`)}
            color={"#fff"}
          />
        </View>

        <Text style={styles.subTitle}>Your Posts</Text>
        {userPosts.length > 0 ? (
          userPosts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.postCard}
              onPress={() => router.push(`/(tabs)/${post.id}`)} // Navigate to post details
            >
              {post.image_url && (
                <Image
                  source={{ uri: post.image_url }}
                  style={styles.postImage}
                />
              )}
              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postDescription}>{post.description}</Text>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyText}>
            You have not created any posts yet.
          </Text>
        )}

        {/* Logout button at the bottom */}
        <View style={styles.logoutContainer}>
          <Button title="Logout" onPress={logout} color="#fff" />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffff",
  },
  innerContainer: {
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 20,
    marginBottom: 100,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 10,
    color: "#00512C",
  },
  info: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  editButton: {
    marginBottom: 10,
    borderWidth: 1,
    backgroundColor: "#00512C",
    borderColor: "00512C",
    padding: 2,
    borderRadius: 20,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 20,
    color: "#000",
  },
  postCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    width: "100%",
  },
  postImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  postDescription: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
  },
  logoutContainer: {
    marginTop: 30,
    backgroundColor: "#AF3030",
    width: "40%",
    borderWidth: 1,
    borderColor: "#AF3030",
    borderRadius: 20,
    alignItems: "center",
  },
});

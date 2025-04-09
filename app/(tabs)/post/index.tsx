import {
  FlatList,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { usePostStore } from "@/lib/PostStore";
import { Image } from "expo-image";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { useAuthStore } from "@/lib/AuthStore";
import { FontAwesome } from "@expo/vector-icons";

export default function PostLikesLayout() {
  const { user } = useAuthStore();
  const { fetchPosts, posts } = usePostStore();

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  const likedPosts = posts.filter(
    (post) =>
      post.status === "PUBLISHED" && post.likes.users.some((cur: any) => cur === user?.id)
  );

  return (
    <FlatList
      data={likedPosts}
      keyExtractor={(_, i) => i.toString()}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Liked Posts</Text>
          <FontAwesome name="heart" size={24} color="#00512C" />
        </View>
      }
      ListEmptyComponent={
        <Text style={styles.emptyText}>No liked posts found.</Text>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push(`/(tabs)/post/${item.id}`)}
          style={styles.postContainer}
        >
          <Image
            source={{ uri: item.image_url }}
            style={styles.postImage}
            contentFit="cover"
          />
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={[styles.title, styles.postTitle]}>{item.title}</Text>
            <View style={styles.postRating}>
              <FontAwesome name="star" size={12} style={styles.starIcon} />
              <Text style={styles.ratingText}>{item.rating.average}</Text>
            </View>
          </View>
          <Text style={styles.body}>{item.description}</Text>
        </Pressable>
      )}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollContainer}
    />
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30,
    marginBottom: 20,
    gap: 10,
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#00512C",
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    marginTop: 20,
  },
  title: {
    color: "#00512C",
    fontSize: 18,
    fontWeight: "bold",
  },
  postContainer: {
    marginVertical: 10,
    marginHorizontal: "auto",
    alignSelf: "center",
    marginBottom: 10,
    padding: 16,
    borderRadius: 8,
    backgroundColor: "#f8f8f8",
    shadowColor: "#000",
    width: "85%",
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  postImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  postTitle: {
    marginBottom: 4,
    fontWeight: "bold",
    fontSize: 20,
  },
  body: {
    color: "#333",
    fontSize: 16,
  },
  postRating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  starIcon: {
    marginRight: 4,
    color: "#FFD700",
    fontSize: 20,
  },
  ratingText: {
    fontSize: 18,
    color: "#555",
  },
});
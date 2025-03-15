import { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ActivityIndicator,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { usePostStore } from "@/lib/PostStore";
import { Image } from "expo-image";
import { useFocusEffect } from "@react-navigation/native";
import { FontAwesome } from "@expo/vector-icons";

export default function TabOneScreen() {
  const { fetchPosts, posts, loading } = usePostStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  const filteredPosts = posts.filter((post) =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Recycle Ways</Text>
        <Image
          source={require("@/assets/images/logo.svg")}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      <View
        style={[
          styles.searchContainer,
          isFocused && styles.searchContainerFocused,
        ]}
      >
        <FontAwesome
          name="search"
          size={20}
          color="#00512C"
          style={styles.searchIcon}
        />
        <TextInput
          placeholder="Search posts..."
          placeholderTextColor="#00512C"
          style={styles.searchInput}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {loading && filteredPosts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="green" />
            <Text>Loading posts...</Text>
          </View>
        ) : filteredPosts.length === 0 ? (
          <View style={styles.noPostsContainer}>
            <Text>No posts found.</Text>
          </View>
        ) : (
          <View style={styles.postsWrapper}>
            {filteredPosts.map((post, index) => (
              <Pressable
                key={index}
                onPress={() => router.push(`/(tabs)/${post.id}`)}
                style={styles.postContainer}
              >
                <Image
                  source={{ uri: post.image_url }}
                  style={styles.postImage}
                  contentFit="cover"
                />
                <Text style={styles.postTitle}>{post.title}</Text>
                <View style={styles.likesContainer}>
                  <FontAwesome
                    name="heart"
                    size={16}
                    color="#00512C"
                    style={styles.likeIcon}
                  />
                  <Text style={styles.likesText}>{post.likes.count}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 50,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
    justifyContent: "space-between",
    width: "90%",
  },
  logo: {
    width: 60,
    height: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#00512C",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#00512C",
  },
  searchContainerFocused: {
    borderColor: "#1CA365",
    backgroundColor: "#DFF8E3",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: "#00512C",
  },
  scrollContainer: {
    width: "100%",
  },
  postsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: "5%",
  },
  postContainer: {
    width: "48%",
    marginBottom: 10,
    marginHorizontal: "1%",
    alignItems: "center",
    padding: 5,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postImage: {
    width: "100%",
    aspectRatio: 16 / 15,
    borderRadius: 8,
    marginBottom: 8,
  },
  postTitle: {
    marginBottom: 4,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  likeIcon: {
    marginRight: 6,
  },
  likesText: {
    color: "#333",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 50,
  },
  noPostsContainer: {
    flex: 1,
    alignItems: "center",
    marginTop: 50,
  },
});

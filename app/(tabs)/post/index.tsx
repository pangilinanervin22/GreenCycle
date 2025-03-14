import { FlatList, StyleSheet, Text, View, Pressable } from 'react-native';
import { router } from 'expo-router';
import { usePostStore } from '@/lib/PostStore';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useAuthStore } from '@/lib/AuthStore';
import { FontAwesome } from '@expo/vector-icons';

export default function PostLikesLayout() {
  const { user } = useAuthStore();
  const { fetchPosts, posts } = usePostStore();

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  const likedPosts = posts.filter(
    (post) => post.status === 'ACCEPTED' && post.likes.users.includes(user?.id ?? '')
  );

  return (
    <FlatList
      style={styles.container}
      data={likedPosts}
      keyExtractor={(_, i) => i.toString()}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Your Liked Posts</Text>
          <FontAwesome name="heart" size={24} color="red" />
        </View>
      }
      ListEmptyComponent={<Text>No liked posts found.</Text>}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push(`/(tabs)/${item.id}`)}
          style={styles.postContainer}
        >
          <Image
            source={{ uri: item.image_url }}
            style={styles.postImage}
            contentFit="cover"
          />
          <Text style={[styles.title, styles.postTitle]}>{item.title}</Text>
          <Text style={styles.body}>{item.description}</Text>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 10,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  title: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  postContainer: {
    marginVertical: 10,
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f8f8',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  postTitle: {
    marginBottom: 4,
  },
  body: {
    color: '#333',
    fontSize: 16,
  },
});

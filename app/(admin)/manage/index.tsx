import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { useAuthStore } from '@/lib/AuthStore';
import { router } from 'expo-router';
import { usePostStore } from '@/lib/PostStore';
import { useEffect } from 'react';
import { Image } from 'expo-image';

export default function PostLayout() {
  const { logout } = useAuthStore();
  const { fetchPosts, posts, loading } = usePostStore();

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Fetching posts...</Text>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Discover Recycle Ways</Text>
            <Image
              source={require('@/assets/images/logo.svg')}
              style={styles.logo}
              contentFit="contain"
            />
          </View>
          {posts?.map((post, i) => (
            <Pressable
              key={i}
              onPress={() => router.push(`/(tabs)/${post.id}`)}
              style={styles.postContainer}
            >
              <Image
                source={{ uri: post.image_url }}
                style={styles.postImage}
                contentFit="cover"
              />
              <Text style={[styles.title, styles.postTitle]}>{post.title}</Text>
              <Text style={styles.body}>{post.description}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  logo: {
    width: 60,
    height: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#333',
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

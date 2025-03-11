import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';
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

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Recycle Ways</Text>
        <Image
          source={require('@/assets/images/logo.svg')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      {loading && <Text>Loading...</Text>}
      {!loading &&
        posts?.map((post, i) => (
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
    marginBottom: 20,
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

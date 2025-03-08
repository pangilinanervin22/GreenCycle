import { Button, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '@/lib/AuthStore';
import { router } from 'expo-router';
import { usePostStore } from '@/lib/PostStore';
import { useEffect } from 'react';
import { Image } from 'expo-image';

export default function TabOneScreen() {
  const { logout } = useAuthStore();
  const { fetchPosts, posts, loading, error } = usePostStore();

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover Recycle Ways</Text>
        <Image
          source={require('@/assets/images/logo.svg')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      {loading && <Text>Loading...</Text>}
      {error && <Text>Error: {error}</Text>}
      {!loading &&
        !error &&
        posts?.map((post, i) => (
          <View key={i} style={styles.postContainer}>
            <Image
              source={{ uri: post.image_url }}
              style={styles.postImage}
              contentFit="cover"
            />
            <Text style={[styles.title, styles.postTitle]}>{post.title}</Text>
            <Text style={styles.body}>{post.description}</Text>
          </View>
        ))}

      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    position: 'absolute',
    top: '5%',
    paddingHorizontal: 20,
    gap: 8,
  },
  logo: {
    width: 70,
    height: 70,
  },
  headerTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#000',
  },
  title: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold',
  },


  postContainer: {
    width: '100%',
    marginVertical: 10,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  postTitle: {
    marginBottom: 4,
  },
  body: {
    color: '#000',
    fontSize: 16,
    marginBottom: 4,
  },
});

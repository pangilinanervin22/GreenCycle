import { useState, useCallback } from 'react';
import { ScrollView, StyleSheet, Text, View, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { usePostStore } from '@/lib/PostStore';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

export default function TabOneScreen() {
  const { fetchPosts, posts, loading } = usePostStore();
  const [searchTerm, setSearchTerm] = useState('');
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
          source={require('@/assets/images/logo.svg')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>

      <View style={[styles.searchContainer, isFocused && styles.searchContainerFocused]}>
        <FontAwesome name="search" size={20} color="green" style={styles.searchIcon} />
        <TextInput
          placeholder="Search posts..."
          placeholderTextColor="green"
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
          filteredPosts.map((post, index) => (
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
              <Text style={[styles.title, styles.postTitle]}>
                {post.title}
              </Text>
              <View style={styles.likesContainer}>
                <FontAwesome
                  name="heart"
                  size={16}
                  color="red"
                  style={styles.likeIcon}
                />
                <Text style={styles.likesText}>
                  {post.likes.count}
                </Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: '100%',
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    justifyContent: 'space-between',
    width: '90%',
  },
  logo: {
    width: 60,
    height: 60,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: 'green',
  },
  searchContainerFocused: {
    // Change this to your desired highlight color or style on focus.
    borderColor: 'blue',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: 'green',
  },
  scrollContainer: {
    width: '100%',
    marginBottom: '20%',
  },
  title: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  postContainer: {
    marginVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingHorizontal: '10%',
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
  likesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  likeIcon: {
    marginRight: 6,
  },
  likesText: {
    color: '#333',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 50,
  },
  noPostsContainer: {
    flex: 1,
    alignItems: 'center',
    marginTop: 50,
  },
});

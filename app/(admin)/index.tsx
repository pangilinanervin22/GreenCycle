import { useState, useCallback } from 'react';
import { FlatList, StyleSheet, Text, View, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { usePostStore } from '@/lib/PostStore';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';

export default function AdminMainLayout() {
  const { fetchPosts, posts, loading } = usePostStore();
  const [searchTerm, setSearchTerm] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  const acceptedPosts = posts.filter(
    (post) =>
      post.status === 'ACCEPTED' &&
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const rejectedPosts = posts.filter(
    (post) =>
      post.status === 'REJECTED' &&
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingPosts = posts.filter(
    (post) =>
      post.status === 'REQUESTING' &&
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Welcome Admin</Text>
        <Image
          source={require('@/assets/images/logo.svg')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
      <Text>
        Information Dashboard
      </Text>
      <View style={styles.flashCardsContainer}>
        <View style={[styles.flashCard, styles.acceptedFlashCard]}>
          <Text style={styles.flashCardTitle}>Publish Post</Text>
          <Text style={styles.flashCardCount}>{acceptedPosts.length}</Text>
        </View>
        <View style={[styles.flashCard, styles.rejectedFlashCard]}>
          <Text style={styles.flashCardTitle}>Reject Post</Text>
          <Text style={styles.flashCardCount}>{rejectedPosts.length}</Text>
        </View>
        <View style={[styles.flashCard, styles.pendingFlashCard]}>
          <Text style={styles.flashCardTitle}>Pending Post</Text>
          <Text style={styles.flashCardCount}>{pendingPosts.length}</Text>
        </View>
      </View>
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
  flashCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '90%',
    marginTop: 20,
  },
  flashCard: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '30%',
  },
  acceptedFlashCard: {
    backgroundColor: '#d4edda',
  },
  rejectedFlashCard: {
    backgroundColor: '#f8d7da',
  },
  pendingFlashCard: {
    backgroundColor: '#fff3cd',
  },
  flashCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  flashCardCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 10,
  },
});

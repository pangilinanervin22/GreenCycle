import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { usePostStore } from '@/lib/PostStore';
import { useCallback, useEffect, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';

// Status styling helper
const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case 'published':
      return { backgroundColor: '#e6f4ea', color: '#137333' };
    case 'draft':
      return { backgroundColor: '#fff8e1', color: '#f9ab00' };
    case 'pending':
      return { backgroundColor: '#e8f0fe', color: '#1967d2' };
    default:
      return { backgroundColor: '#f8f9fa', color: '#6c757d' };
  }
};

export default function ManageLayout() {
  const { fetchPosts, posts, loading } = usePostStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter posts based on search query
  const filteredPosts = posts?.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      {(loading && posts.length === 0) ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000" />
          <Text style={styles.loadingText}>Fetching posts...</Text>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Manage Posts</Text>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search posts name..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <TouchableOpacity style={styles.searchButton}>
                <FontAwesome name="search" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.headerText, { flex: 2 }]}>Title</Text>
            <Text style={styles.headerText}>Author</Text>
            <Text style={styles.headerText}>Status</Text>
            <Text style={styles.headerText}>Action</Text>
          </View>

          {/* Table Rows */}
          {filteredPosts?.map((post, i) => {
            const statusStyle = getStatusStyle(post.status);
            return (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.cell, { flex: 2 }]} numberOfLines={1}>{post.title}</Text>
                <Text style={styles.cell} numberOfLines={1}>{post.author_name}</Text>
                <View style={styles.cell}>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                    <Text style={[styles.statusText, { color: statusStyle.color }]}>
                      {post.status}
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={styles.actionButton}
                  onPress={() => router.push(`/(admin)/manage/${post.id}`)}
                >
                  <Text style={styles.actionText}>View</Text>
                </Pressable>
              </View>
            )
          }
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
  },
  header: {
    paddingVertical: 20,
    gap: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
    gap: 8,
  },
  headerText: {
    flex: 1,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    fontSize: 14,
  },
  cell: {
    flex: 1,
    color: '#333',
    textAlign: 'center',
    fontSize: 14,
    justifyContent: 'center',
  },
  statusBadge: {
    borderRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignSelf: 'center',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  actionButton: {
    backgroundColor: '#007bff',
    paddingVertical: 6,
    borderRadius: 6,
    flex: 1,
    maxWidth: 80,
  },
  actionText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
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
});
import { ScrollView, StyleSheet, Text, View, Pressable, ActivityIndicator, TextInput, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { usePostStore } from '@/lib/PostStore';
import { useCallback, useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';

// Status configuration
const statusConfig = {
  PUBLISHED: {
    label: 'PUBLISHED',
    backgroundColor: '#e8f5e9',
    textColor: '#2e7d32'
  },
  REQUESTING: {
    label: 'REQUESTING',
    backgroundColor: '#fff3e0',
    textColor: '#ef6c00'
  },
  REJECTED: {
    label: 'REJECTED',
    backgroundColor: '#ffebee',
    textColor: '#c62828'
  }
};

const getStatusStyle = (status: string) => {
  const upperStatus = status.toUpperCase();
  return statusConfig[upperStatus as keyof typeof statusConfig] || {
    label: status,
    backgroundColor: '#f8f9fa',
    textColor: '#6c757d'
  };
};

export default function ManageLayout() {
  const { fetchPosts, posts, loading } = usePostStore();
  const [searchQuery, setSearchQuery] = useState('');

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
          <ActivityIndicator size="large" color="#2e7d32" />
          <Text style={styles.loadingText}>Fetching posts...</Text>
        </View>
      ) : (
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Manage Posts</Text>
            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search posts..."
                placeholderTextColor="#666"
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
            <Text style={[styles.headerText, { flex: 1 }]}>Title</Text>
            <Text style={[styles.headerText, { flex: 0.8 }]}>Author</Text>
            <Text style={styles.headerText}>Status</Text>
            <Text style={[styles.headerText, { flex: 0.5 }]}>Action</Text>
          </View>

          {/* Table Rows */}
          {filteredPosts?.map((post, i) => {
            const statusStyle = getStatusStyle(post.status);
            return (
              <View key={i} style={styles.tableRow}>
                <Text style={[styles.cell, { flex: 1 }]} numberOfLines={1}>{post.title}</Text>
                <Text style={[styles.cell, { flex: 0.8 }]} numberOfLines={1}>{post.author_name}</Text>
                <View style={styles.cell}>
                  <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
                    <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
                      {statusStyle.label}
                    </Text>
                  </View>
                </View>
                <Pressable
                  style={[styles.actionButton, { flex: 0.5 }]}
                  onPress={() => router.push(`/(admin)/manage/${post.id}`)}
                >
                  <FontAwesome name="eye" size={16} color="white" />
                </Pressable>
              </View>
            )
          })}
        </ScrollView>
      )
      }
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 16,
    marginBottom: '20%',
    paddingBottom: '30%',
  },
  header: {
    paddingVertical: 20,
    gap: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1b5e20',
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
    borderColor: '#81c784',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#2e7d32',
  },
  searchButton: {
    backgroundColor: '#388e3c',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#e8f5e9',
    paddingVertical: 12,
    paddingHorizontal: 8,
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
    color: '#1b5e20',
    textAlign: 'center',
    fontSize: 16,
  },
  cell: {
    flex: 1,
    color: '#333',
    textAlign: 'center',
    fontSize: 14,
    justifyContent: 'center',
    wordWrap: 'break-word',
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
  },
  actionButton: {
    backgroundColor: '#43a047',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#2e7d32',
  },
});
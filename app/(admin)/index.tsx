import { useState, useCallback } from 'react';
import { StyleSheet, Text, View, Pressable, TextInput, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Post, PostStatus, usePostStore } from '@/lib/PostStore';
import { Image } from 'expo-image';
import { useFocusEffect } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import DefaultLoading from '@/components/DefaultLoading';

export default function AdminMainLayout() {
  const { fetchPosts, posts, loading } = usePostStore();
  const [searchTerm, setSearchTerm] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
    }, [])
  );

  const filteredPosts = (status: PostStatus) => posts.filter(
    (post) =>
      post.status === status &&
      post.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusCounts = {
    PUBLISHED: filteredPosts('PUBLISHED').length,
    REJECTED: filteredPosts('REJECTED').length,
    REQUESTING: filteredPosts('REQUESTING').length,
  };

  if (loading || posts.length === 0) {
    return (
      <DefaultLoading loading />
    );
  }

  return (
    <ScrollView
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greetingText}>{'Hello Admin'}</Text>
          <Text style={styles.subHeader}>{'Dashboard Overview'}</Text>
        </View>
        <Image
          source={require('@/assets/images/logo.svg')}
          style={styles.logo}
          contentFit="contain"
          cachePolicy="memory-disk"
        />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search posts..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          placeholderTextColor="#999"
        />
        <FontAwesome name="search" size={20} color="#666" style={styles.searchIcon} />
      </View>

      {/* Statistics Cards */}
      <View style={styles.cardsContainer}>
        {Object.entries(statusCounts).map(([status, count]) => (
          <Pressable
            key={status}
            style={[styles.card, { backgroundColor: statusColors[status as keyof typeof statusColors] }]}
          >
            <FontAwesome
              name={statusIcons[status as keyof typeof statusIcons] as any}
              size={24}
              color="rgba(0,0,0,0.2)"
              style={styles.cardIcon}
            />
            <Text style={styles.cardCount}>{count || 0}</Text>
            <Text style={styles.cardTitle}>{statusLabels[status as keyof typeof statusLabels] || 'Unknown Status'}</Text>
          </Pressable>
        ))}
      </View>

      {/* Statistics Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.sectionTitle}>{'Post Distribution'}</Text>
        {Object.entries(statusCounts).map(([status, count]) => (
          <View key={status} style={styles.chartRow}>
            <Text style={styles.chartLabel}>{statusLabels[status as keyof typeof statusLabels] || 'Unknown Status'}</Text>
            <View style={styles.barContainer}>
              <View
                style={[
                  styles.chartBar,
                  {
                    width: `${(count / posts.length) * 100}%`,
                    backgroundColor: statusColors[status as keyof typeof statusColors]
                  }
                ]}
              />
              <Text style={styles.barText}>{count || 0}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Recent Activities */}
      <View style={styles.activityContainer}>
        <Text style={styles.sectionTitle}>{'Pending Requests'}</Text>
        {filteredPosts('REQUESTING').length === 0 ? (
          <Text style={styles.emptyText}>{'No pending requests'}</Text>
        ) : (
          filteredPosts('REQUESTING').map((item) => (
            <Pressable
              key={item.id}
              style={styles.activityItem}
              onPress={() => router.push(`/(admin)/manage/${item.id}`)}
            >
              <View style={[styles.statusIndicator, { backgroundColor: statusColors[item.status] }]} />
              <Text style={styles.activityTitle}>{item.title || 'No Title'}</Text>
              <FontAwesome name="chevron-right" size={14} color="#666" />
            </Pressable>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const statusColors = {
  PUBLISHED: '#d4edda',
  REJECTED: '#f8d7da',
  REQUESTING: '#fff3cd'
};

const statusIcons = {
  PUBLISHED: 'check-circle',
  REJECTED: 'times-circle',
  REQUESTING: 'clock-o'
};

const statusLabels = {
  PUBLISHED: 'Published',
  REJECTED: 'Rejected',
  REQUESTING: 'Pending'
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    marginBottom: '20%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginHorizontal: '5%',
    gap: 20,
  },
  greetingText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#00512C',
  },
  subHeader: {
    fontSize: 16,
    color: '#00512C',
    marginTop: 4,
  },
  logo: {
    width: 90,
    height: 80,
  },
  searchContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 10,
    fontSize: 16,
    paddingLeft: 45,
    elevation: 2,
  },
  searchIcon: {
    position: 'absolute',
    left: 15,
    top: 15,
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  card: {
    flex: 1,
    marginHorizontal: 5,
    padding: 18,
    borderRadius: 12,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
  },
  cardIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
    opacity: 0.9,
  },
  cardCount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00512C',
    marginBottom: 16,
  },
  chartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  chartLabel: {
    width: 80,
    fontSize: 14,
    color: '#666',
  },
  barContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chartBar: {
    height: 20,
    borderRadius: 10,
    marginRight: 8,
  },
  barText: {
    fontSize: 14,
    color: '#666',
  },
  activityContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    marginTop: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statusIndicator: {
    width: 12, // Increased size
    height: 12,
    borderRadius: 6, // Fully rounded corners
    marginRight: 12,
  },
  activityTitle: {
    flex: 1,
    fontSize: 16, // Slightly larger font
    color: '#333',
    marginRight: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 10,
  },
});
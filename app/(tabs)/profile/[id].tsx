import { StyleSheet, ScrollView, View, Text, Pressable } from "react-native";
import { Redirect, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useAuthStore, User } from "@/lib/AuthStore";
import { PostStatus, usePostStore } from "@/lib/PostStore";
import { Image } from "expo-image";
import { useCallback, useState } from "react";
import { supabase } from "@/lib/supabase";
import DefaultLoading from "@/components/DefaultLoading";
import { FontAwesome } from "@expo/vector-icons";

// Get user from supabase
async function fetchUserProfile(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;

  return {
    email: data.email || '',
    name: data.name || '',
    description: data.description || '',
    role: data.role || 'user',
    id: data.id || ''
  };
}

export default function ProfilePage() {
  const { posts, fetchPosts } = usePostStore();
  const { id } = useLocalSearchParams();
  const [currentUser, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuthStore();

  const userPosts = posts.filter((post) => post.author_id === id && post.status === "PUBLISHED");

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      const loadProfile = async () => {
        try {
          if (!id) throw new Error("No user ID provided");

          const userId = Array.isArray(id) ? id[0] : id;
          const profile = await fetchUserProfile(userId);
          await fetchPosts();

          if (isMounted) {
            setUserProfile(profile);
            setError(null);
          }
        } catch (err) {
          if (isMounted) {
            setError(err instanceof Error ? err.message : "Failed to load profile");
          }
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      loadProfile();
      return () => { isMounted = false; };
    }, [id])
  );

  if (id === user?.id) return <Redirect href="/(tabs)/profile" />;
  if (loading) {
    return (
      <DefaultLoading loading />
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.innerContainer}>
        <Text style={styles.title}>{currentUser?.name}</Text>
        <Text style={styles.info}>{currentUser?.description}</Text>

        <Text style={styles.subTitle}>Recycle Ways Ideas</Text>
        {userPosts.length > 0 ? (
          userPosts.map((post) => {
            const statusStyle = getStatusStyle(post.status);
            return (
              <Pressable key={post.id} style={styles.postCard} onPress={() => router.push(`/(tabs)/post/${post.id}`)}>
                {post.image_url && (
                  <Image
                    source={{ uri: post.image_url }}
                    style={styles.postImage}
                    contentFit="cover"
                    cachePolicy={'memory-disk'}
                  />
                )}
                <View style={styles.titleContainer}>
                  <Text style={styles.postTitle}>{post.title}</Text>
                  <View style={styles.postIcons}>
                    <View style={styles.postRating}>
                      <FontAwesome name="star" size={12} style={styles.starIcon} />
                      <Text>
                        {post.rating.average}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: statusStyle.backgroundColor }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: statusStyle.textColor }
                      ]}>
                        {'✔️'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text style={styles.postDescription}>
                  {post.description}
                </Text>
              </Pressable>
            );
          })
        ) : (
          <Text style={styles.emptyText}>
            You have not created any posts yet.
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const getStatusStyle = (status: PostStatus) => {
  switch (status) {
    case "PUBLISHED":
      return { backgroundColor: "#d4edda", textColor: "#155724" };
    case "REJECTED":
      return { backgroundColor: "#f8d7da", textColor: "#721c24" };
    case "REQUESTING":
    default:
      return { backgroundColor: "#fff3cd", textColor: "#856404" };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: "20%",
  },
  innerContainer: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 15,
    zIndex: 10,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,

  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    color: "#00512C",
  },
  info: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    color: "#4a4a4a",
    lineHeight: 24,
  },
  subTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginVertical: 16,
    color: "#00512C",
    alignSelf: "flex-start",
    width: "100%",
  },
  postCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  postImage: {
    width: "100%",
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: "#e0e0e0",
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    flexShrink: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 15,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  postDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 12,
  },
  postIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginRight: 8,
    gap: 8,
  },
  postRating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  starIcon: {
    marginRight: 4,
    color: "#FFD700",
    fontSize: 16,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 16,
    color: "#888",
    marginTop: 20,
    width: "100%",
  },
  errorText: {
    color: '#AF3030',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});
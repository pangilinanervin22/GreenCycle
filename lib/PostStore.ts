import { create } from 'zustand';
import { persist, StorageValue } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { useAuthStore } from './AuthStore';
import { Platform } from 'react-native';

export type PostStatus = "REQUESTING" | "ACCEPTED" | "REJECTED";
export interface Post {
    id: string;
    title: string;
    author_id: string;
    author_name: string;
    description: string;
    likes: {
        count: number;
        users: string[];
    };
    image_url: string;
    ingredients: string[];
    created_at: string;
    status: PostStatus;
    synced: boolean;
}

export interface PostAddOrEdit {
    title: string;
    description: string;
    image_url?: string;
    ingredients: string[];
}

interface PostState {
    posts: Post[];
    loading: boolean;
    fetchPosts: () => Promise<void>;
    createPost: (content: PostAddOrEdit) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;
    findPost: (postId: string) => Post | undefined;
    updatePost: (postId: string, content: PostAddOrEdit) => Promise<void>;
    toggleLike: (postId: string) => Promise<void>;
    updatePostStatus: (postId: string, status: PostStatus) => Promise<void>;
}

const isWeb = Platform.OS === 'web';


export const usePostStore = create<PostState>()(
    persist(
        (set, get) => ({
            posts: [],
            loading: false,
            fetchPosts: async () => {
                set({ loading: true });
                const originalState = JSON.parse(JSON.stringify(get().posts));

                try {
                    const { data, error } = await supabase
                        .from('recycle_post')
                        .select(`
                      *,
                       likes(user_id),
                     users(name)
                    `).order('created_at', { ascending: false });

                    if (error) throw error;

                    // Process the nested data
                    const processedData: Post[] = data?.map(post => ({
                        ...post,
                        synced: true,
                        author_name: post.users?.name || 'Unknown Author', // Optional chaining in case users is null
                        likes: {
                            count: post.likes?.length || 0,
                            users: post.likes?.map((like: any) => like.user_id) || []
                        }
                    })) || [];
                    if (error) throw error;
                    set({ posts: processedData || [] });
                } catch (error) {
                    set({ posts: originalState });

                    throw error;
                } finally {
                    set({ loading: false });
                }
            },
            createPost: async (content: PostAddOrEdit) => {
                const { user } = useAuthStore.getState(); // Access auth store
                if (!user) throw new Error('User not authenticated');

                set({ loading: true });
                try {
                    const createdPost = {
                        author_id: user.id,
                        ingredients: [...content.ingredients],
                        description: content.description,
                        title: content.title,
                        image_url: content.image_url,
                        status: "REQUESTING"
                    };

                    const { data, error } = await supabase
                        .from('recycle_post')
                        .insert(createdPost)
                        .select();

                    if (error) throw error;
                    set({
                        posts: [{
                            ...data[0],
                            author_name: user.name,
                            likes: {
                                count: 0,
                                users: []
                            }
                        }, ...get().posts]
                    });
                } finally {
                    set({ loading: false });
                }
            },
            deletePost: async (postId: string) => {
                set({ loading: true });
                try {
                    // Delete the post from the main table
                    const { error } = await supabase
                        .from('recycle_post')
                        .delete()
                        .eq('id', postId);

                    if (error) throw error;

                    // Also remove all likes for that post from the likes table
                    const { error: likesError } = await supabase
                        .from('likes')
                        .delete()
                        .eq('post_id', postId);
                    if (likesError) throw likesError;

                    set({ posts: get().posts.filter((post) => post.id !== postId) });
                } finally {
                    set({ loading: false });
                }
            },
            findPost: (postId: string) => {
                return get().posts.find(post => post.id === postId);
            },
            updatePost: async (postId: string, content: PostAddOrEdit) => {
                set({ loading: true });
                try {

                    const updatePost = {
                        ...JSON.parse(JSON.stringify(content)),
                        status: "REQUESTING"
                    }

                    const { error } = await supabase
                        .from('recycle_post')
                        .update(updatePost)
                        .eq('id', postId)
                        .select();

                    if (error) throw error;

                    set({
                        posts: get().posts.map(post =>
                            post.id === postId ? { ...JSON.parse(JSON.stringify(content)) } : post
                        ),
                    });
                } finally {
                    set({ loading: false });
                }
            },
            toggleLike: async (postId: string) => {
                const { user } = useAuthStore.getState();
                if (!user) throw new Error('User not authenticated');

                const currentPost = get().posts.find((p) => p.id === postId);
                if (!currentPost) return;

                const userId = user.id!;
                const hasLiked = currentPost.likes?.users?.includes(userId) ?? false;
                const originalPosts = get().posts;
                const newCount = currentPost.likes.count + (hasLiked ? -1 : 1);
                const newUsers = hasLiked ? currentPost.likes.users.filter((id) => id !== userId) : [...currentPost.likes.users, userId];

                // Optimistic update
                set((state) => ({
                    posts: state.posts.map((postItem) =>
                        postItem.id === postId ? {
                            ...postItem,
                            likes: {
                                count: newCount,
                                users: newUsers,
                            },
                        } : postItem
                    ),
                }));

                try {
                    if (hasLiked) {
                        const { error } = await supabase
                            .from('likes')
                            .delete()
                            .match({ user_id: userId, post_id: postId });
                        if (error) throw error;
                    } else {
                        const { error } = await supabase
                            .from('likes')
                            .insert({ user_id: userId, post_id: postId });
                        if (error) throw error;
                    }
                } catch (error) {
                    set({ posts: originalPosts });
                    throw error;
                }
            },
            updatePostStatus: async (postId: string, status: PostStatus) => {
                const originalPosts: Post[] = JSON.parse(JSON.stringify(get().posts));
                // Optimistic update
                set({
                    posts: get().posts.map(post =>
                        post.id === postId ? { ...post, status } : post
                    ),
                });

                set({ loading: true });
                try {
                    const { data, error } = await supabase
                        .from('recycle_post')
                        .update({ status })
                        .eq('id', postId)
                        .select();

                    if (error) throw error;

                    set({
                        posts: get().posts.map(post =>
                            post.id === postId ? { ...post, status: data[0].status } : post
                        ),
                    });
                } catch (error) {
                    // Revert to original state in case of error
                    set({ posts: originalPosts });
                    throw error;
                } finally {
                    set({ loading: false });
                }
            }
        }),

        {
            name: 'post-storage',
            storage: {
                getItem: async (name: string) => {
                    if (isWeb) {
                        // Check if localStorage is available
                        if (typeof window !== 'undefined' && window.localStorage) {
                            const value = localStorage.getItem(name);
                            return value ? JSON.parse(value) : null;
                        }
                        return null;
                    } else {
                        const value = await AsyncStorage.getItem(name);
                        return value ? JSON.parse(value) : null;
                    }
                },
                setItem: async (name: string, value: StorageValue<PostState>) => {
                    if (isWeb) {
                        // Check if localStorage is available
                        if (typeof window !== 'undefined' && window.localStorage) {
                            localStorage.setItem(name, JSON.stringify(value));
                        }
                    } else {
                        await AsyncStorage.setItem(name, JSON.stringify(value));
                    }
                },
                removeItem: async (name: string) => {
                    if (isWeb) {
                        // Check if localStorage is available
                        if (typeof window !== 'undefined' && window.localStorage) {
                            localStorage.removeItem(name);
                        }
                    } else {
                        await AsyncStorage.removeItem(name);
                    }
                },
            },
            partialize: (state) => ({
                posts: state.posts,
                loading: state.loading,
                fetchPosts: state.fetchPosts,
                createPost: state.createPost,
                deletePost: state.deletePost,
                findPost: state.findPost,
                updatePost: state.updatePost,
                toggleLike: state.toggleLike,
                updatePostStatus: state.updatePostStatus,
            }), // Only persist posts and loading state
        }
    )
);
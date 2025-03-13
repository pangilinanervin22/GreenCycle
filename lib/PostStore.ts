import { create } from 'zustand';
import { persist, StorageValue } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { useAuthStore } from './AuthStore';
import { Platform } from 'react-native';

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
    status: "REQUESTING" | "ACCEPTED" | "REJECTED";
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
}

const isWeb = Platform.OS === 'web';

export const usePostStore = create<PostState>()(
    persist(
        (set, get) => ({
            posts: [],
            loading: false,
            fetchPosts: async () => {
                set({ loading: true });
                try {
                    const { data, error } = await supabase
                        .from('recycle_post')
                        .select(`
                      *,
                       likes(user_id),
                     users(name)
                    `).order('created_at', { ascending: false });

                    // Process the nested data
                    const processedData = data?.map(post => ({
                        ...post,
                        author_name: post.users?.name || 'Unknown Author', // Optional chaining in case users is null
                        likes: {
                            count: post.likes?.length || 0,
                            users: post.likes?.map((like: { user_id: any; }) => like.user_id) || []
                        }
                    })) || [];
                    if (error) throw error;
                    set({ posts: processedData || [] });
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
                    const { data, error } = await supabase
                        .from('recycle_post')
                        .update(content)
                        .eq('id', postId)
                        .select();

                    if (error) throw error;

                    set({
                        posts: get().posts.map(post =>
                            post.id === postId ? data[0] : post
                        ),
                    });
                } finally {
                    set({ loading: false });
                }
            },
            toggleLike: async (postId: string) => {
                const { user } = useAuthStore.getState();
                if (!user) throw new Error('User not authenticated');

                const post = get().posts.find(p => p.id === postId);
                if (!post) return;

                // Ensure likes.users exists and is properly initialized
                const hasLiked = user.id ? post.likes?.users?.includes(user.id) ?? false : false;
                const originalState = [...get().posts];

                // Optimistic update with safe array access
                set(state => ({
                    posts: state.posts.map(p => {
                        if (p.id === postId) {
                            const currentUsers = p.likes?.users ?? []; // Fallback to empty array
                            const newUsers = hasLiked
                                ? currentUsers.filter(id => id !== user.id)
                                : [...currentUsers, user.id].filter((id): id is string => id !== undefined);

                            return {
                                ...p,
                                likes: {
                                    count: newUsers.length,
                                    users: newUsers
                                }
                            };
                        }
                        return p;
                    })
                }));

                try {
                    if (hasLiked) {
                        const { error } = await supabase
                            .from('likes')
                            .delete()
                            .match({ user_id: user.id, post_id: postId });
                        if (error) throw error;
                    } else {
                        const { error } = await supabase
                            .from('likes')
                            .insert({ user_id: user.id, post_id: postId });
                        if (error) throw error;
                    }
                } catch (error) {
                    set({ posts: originalState });
                    throw error;
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
            }), // Only persist posts and loading state
        }
    )
);
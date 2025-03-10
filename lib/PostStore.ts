import { create } from 'zustand';
import { persist, StorageValue } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabase';
import { useAuthStore } from './AuthStore';

export interface Post {
    id: string;
    title: string;
    author_id: string;
    author_name: string;
    description: string;
    likes: number;
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
}

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
                            likes(count)
                        `)
                        .order('created_at', { ascending: false });

                    if (error) throw error;
                    set({ posts: data || [] });
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
                        user_id: user.id,
                        author_name: user.name,
                        ingredients: [...content.ingredients],
                        description: content.description,
                        title: content.title,
                        image_url: content.image_url,
                        likes: 0,
                        status: "REQUESTING"
                    };

                    const { data, error } = await supabase
                        .from('recycle_post')
                        .insert(createdPost)
                        .select();

                    if (error) throw error;
                    set({ posts: [data[0], ...get().posts] });
                } finally {
                    set({ loading: false });
                }
            },
            deletePost: async (postId: string) => {
                set({ loading: true });
                try {
                    const { error } = await supabase
                        .from('recycle_post')
                        .delete()
                        .eq('id', postId);

                    if (error) throw error;
                    set({ posts: get().posts.filter((post) => post.id !== postId) });
                } finally {
                    set({ loading: false });
                }
            },
            findPost: (postId: string) => {
                return get().posts.find(post => post.id == postId);
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
        }),
        {
            name: 'post-storage', // Unique key for SecureStore
            storage: {
                getItem: async (name: string) => {
                    const item = await SecureStore.getItemAsync(name);
                    return item ? JSON.parse(item) : null;
                },
                setItem: (name: string, value: StorageValue<PostState>) => SecureStore.setItemAsync(name, JSON.stringify(value)),
                removeItem: SecureStore.deleteItemAsync,
            },
            partialize: (state) => ({
                posts: state.posts,
                loading: state.loading,
                fetchPosts: state.fetchPosts,
                createPost: state.createPost,
                deletePost: state.deletePost,
                findPost: state.findPost,
                updatePost: state.updatePost,
            }), // Only persist posts
        }
    )
);
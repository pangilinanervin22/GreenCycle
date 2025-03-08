import { create } from 'zustand';
import { persist, StorageValue } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { supabase } from './supabase';
import { useAuthStore } from './AuthStore';

interface Post {
    id: string;
    title: string;
    user_id: string;
    description: string;
    image_url?: string;
    created_at: string;
}

interface PostAddOrEdit {
    title: string;
    description: string;
    image_url?: string;
    user_id: string;
}

interface PostState {
    posts: Post[];
    loading: boolean;
    error: string | null;
    fetchPosts: () => Promise<void>;
    createPost: (content: PostAddOrEdit) => Promise<void>;
    deletePost: (postId: string) => Promise<void>;
}

export const usePostStore = create<PostState>()(
    persist(
        (set, get) => ({
            posts: [],
            loading: false,
            error: null,
            fetchPosts: async () => {
                set({ loading: true, error: null });
                try {
                    const { data, error } = await supabase
                        .from('recycle_post')
                        .select('*')
                        .order('created_at', { ascending: false });

                    if (error) throw error;
                    set({ posts: data || [] });
                } catch (err) {
                    set({ error: (err as Error).message });
                } finally {
                    set({ loading: false });
                }
            },
            createPost: async (content: PostAddOrEdit) => {
                const { user } = useAuthStore.getState(); // Access auth store
                if (!user) throw new Error('User not authenticated');

                set({ loading: true, error: null });
                try {
                    const { data, error } = await supabase
                        .from('recycle_post')
                        .insert([{ ...content, user_id: user.id }])
                        .select();

                    if (error) throw error;
                    set({ posts: [data[0], ...get().posts] });
                } catch (err) {
                    set({ error: (err as Error).message });
                } finally {
                    set({ loading: false });
                }
            },
            deletePost: async (postId: string) => {
                set({ loading: true, error: null });
                try {
                    const { error } = await supabase
                        .from('recycle_post')
                        .delete()
                        .eq('id', postId);

                    if (error) throw error;
                    set({ posts: get().posts.filter((post) => post.id !== postId) });
                } catch (err) {
                    set({ error: (err as Error).message });
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
                error: state.error,
                fetchPosts: state.fetchPosts,
                createPost: state.createPost,
                deletePost: state.deletePost,
            }), // Only persist posts
        }
    )
);
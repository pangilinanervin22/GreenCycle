import { create } from 'zustand';
import { persist, StorageValue } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import { useAuthStore } from './AuthStore';
import { Alert, Platform } from 'react-native';
import Constants from 'expo-constants';
import { extractFilePathFromUrl } from "@/utils/extractFilePathFromUrl";

const DEFAULT_IMAGE_URL = Constants.expoConfig?.extra?.DEFAULT_POST_IMAGE;

export type PostStatus = "REQUESTING" | "PUBLISHED" | "REJECTED";
export interface Post {
    id: string;
    title: string;
    author_id: string;
    author_name: string;
    description: string;
    image_url: string;
    ingredients: string[];
    created_at: string;
    procedure: string;
    likes: {
        count: number;
        users: string[];
    };
    rating: {
        total: number;
        users: string[];
        average: number;
        reviews: {
            user_id: string;
            author_name: string;
            comment: string;
            star: number;
            created_at: string;
        }[];
    };
    status: PostStatus;
    synced: boolean;
}

export interface PostAddOrEdit {
    title: string;
    description: string;
    image_url?: string;
    ingredients: string[];
    procedure: string;
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
    updatePostRating: (postId: string, rating: number, comment: string) => Promise<void>;
    deleteRating: (postId: string) => Promise<void>;
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
                    // fetch all posts from the database
                    const { data: PostData, error } = await supabase
                        .from('recycle_post')
                        .select(`
                      *,
                       likes(user_id),
                       rating(user_id, star, comment),
                       users(name)
                    `).order('created_at', { ascending: false });

                    if (error) throw error;
                    const processedData: Post[] = PostData?.map(post => {
                        const totalRating = post.rating.length;
                        const averageRating = totalRating > 0 ? post.rating.reduce(
                            (sum: number, rating: any) => sum + (rating.star || 0), 0) / totalRating : 0;

                        return {
                            ...JSON.parse(JSON.stringify(post)),
                            synced: true,
                            author_name: post.users?.name || 'Unknown Author', // Optional chaining in case users is null
                            likes: {
                                count: post.likes?.length || 0,
                                users: post.likes?.map((like: any) => like.user_id) || []
                            },
                            rating: {
                                total: totalRating || 0,
                                users: post.rating.map((rating: any) => rating.user_id) || [],
                                reviews: post.rating.map((rating: any) => ({
                                    user_id: rating.user_id,
                                    comment: rating.comment || '',
                                    star: rating.star || 0,
                                    author_name: rating.users?.name || 'Unknown Author', // Optional chaining in case users is null
                                    created_at: rating.created_at || new Date().toISOString(), // Fallback to current date if null
                                })),
                                average: averageRating || 0,
                            }
                        };
                    }) || [];
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
                        procedure: content.procedure,
                        image_url: content.image_url,
                        status: "PUBLISHED",
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
                            },
                            rating: {
                                total: 0,
                                users: []
                            },
                            synced: true,
                            status: "PUBLISHED",
                        }, ...get().posts]
                    });
                } finally {
                    set({ loading: false });
                }
            },
            deletePost: async (postId: string) => {
                set({ loading: true });
                try {
                    // Delete image from storage
                    const imageUrl = get().posts.find((post) => post.id === postId)?.image_url;

                    if (DEFAULT_IMAGE_URL !== imageUrl) {
                        const filePath = extractFilePathFromUrl(imageUrl || '');
                        const { error: ImageError } = await supabase.storage
                            .from('post_image')
                            .remove([filePath]);

                        if (ImageError) throw ImageError;
                    }

                    // Delete the post from the main table
                    const { error } = await supabase
                        .from('recycle_post')
                        .delete()
                        .eq('id', postId);

                    if (error) throw error;

                    set({ posts: get().posts.filter((post) => post.id !== postId) });
                }
                catch (error) {
                    Alert.alert('Error', 'Failed to delete post. Please try again later.');
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
                    const { user } = useAuthStore.getState(); // Access auth store
                    if (!user) throw new Error('User not authenticated');

                    // check if post exists
                    const post = get().posts.find((post) => post.id === postId);
                    if (!post) throw new Error('Post not found');

                    const updatePost = {
                        author_id: user.id,
                        ingredients: [...content.ingredients],
                        description: content.description,
                        title: content.title,
                        procedure: content.procedure,
                        image_url: content.image_url,
                        status: post.status === 'REJECTED' ? 'REQUESTING' : 'PUBLISHED',
                    }

                    const { error } = await supabase
                        .from('recycle_post')
                        .update(updatePost)
                        .eq('id', postId)
                        .select();

                    if (error) {
                        console.log(error, 'error');

                        throw error;
                    };

                    set({
                        posts: get().posts.map((postItem) =>
                            postItem.id === postId ? {
                                ...JSON.parse(JSON.stringify(postItem)),
                                ...JSON.parse(JSON.stringify(updatePost)),
                                synced: true,
                            } : postItem
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
                            ...JSON.parse(JSON.stringify(postItem)),
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
            },
            // Update post rating
            updatePostRating: async (postId: string, rating: number, comment: string) => {
                const { user } = useAuthStore.getState();
                if (!user) throw new Error('User not authenticated');

                const currentPost = get().posts.find((p) => p.id === postId);
                if (!currentPost) return;

                const userId = user.id!;
                const originalPosts = get().posts;
                const hasRated = currentPost.rating.users.includes(userId);
                const updatedReviews = hasRated
                    ? currentPost.rating.reviews.map((review) =>
                        review.user_id === userId ? { ...review, star: rating, comment } : review
                    )
                    : [...currentPost.rating.reviews, { user_id: userId, star: rating, comment }];

                const totalRatings = updatedReviews.reduce((sum, review) => sum + review.star, 0);
                const newTotal = updatedReviews.length;
                const newAverage = newTotal > 0 ? totalRatings / newTotal : 0;
                const newUsers = hasRated ? currentPost.rating.users.filter((id) => id !== userId) : [...currentPost.rating.users, userId];

                // Optimistic update
                set((state) => ({
                    posts: state.posts.map((postItem) =>
                        postItem.id === postId ? {
                            ...postItem,
                            rating: {
                                total: newTotal,
                                average: newAverage,
                                users: newUsers,
                                reviews: hasRated ?
                                    postItem.rating.reviews.map((review) =>
                                        review.user_id === userId ? { ...JSON.parse(JSON.stringify(review)), star: rating, comment } : review
                                    ) : [
                                        ...JSON.parse(JSON.stringify(postItem.rating.reviews)),
                                        { user_id: userId, star: rating, comment },
                                    ],
                            },
                        } : postItem
                    ),
                }));

                try {
                    if (hasRated) {
                        const { error } = await supabase
                            .from('rating')
                            .update({ star: rating, comment })
                            .match({ user_id: userId, post_id: postId });
                        if (error) throw error;
                    } else {
                        const { error } = await supabase
                            .from('rating')
                            .insert({ user_id: userId, post_id: postId, star: rating, comment });
                        if (error) throw error;
                    }
                } catch (error) {
                    set({ posts: originalPosts });
                    throw error;
                }
            },
            deleteRating: async (postId: string) => {
                const { user } = useAuthStore.getState();
                if (!user) throw new Error('User not authenticated');

                const currentPost = get().posts.find((p) => p.id === postId);
                if (!currentPost) return;

                const userId = user.id!;
                const originalPosts = get().posts;
                const newTotal = currentPost.rating.total - 1;
                const newUsers = currentPost.rating.users.filter((id) => id !== userId);

                // Optimistic update
                set((state) => ({
                    posts: state.posts.map((postItem) =>
                        postItem.id === postId ? {
                            ...postItem,
                            rating: {
                                total: newTotal,
                                users: newUsers,
                                reviews: postItem.rating.reviews.filter((review) => review.user_id !== userId),
                                average: (currentPost.rating.average * currentPost.rating.total - currentPost.rating.average) / newTotal,
                            },
                        } : postItem
                    ),
                }));

                try {
                    const { error } = await supabase
                        .from('rating')
                        .delete()
                        .match({ user_id: userId, post_id: postId });
                    if (error) throw error;
                } catch (error) {
                    set({ posts: originalPosts });
                    throw error;
                }
            },
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
                updatePostRating: state.updatePostRating,
                deleteRating: state.deleteRating,
            }), // Only persist posts and loading state
        }
    )
);
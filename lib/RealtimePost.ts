// import { create } from 'zustand';
// import { persist, StorageValue } from 'zustand/middleware';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { supabase } from './supabase';
// import { useAuthStore } from './AuthStore';
// import { Platform } from 'react-native';

// export interface Post {
//     id: string;
//     title: string;
//     author_id: string;
//     author_name: string;
//     description: string;
//     likes: {
//         count: number;
//         users: string[];
//     };
//     image_url: string;
//     ingredients: string[];
//     created_at: string;
//     status: "REQUESTING" | "PUBLISHED" | "REJECTED";
// }

// export interface PostAddOrEdit {
//     title: string;
//     description: string;
//     image_url?: string;
//     ingredients: string[];
// }

// interface PostState {
//     posts: Post[];
//     loading: boolean;
//     fetchPosts: () => Promise<void>;
//     createPost: (content: PostAddOrEdit) => Promise<void>;
//     deletePost: (postId: string) => Promise<void>;
//     findPost: (postId: string) => Post | undefined;
//     updatePost: (postId: string, content: PostAddOrEdit) => Promise<void>;
//     toggleLike: (postId: string) => Promise<void>;
//     subscribe: () => () => void; // Add subscribe method
// }

// const isWeb = Platform.OS === 'web';

// export const usePostStore = create<PostState>()(
//     persist(
//         (set, get) => ({
//             posts: [],
//             loading: false,
//             fetchPosts: async () => {
//                 set({ loading: true });
//                 try {
//                     const { data, error } = await supabase
//                         .from('recycle_post')
//                         .select(`
//                       *,
//                        likes(user_id),
//                      users(name)
//                     `).order('created_at', { ascending: false });

//                     // Process the nested data
//                     const processedData = data?.map(post => ({
//                         ...post,
//                         author_name: post.users?.name || 'Unknown Author', // Optional chaining in case users is null
//                         likes: {
//                             count: post.likes?.length || 0,
//                             users: post.likes?.map((like: { user_id: any; }) => like.user_id) || []
//                         }
//                     })) || [];
//                     if (error) throw error;
//                     set({ posts: processedData || [] });
//                 } finally {
//                     set({ loading: false });
//                 }
//             },
//             createPost: async (content: PostAddOrEdit) => {
//                 const { user } = useAuthStore.getState(); // Access auth store
//                 if (!user) throw new Error('User not authenticated');

//                 set({ loading: true });
//                 try {
//                     const createdPost = {
//                         author_id: user.id,
//                         ingredients: [...content.ingredients],
//                         description: content.description,
//                         title: content.title,
//                         image_url: content.image_url,
//                         status: "REQUESTING"
//                     };


//                     const { data, error } = await supabase
//                         .from('recycle_post')
//                         .insert(createdPost)
//                         .select();


//                     if (error) throw error;
//                     set({
//                         posts: [{
//                             ...data[0],
//                             author_name: user.name,
//                             likes: {
//                                 count: 0,
//                                 users: []
//                             }
//                         }, ...get().posts]
//                     });
//                 } finally {
//                     set({ loading: false });
//                 }
//             },
//             deletePost: async (postId: string) => {
//                 set({ loading: true });
//                 try {
//                     // Delete the post from the main table
//                     const { error } = await supabase
//                         .from('recycle_post')
//                         .delete()
//                         .eq('id', postId);

//                     if (error) throw error;

//                     // Also remove all likes for that post from the likes table
//                     const { error: likesError } = await supabase
//                         .from('likes')
//                         .delete()
//                         .eq('post_id', postId);
//                     if (likesError) throw likesError;

//                     set({ posts: get().posts.filter((post) => post.id !== postId) });
//                 } finally {
//                     set({ loading: false });
//                 }
//             },
//             findPost: (postId: string) => {
//                 return get().posts.find(post => post.id === postId);
//             },
//             updatePost: async (postId: string, content: PostAddOrEdit) => {
//                 set({ loading: true });
//                 try {
//                     const { data, error } = await supabase
//                         .from('recycle_post')
//                         .update(content)
//                         .eq('id', postId)
//                         .select();

//                     if (error) throw error;

//                     set({
//                         posts: get().posts.map(post =>
//                             post.id === postId ? data[0] : post
//                         ),
//                     });
//                 } finally {
//                     set({ loading: false });
//                 }
//             },
//             toggleLike: async (postId: string) => {
//                 const { user } = useAuthStore.getState();
//                 if (!user) throw new Error('User not authenticated');

//                 const post = get().posts.find(p => p.id === postId);
//                 if (!post) return;

//                 // Ensure likes.users exists and is properly initialized
//                 const hasLiked = user.id ? post.likes?.users?.includes(user.id) ?? false : false;
//                 const originalState = [...get().posts];

//                 // Optimistic update with safe array access
//                 set(state => ({
//                     posts: state.posts.map(p => {
//                         if (p.id === postId) {
//                             const currentUsers = p.likes?.users ?? []; // Fallback to empty array
//                             const newUsers = hasLiked
//                                 ? currentUsers.filter(id => id !== user.id)
//                                 : [...currentUsers, user.id].filter((id): id is string => id !== undefined);

//                             return {
//                                 ...p,
//                                 likes: {
//                                     count: newUsers.length,
//                                     users: newUsers
//                                 }
//                             };
//                         }
//                         return p;
//                     })
//                 }));

//                 try {
//                     if (hasLiked) {
//                         const { error } = await supabase
//                             .from('likes')
//                             .delete()
//                             .match({ user_id: user.id, post_id: postId });
//                         if (error) throw error;
//                     } else {
//                         const { error } = await supabase
//                             .from('likes')
//                             .insert({ user_id: user.id, post_id: postId });
//                         if (error) throw error;
//                     }
//                 } catch (error) {
//                     set({ posts: originalState });
//                     throw error;
//                 }
//             }, subscribe: () => {
//                 const handleRecyclePostChange = async (payload: any) => {
//                     const currentPosts = get().posts;
//                     switch (payload.eventType) {
//                         case 'INSERT': {
//                             const newPostId = payload.new.id;
//                             const { data: fullPost, error } = await supabase
//                                 .from('recycle_post')
//                                 .select('*, likes(user_id), users(name)')
//                                 .eq('id', newPostId)
//                                 .single();

//                             if (error) {
//                                 console.error('Error fetching new post:', error);
//                                 return;
//                             }

//                             const processedPost: Post = {
//                                 ...fullPost,
//                                 author_name: fullPost.users?.name || 'Unknown Author',
//                                 likes: {
//                                     count: fullPost.likes?.length || 0,
//                                     users: fullPost.likes?.map((like: any) => like.user_id) || []
//                                 }
//                             };

//                             set({ posts: [processedPost, ...currentPosts] });
//                             break;
//                         }
//                         case 'UPDATE': {
//                             const updatedPostId = payload.new.id;
//                             const { data: fullPost, error } = await supabase
//                                 .from('recycle_post')
//                                 .select('*, likes(user_id), users(name)')
//                                 .eq('id', updatedPostId)
//                                 .single();

//                             if (error) {
//                                 console.error('Error fetching updated post:', error);
//                                 return;
//                             }

//                             const processedPost: Post = {
//                                 ...fullPost,
//                                 author_name: fullPost.users?.name || 'Unknown Author',
//                                 likes: {
//                                     count: fullPost.likes?.length || 0,
//                                     users: fullPost.likes?.map((like: any) => like.user_id) || []
//                                 }
//                             };

//                             set({
//                                 posts: currentPosts.map(post =>
//                                     post.id === processedPost.id ? processedPost : post
//                                 )
//                             });
//                             break;
//                         }
//                         case 'DELETE': {
//                             const deletedPostId = payload.old.id;
//                             set({ posts: currentPosts.filter(post => post.id !== deletedPostId) });
//                             break;
//                         }
//                     }
//                 };

//                 const handleLikesChange = (payload: any) => {
//                     const { user } = useAuthStore.getState();
//                     const currentPosts = get().posts;
//                     switch (payload.eventType) {
//                         case 'INSERT': {
//                             const newLike = payload.new as { post_id: string; user_id: string; };
//                             if (user?.id === newLike.user_id) return; // Skip own actions

//                             const post = currentPosts.find(p => p.id === newLike.post_id);
//                             if (post && !post.likes.users.includes(newLike.user_id)) {
//                                 const updatedPost = {
//                                     ...post,
//                                     likes: {
//                                         count: post.likes.count + 1,
//                                         users: [...post.likes.users, newLike.user_id]
//                                     }
//                                 };
//                                 set({
//                                     posts: currentPosts.map(p =>
//                                         p.id === newLike.post_id ? updatedPost : p
//                                     )
//                                 });
//                             }
//                             break;
//                         }
//                         case 'DELETE': {
//                             const oldLike = payload.old as { post_id: string; user_id: string; };
//                             if (user?.id === oldLike.user_id) return; // Skip own actions

//                             const post = currentPosts.find(p => p.id === oldLike.post_id);
//                             if (post) {
//                                 const updatedUsers = post.likes.users.filter(id => id !== oldLike.user_id);
//                                 const updatedPost = {
//                                     ...post,
//                                     likes: {
//                                         count: updatedUsers.length,
//                                         users: updatedUsers
//                                     }
//                                 };
//                                 set({
//                                     posts: currentPosts.map(p =>
//                                         p.id === oldLike.post_id ? updatedPost : p
//                                     )
//                                 });
//                             }
//                             break;
//                         }
//                     }
//                 };

//                 // Subscribe to recycle_post changes
//                 const postsChannel = supabase
//                     .channel('recycle_posts')
//                     .on('postgres_changes', {
//                         event: '*',
//                         schema: 'public',
//                         table: 'recycle_post',
//                     }, handleRecyclePostChange)
//                     .subscribe();

//                 // Subscribe to likes changes
//                 const likesChannel = supabase
//                     .channel('post_likes')
//                     .on('postgres_changes', {
//                         event: '*',
//                         schema: 'public',
//                         table: 'likes',
//                     }, handleLikesChange)
//                     .subscribe();

//                 // Return cleanup function
//                 return () => {
//                     supabase.removeChannel(postsChannel);
//                     supabase.removeChannel(likesChannel);
//                 };
//             },
//         }),
//         {
//             name: 'post-storage',
//             storage: {
//                 getItem: async (name: string) => {
//                     if (isWeb) {
//                         // Check if localStorage is available
//                         if (typeof window !== 'undefined' && window.localStorage) {
//                             const value = localStorage.getItem(name);
//                             return value ? JSON.parse(value) : null;
//                         }
//                         return null;
//                     } else {
//                         const value = await AsyncStorage.getItem(name);
//                         return value ? JSON.parse(value) : null;
//                     }
//                 },
//                 setItem: async (name: string, value: StorageValue<PostState>) => {
//                     if (isWeb) {
//                         // Check if localStorage is available
//                         if (typeof window !== 'undefined' && window.localStorage) {
//                             localStorage.setItem(name, JSON.stringify(value));
//                         }
//                     } else {
//                         await AsyncStorage.setItem(name, JSON.stringify(value));
//                     }
//                 },
//                 removeItem: async (name: string) => {
//                     if (isWeb) {
//                         // Check if localStorage is available
//                         if (typeof window !== 'undefined' && window.localStorage) {
//                             localStorage.removeItem(name);
//                         }
//                     } else {
//                         await AsyncStorage.removeItem(name);
//                     }
//                 },
//             },
//             partialize: (state) => ({
//                 posts: state.posts,
//                 loading: state.loading,
//                 fetchPosts: state.fetchPosts,
//                 createPost: state.createPost,
//                 deletePost: state.deletePost,
//                 findPost: state.findPost,
//                 updatePost: state.updatePost,
//                 toggleLike: state.toggleLike,
//                 subscribe: state.subscribe,
//             }), // Only persist posts and loading state
//         }
//     )
// );
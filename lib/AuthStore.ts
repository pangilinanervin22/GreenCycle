import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as SecureStore from 'expo-secure-store';
import { supabase } from "./supabase";

interface User {
    id?: string;
    email: string;
    name: string;
    description?: string;
    role: 'admin' | 'user'; // Add a role field
}

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    setUser: (user: User | null) => void;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    initializeAuth: () => Promise<void>;
    isAdmin: () => boolean; // Add a helper function to check if the user is an admin
}

const fetchUserProfile = async (userId: string): Promise<User> => {
    const { data, error } = await supabase
        .from('users')
        .select('email, name, description, role') // Include role in the query
        .eq('user_id', userId)
        .single();

    if (error) throw error;

    return {
        email: data.email || '',
        name: data.name || '',
        description: data.description || '',
        role: data.role || 'user', // Default to 'user' if role is not set
    };
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            loading: true,
            error: null,
            setUser: (user) => set({ user, error: null }),
            isAdmin: () => {
                const user = get().user;
                return user?.role === 'admin'; // Check if the user's role is 'admin'
            },
            login: async (email, password) => {
                set({ loading: true, error: null });
                try {
                    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                    if (error) throw error;
                    if (!data.user) throw new Error('No user data returned from Supabase');

                    const userProfile = await fetchUserProfile(data.user.id);
                    set({ user: userProfile, error: null });
                } catch (err: any) {
                    set({ error: err?.message || 'An error occurred during login' });
                } finally {
                    set({ loading: false });
                }
            },
            signup: async (email, password, name) => {
                set({ loading: true, error: null });
                try {
                    const { data, error } = await supabase.auth.signUp({ email, password });
                    if (error) throw error;
                    if (!data.user) throw new Error('No user data returned from Supabase');

                    // Default role is 'user' for new signups
                    await supabase.from('users').insert([{ id: data.user.id, email, name, description: '', role: 'user' }]);
                    set({ user: { email, name, role: 'user' }, error: null });
                } catch (err: any) {
                    set({ error: err?.message || 'An error occurred during signup' });
                } finally {
                    set({ loading: false });
                }
            },
            logout: async () => {
                set({ loading: true, error: null });
                try {
                    await supabase.auth.signOut();
                    set({ user: null, error: null });
                } catch (err: any) {
                    set({ error: err?.message || 'An error occurred during logout' });
                } finally {
                    set({ loading: false });
                }
            },
            initializeAuth: async () => {
                set({ loading: true, error: null });
                try {
                    const { data } = await supabase.auth.getSession();
                    if (data.session?.user) {
                        const userProfile = await fetchUserProfile(data.session.user.id);
                        set({ user: userProfile, error: null });
                    } else {
                        set({ user: null, error: null });
                    }
                } catch (err: any) {
                    set({ error: err?.message || 'An error occurred during initialization' });
                } finally {
                    set({ loading: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: {
                getItem: async (name) => {
                    const value = await SecureStore.getItemAsync(name);
                    return value ? JSON.parse(value) : null;
                },
                setItem: async (name, value) => {
                    await SecureStore.setItemAsync(name, JSON.stringify(value));
                },
                removeItem: async (name) => {
                    await SecureStore.deleteItemAsync(name);
                },
            },
        }
    )
);
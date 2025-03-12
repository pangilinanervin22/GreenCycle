import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as SecureStore from 'expo-secure-store';
import { supabase } from "./supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface User {
    id?: string;
    email: string;
    name: string;
    description?: string;
    role: 'admin' | 'user';
}

interface AuthState {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    logout: () => Promise<void>;
    initializeAuth: () => Promise<void>;
    isAdmin: () => boolean;
}

const fetchUserProfile = async (userId: string): Promise<User> => {
    const { data, error } = await supabase
        .from('users')
        .select('email, name, description, role')
        .eq('id', userId)
        .single();

    if (error) throw error;

    return {
        email: data.email || '',
        name: data.name || '',
        description: data.description || '',
        role: data.role || 'user',
    };
};

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            loading: false,
            setUser: (user) => set({ user }),
            isAdmin: () => get().user?.role === 'admin',

            login: async (email, password) => {
                set({ loading: true });
                try {
                    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
                    if (error) throw error;
                    if (!data.user) throw new Error('No user data returned from Supabase');

                    const userProfile = await fetchUserProfile(data.user.id);
                    set({ user: userProfile });
                } finally {
                    set({ loading: false });
                }
            },

            signup: async (email, password, name) => {
                set({ loading: true });
                try {
                    const { data, error } = await supabase.auth.signUp({ email, password });
                    if (error) throw error;
                    if (!data.user) throw new Error('No user data returned from Supabase');

                    await supabase.from('users').insert([{
                        email: data.user.email,
                        name,
                        role: 'user'
                    }]);

                    set({
                        user: {
                            email: data.user.email ?? '',
                            name,
                            role: 'user'
                        }
                    });
                } finally {
                    set({ loading: false });
                }
            },

            logout: async () => {
                set({ loading: true });
                try {
                    await supabase.auth.signOut();
                    AsyncStorage.clear();
                    SecureStore.deleteItemAsync('auth-storage');

                    set({ user: null });
                } finally {
                    set({ loading: false });
                }
            },

            initializeAuth: async () => {
                set({ loading: true });
                try {
                    const { data } = await supabase.auth.getSession();
                    if (data.session?.user) {
                        const userProfile = await fetchUserProfile(data.session.user.id);
                        set({ user: userProfile });
                    } else {
                        set({ user: null });
                    }
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
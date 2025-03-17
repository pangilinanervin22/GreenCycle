import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as SecureStore from 'expo-secure-store';
import { supabase } from "./supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

export interface User {
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
    updateAccount: (name: string, description?: string) => Promise<void>;
}

const fetchUserProfile = async (userId: string): Promise<User> => {
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
};

const isWeb = Platform.OS === 'web';

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
                    if (isWeb) {
                        localStorage.removeItem('auth-storage');
                    } else {
                        await SecureStore.deleteItemAsync('auth-storage');
                    }
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

            updateAccount: async (name, description) => {
                set({ loading: true });
                try {
                    const user = get().user;
                    if (!user || !user.id) throw new Error('User not logged in');

                    const { data, error } = await supabase
                        .from('users')
                        .update({ name, description })
                        .eq('id', user.id)
                        .select()
                        .single();

                    if (error) throw error;

                    set({ user: { ...user, name: data.name, description: data.description } });
                } finally {
                    set({ loading: false });
                }
            },
        }),
        {
            name: 'auth-storage',
            storage: {
                getItem: async (name) => {
                    if (isWeb) {
                        // Check if localStorage is available
                        if (typeof window !== 'undefined' && window.localStorage) {
                            const value = localStorage.getItem(name);
                            return value ? JSON.parse(value) : null;
                        }
                        return null;
                    } else {
                        const value = await SecureStore.getItemAsync(name);
                        return value ? JSON.parse(value) : null;
                    }
                },
                setItem: async (name, value) => {
                    if (isWeb) {
                        // Check if localStorage is available
                        if (typeof window !== 'undefined' && window.localStorage) {
                            localStorage.setItem(name, JSON.stringify(value));
                        }
                    } else {
                        await SecureStore.setItemAsync(name, JSON.stringify(value));
                    }
                },
                removeItem: async (name) => {
                    if (isWeb) {
                        // Check if localStorage is available
                        if (typeof window !== 'undefined' && window.localStorage) {
                            localStorage.removeItem(name);
                        }
                    } else {
                        await SecureStore.deleteItemAsync(name);
                    }
                },
            },
        }
    )
);
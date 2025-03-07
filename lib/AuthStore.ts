import { create } from "zustand";
import { supabase } from "./supabase";
import { persist } from "zustand/middleware";
import * as SecureStore from 'expo-secure-store';

interface User {
    id?: string
    email: string;
}

interface AuthState {
    user: null | User;
    loading: boolean; // Add a loading state
    setUser: (user: { email: string } | null) => void;
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    initializeAuth: () => Promise<void>; // Add a method to initialize auth
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            loading: true, // Initialize loading as true
            setUser: (user) => set({ user }),
            login: async (email, password) => {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                set({ user: { email: data.user?.email || '' } });
            },
            signup: async (email, password) => {
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                set({ user: { email: data.user?.email || '' } });
            },
            logout: async () => {
                await supabase.auth.signOut();
                set({ user: null });
            },
            initializeAuth: async () => {
                const { data } = await supabase.auth.getSession();
                set({ user: data.session?.user ? { email: data.session.user.email || '' } : null, loading: false });
            },
        }),
        {
            name: 'auth-storage', // Unique key for SecureStore
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
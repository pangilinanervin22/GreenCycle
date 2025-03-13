// stores/authStore.ts
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_KEY as string;

const isWeb = Platform.OS === 'web';

export const storage = {
    getItem: async (key: string): Promise<string | null> => {
        if (isWeb) {
            // Check if localStorage is available
            if (typeof window !== 'undefined' && window.localStorage) {
                return localStorage.getItem(key);
            } else {
                return null;
            }
        } else {
            return await SecureStore.getItemAsync(key);
        }
    },
    setItem: async (key: string, value: string): Promise<void> => {
        if (isWeb) {
            // Check if localStorage is available
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem(key, value);
            }
        } else {
            await SecureStore.setItemAsync(key, value);
        }
    },
    removeItem: async (key: string): Promise<void> => {
        if (isWeb) {
            // Check if localStorage is available
            if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.removeItem(key);
            }
        } else {
            await SecureStore.deleteItemAsync(key);
        }
    },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: storage, // Use the platform-specific storage adapter
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
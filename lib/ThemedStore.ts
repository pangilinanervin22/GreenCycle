import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const tintColorLight = '#2f95dc';
const tintColorDark = '#fff';

const theme = {
    light: {
        text: '#000',
        background: '#fff',
        tint: tintColorLight,
        tabIconDefault: '#ccc',
        tabIconSelected: tintColorLight,
        primaryTextColor: '#00512C',
        secondaryTextColor: '#fff',
        backgroundColor: '#000',
    },
    dark: {
        text: '#fff',
        background: '#000',
        tint: tintColorDark,
        tabIconDefault: '#ccc',
        tabIconSelected: tintColorDark,
        primaryTextColor: '#000',
        secondaryTextColor: '#fff',
        backgroundColor: '#00512C',
    },
};


type ThemeMode = 'light' | 'dark';

interface ThemeStore {
    mode: ThemeMode;
    currentTheme: typeof theme.light;
    setMode: (newMode: ThemeMode) => Promise<void>;
    loadMode: () => Promise<void>;
}

export const useThemeStore = create<ThemeStore>((set) => ({
    mode: 'light',
    currentTheme: theme.light,
    setMode: async (newMode) => {
        await SecureStore.setItemAsync('themeMode', newMode);
        set({ mode: newMode, currentTheme: theme[newMode] });
    },
    loadMode: async () => {
        const storedMode = await SecureStore.getItemAsync('themeMode');
        if (storedMode === 'dark' || storedMode === 'light') {
            set({ mode: storedMode, currentTheme: theme[storedMode] });
        }
    },
}));

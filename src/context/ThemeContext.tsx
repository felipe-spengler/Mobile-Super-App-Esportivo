
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextData {
    colorScheme: 'light' | 'dark';
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { colorScheme, setColorScheme } = useColorScheme();
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        (async () => {
            const storedTheme = await AsyncStorage.getItem('theme');
            if (storedTheme === 'dark' || storedTheme === 'light') {
                setColorScheme(storedTheme);
            }
            setIsReady(true);
        })();
    }, []);

    const toggleTheme = async () => {
        const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
        setColorScheme(newTheme);
        await AsyncStorage.setItem('theme', newTheme);
    };

    if (!isReady) return null;

    return (
        <ThemeContext.Provider value={{ colorScheme: colorScheme || 'light', toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    return useContext(ThemeContext);
}

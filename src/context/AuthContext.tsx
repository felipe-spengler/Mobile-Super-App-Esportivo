
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

interface User {
    id: number;
    name: string;
    email: string;
    is_admin?: boolean;
    club_id?: number | null;
    phone?: string;
    cpf?: string;
    birth_date?: string;
}

interface Club {
    id: number;
    name: string;
    slug: string;
    colors?: any;
}

interface AuthContextData {
    user: User | null;
    loading: boolean;
    signIn: (login: string, pass: string) => Promise<void>;
    signOut: () => Promise<void>;
    isAuthenticated: boolean;
    selectedClub: Club | null;
    selectClub: (club: Club | null) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [selectedClub, setSelectedClub] = useState<Club | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStorageData() {
            try {
                const [token, userStr, clubStr] = await Promise.all([
                    AsyncStorage.getItem('@App:token'),
                    AsyncStorage.getItem('@App:user'),
                    AsyncStorage.getItem('@App:selectedClub')
                ]);

                if (token && userStr) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    setUser(JSON.parse(userStr));
                }

                if (clubStr) {
                    setSelectedClub(JSON.parse(clubStr));
                }
            } catch (error) {
                console.log('Error loading storage', error);
            } finally {
                setLoading(false);
            }
        }
        loadStorageData();
    }, []);

    async function signIn(login: string, pass: string) {
        try {
            const response = await api.post('/login', {
                login,
                password: pass,
            });

            const { user, access_token } = response.data;

            api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

            setUser(user);
            await AsyncStorage.setItem('@App:token', access_token);
            await AsyncStorage.setItem('@App:user', JSON.stringify(user));

        } catch (error: any) {
            Alert.alert('Erro no Login', error.response?.data?.message || 'Verifique suas credenciais');
            throw error;
        }
    }

    async function signOut() {
        setUser(null);
        await AsyncStorage.removeItem('@App:token');
        await AsyncStorage.removeItem('@App:user');
        // Mantém selectedClub para não perder a navegação
    }

    async function selectClub(club: Club | null) {
        setSelectedClub(club);
        if (club) {
            await AsyncStorage.setItem('@App:selectedClub', JSON.stringify(club));
        } else {
            await AsyncStorage.removeItem('@App:selectedClub');
        }
    }

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signOut, isAuthenticated: !!user, selectedClub, selectClub }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    return context;
}

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { api } from '../../../src/services/api';
import '../../../global.css';

interface Match {
    id: number;
    championship_id: number;
    home_team_id: number;
    away_team_id: number;
    home_team_name: string;
    away_team_name: string;
    match_date: string;
    sport_id: number;
    sport_name: string;
}

const SPORT_SUMULAS: Record<number, string> = {
    1: 'futebol',
    2: 'futsal',
    3: 'volei',
    4: 'basquete',
    5: 'handebol',
    6: 'futebol-7',
    7: 'lutas',
};

export default function SumulaSelector() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [match, setMatch] = useState<Match | null>(null);

    useEffect(() => {
        if (id) loadMatch();
    }, [id]);

    const loadMatch = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/matches/${id}`);
            setMatch(response.data);
        } catch (error) {
            console.error('Erro ao carregar partida:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSumula = (sportKey: string) => {
        router.push(`/admin/sumula-${sportKey}?match_id=${id}` as any);
    };

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
                <ActivityIndicator size="large" color="#4F46E5" />
                <Text className="mt-3 text-gray-500 font-medium">Carregando...</Text>
            </View>
        );
    }

    if (!match) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
                <Ionicons name="alert-circle" size={64} color="#EF4444" />
                <Text className="mt-4 text-xl font-bold text-gray-800 dark:text-white">Partida não encontrada</Text>
            </View>
        );
    }

    const sportKey = SPORT_SUMULAS[match.sport_id] || 'futebol';

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="pt-12 pb-4 px-4 bg-white dark:bg-gray-800 shadow-sm flex-row items-center border-b border-gray-100 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-gray-700">
                    <Ionicons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 dark:text-white ml-2">Súmula Digital</Text>
            </View>

            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                {/* Match Info */}
                <View className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-6 relative overflow-hidden">
                    <View className="absolute top-0 right-0 p-2 opacity-5">
                        <Ionicons name="trophy" size={100} color="#000" />
                    </View>
                    <Text className="text-indigo-600 dark:text-indigo-400 font-bold uppercase text-xs tracking-wider mb-2">{match.sport_name}</Text>
                    <View className="flex-row items-center justify-between mb-3">
                        <Text className="text-lg font-bold text-gray-800 dark:text-white flex-1 text-center">{match.home_team_name}</Text>
                        <Text className="text-gray-400 font-bold text-sm mx-4">VS</Text>
                        <Text className="text-lg font-bold text-gray-800 dark:text-white flex-1 text-center">{match.away_team_name}</Text>
                    </View>
                    <Text className="text-center text-gray-500 text-xs">
                        {new Date(match.match_date).toLocaleString('pt-BR')}
                    </Text>
                </View>

                {/* Auto-detect Button */}
                <TouchableOpacity
                    className="flex-row items-center p-5 bg-indigo-600 rounded-xl mb-8 shadow-lg shadow-indigo-200 dark:shadow-none active:scale-[0.98] transition-transform"
                    onPress={() => handleSelectSumula(sportKey)}
                >
                    <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-4">
                        <Ionicons name="flash" size={24} color="#fff" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-bold text-lg">Abrir Súmula Automática</Text>
                        <Text className="text-indigo-200 text-sm">
                            Detectado: {match.sport_name}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={24} color="#fff" />
                </TouchableOpacity>

                {/* Manual Selection */}
                <Text className="text-gray-800 dark:text-white font-bold text-lg mb-4">Ou escolha manualmente:</Text>

                <View className="flex-row flex-wrap justify-between gap-y-4">
                    {[
                        { key: 'futebol', label: 'Futebol', icon: 'football', color: '#10B981' },
                        { key: 'futsal', label: 'Futsal', icon: 'football', color: '#3B82F6' },
                        { key: 'volei', label: 'Vôlei', icon: 'basketball', color: '#F59E0B' },
                        { key: 'basquete', label: 'Basquete', icon: 'basketball', color: '#EF4444' },
                        { key: 'handebol', label: 'Handebol', icon: 'hand-left', color: '#8B5CF6', iconSet: 'Ionicons' },
                        { key: 'futebol-7', label: 'Futebol 7', icon: 'football', color: '#14B8A6' },
                        { key: 'lutas', label: 'Lutas/MMA', icon: 'fitness', color: '#EC4899' },
                    ].map((item: any) => (
                        <TouchableOpacity
                            key={item.key}
                            className="w-[48%] p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl items-center shadow-sm active:bg-gray-50 dark:active:bg-gray-700"
                            onPress={() => handleSelectSumula(item.key)}
                        >
                            <Ionicons name={item.icon} size={32} color={item.color} />
                            <Text className="mt-2 font-bold text-gray-700 dark:text-gray-300 text-sm">{item.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

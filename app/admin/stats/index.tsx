import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator, TouchableOpacity, RefreshControl } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../src/services/api';

const COLORS = {
    primary: '#10b981', // Emerald 500
    secondary: '#3b82f6', // Blue 500
    dark: '#0f172a', // Slate 900
    card: '#1e293b', // Slate 800
    text: '#f8fafc', // Slate 50
    textMuted: '#94a3b8' // Slate 400
};

export default function StatisticsDashboard() {
    const router = useRouter();
    const { championshipId } = useLocalSearchParams(); // Opcional, se vier de um campeonato específico
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'goalkeepers' | 'scorers' | 'assists' | 'cards'>('scorers');
    const [stats, setStats] = useState<any>({
        scorers: [],
        assists: [],
        cards: [],
        standings: []
    });

    const fetchStats = async () => {
        try {
            setLoading(true);
            // Se não tiver ID, pega do primeiro campeonato ativo (mock ou lógica real)
            const id = championshipId || 1;

            const [scorersRes, assistsRes, cardsRes] = await Promise.all([
                api.get(`/championships/${id}/stats/top-scorers`),
                api.get(`/championships/${id}/stats/assists`),
                api.get(`/championships/${id}/stats/cards`)
            ]);

            setStats({
                scorers: scorersRes.data,
                assists: assistsRes.data,
                cards: cardsRes.data,
                standings: []
            });
        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [championshipId]);

    const renderPlayerRow = (item: any, index: number, valueKey: string, valueLabel: string) => (
        <View key={item.player_id} className="flex-row items-center bg-slate-800 mb-3 p-3 rounded-xl border border-slate-700">
            <View className="w-8 items-center justify-center mr-2">
                {index < 3 ? (
                    <Ionicons name="trophy" size={20} color={index === 0 ? '#fbbf24' : index === 1 ? '#94a3b8' : '#b45309'} />
                ) : (
                    <Text className="text-slate-400 font-bold">{index + 1}º</Text>
                )}
            </View>

            <Image
                source={{ uri: item.photo_url || 'https://via.placeholder.com/100' }}
                className="w-10 h-10 rounded-full bg-slate-600 mr-3"
            />

            <View className="flex-1">
                <Text className="text-white font-bold text-base">{item.player_name}</Text>
                <Text className="text-slate-400 text-xs">{item.team_name}</Text>
            </View>

            <View className="items-end">
                <Text className="text-emerald-400 font-bold text-xl">{item[valueKey]}</Text>
                <Text className="text-slate-500 text-[10px] uppercase">{valueLabel}</Text>
            </View>
        </View>
    );

    const renderContent = () => {
        let data = [];
        let key = '';
        let label = '';

        switch (activeTab) {
            case 'scorers': data = stats.scorers; key = 'goals'; label = 'Gols'; break;
            case 'assists': data = stats.assists; key = 'assists'; label = 'Assis.'; break;
            case 'cards': data = stats.cards; key = 'yellow_cards'; label = 'Cartões'; break;
            default: data = stats.scorers; key = 'goals'; label = 'Gols';
        }

        if (data.length === 0) {
            return (
                <View className="items-center justify-center py-20">
                    <Ionicons name="stats-chart" size={64} color="#334155" />
                    <Text className="text-slate-500 mt-4">Nenhum dado registrado ainda.</Text>
                </View>
            );
        }

        return (
            <View className="pb-20">
                {/* HERÓI DO TOPO (TOP 1) */}
                {data.length > 0 && (
                    <View className="items-center mb-8 mt-4">
                        <View className="relative">
                            <View className="absolute -inset-1 bg-emerald-500 rounded-full blur-sm opacity-50" />
                            <Image
                                source={{ uri: data[0].photo_url || 'https://via.placeholder.com/150' }}
                                className="w-28 h-28 rounded-full border-4 border-slate-900"
                            />
                            <View className="absolute -bottom-2 -right-2 bg-yellow-500 w-10 h-10 rounded-full items-center justify-center border-4 border-slate-900">
                                <Text className="font-bold text-slate-900">1º</Text>
                            </View>
                        </View>
                        <Text className="text-white text-2xl font-bold mt-3">{data[0].player_name}</Text>
                        <Text className="text-slate-400 text-sm mb-1">{data[0].team_name}</Text>
                        <View className="bg-slate-800 px-4 py-1 rounded-full border border-slate-700 mt-2">
                            <Text className="text-emerald-400 font-bold">{data[0][key]} {label}</Text>
                        </View>
                    </View>
                )}

                {/* LISTA DOS DEMAIS */}
                <View className="bg-slate-900/50 rounded-3xl p-4">
                    {data.slice(1).map((item: any, index: number) => renderPlayerRow(item, index + 1, key, label))}
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-slate-950">
            <Stack.Screen
                options={{
                    title: 'Central de Estatísticas',
                    headerStyle: { backgroundColor: '#0f172a' },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: 'bold' },
                    headerRight: () => (
                        <TouchableOpacity onPress={() => { /* Navegar para exportação */ }}>
                            <Ionicons name="download-outline" size={24} color="#fff" />
                        </TouchableOpacity>
                    )
                }}
            />

            {/* FILTER TABS */}
            <View className="px-4 pt-4 pb-2">
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {[
                        { id: 'scorers', label: 'Artilharia', icon: 'football' },
                        { id: 'assists', label: 'Assistências', icon: 'people' },
                        { id: 'goalkeepers', label: 'Goleiros', icon: 'hand-left' }, // Mockado por enquanto
                        { id: 'cards', label: 'Disciplina', icon: 'card' },
                    ].map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            onPress={() => setActiveTab(tab.id as any)}
                            className={`mr-3 px-4 py-2 rounded-full flex-row items-center border ${activeTab === tab.id
                                    ? 'bg-emerald-600 border-emerald-500'
                                    : 'bg-slate-800 border-slate-700'
                                }`}
                        >
                            <Ionicons name={tab.icon as any} size={16} color={activeTab === tab.id ? '#fff' : '#94a3b8'} style={{ marginRight: 6 }} />
                            <Text className={`${activeTab === tab.id ? 'text-white font-bold' : 'text-slate-400'}`}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                className="flex-1 px-4"
                refreshControl={
                    <RefreshControl refreshing={loading} onRefresh={fetchStats} tintColor="#10b981" />
                }
            >
                {loading ? (
                    <View className="mt-20">
                        <ActivityIndicator size="large" color="#10b981" />
                        <Text className="text-center text-slate-500 mt-4">Calculando estatísticas...</Text>
                    </View>
                ) : (
                    renderContent()
                )}
            </ScrollView>
        </View>
    );
}

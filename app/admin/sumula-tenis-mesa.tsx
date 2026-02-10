import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../../src/services/api';

export default function TenisMesaSumulaScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // States
    const [loading, setLoading] = useState(true);
    const [matchData, setMatchData] = useState<any>(null);

    // Local Logic (Simulated for speed if API is slow)
    // Server logic in Table Tennis changes every 2 points.
    const [serverTeamId, setServerTeamId] = useState<number | null>(null);

    const fetchMatchDetails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/matches/${id}/full-details`);
            const data = response.data;
            setMatchData(data.match || data);

            // Set initial server if not set
            if (!serverTeamId && data.match?.home_team?.id) {
                setServerTeamId(data.match.home_team.id);
            }
        } catch (error) {
            Alert.alert('Erro', 'Falha ao carregar súmula.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchMatchDetails();
    }, [id, fetchMatchDetails]);

    const handleAddPoint = async (teamId: number) => {
        try {
            // Optimistic update logic for server swap (every 2 points)
            // But we'll rely on API for now to be safe.
            await api.post(`/admin/matches/${id}/events`, {
                type: 'point',
                team_id: teamId,
                points: 1
            });
            fetchMatchDetails();
        } catch (error) {
            Alert.alert('Erro', 'Falha ao marcar ponto');
        }
    };

    if (loading || !matchData) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
                <Text className="text-gray-500">Carregando Súmula...</Text>
            </SafeAreaView>
        );
    }

    const homeScore = matchData.home_score || 0;
    const awayScore = matchData.away_score || 0;
    const homeSets = matchData.sets_home || 0;
    const awaySets = matchData.sets_away || 0;

    return (
        <SafeAreaView className="flex-1 bg-blue-50">
            {/* HEADER */}
            <View className="bg-white p-4 border-b border-gray-200 shadow-sm">
                <View className="flex-row justify-between items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="font-bold text-gray-500 uppercase text-xs">
                        Tênis de Mesa • Set {matchData.current_set || 1}
                    </Text>
                    <View className="w-6" />
                </View>

                {/* PLACAR */}
                <View className="flex-row justify-between items-center px-2">
                    {/* HOME */}
                    <View className="items-center w-5/12">
                        <Text className="font-bold text-lg text-center leading-5 mb-2" numberOfLines={2}>
                            {matchData.home_team?.name || 'Jogador A'}
                        </Text>
                        <View className="bg-white border text-center items-center justify-center w-24 h-24 rounded-2xl shadow-sm border-gray-200 mb-2">
                            <Text className="text-6xl font-extrabold text-blue-900">
                                {homeScore}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <View className="bg-blue-100 px-2 py-1 rounded">
                                <Text className="text-blue-800 font-bold text-xs">{homeSets} SETS</Text>
                            </View>
                            {/* Server Indicator */}
                            {serverTeamId === matchData.home_team?.id && (
                                <View className="bg-yellow-400 w-6 h-6 rounded-full items-center justify-center shadow-sm">
                                    <MaterialCommunityIcons name="table-tennis" size={14} color="white" />
                                </View>
                            )}
                        </View>
                    </View>

                    {/* VS */}
                    <View className="items-center w-2/12">
                        <Text className="text-gray-300 font-bold text-xl">X</Text>
                    </View>

                    {/* AWAY */}
                    <View className="items-center w-5/12">
                        <Text className="font-bold text-lg text-center leading-5 mb-2" numberOfLines={2}>
                            {matchData.away_team?.name || 'Jogador B'}
                        </Text>
                        <View className="bg-white border text-center items-center justify-center w-24 h-24 rounded-2xl shadow-sm border-gray-200 mb-2">
                            <Text className="text-6xl font-extrabold text-red-900">
                                {awayScore}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-2">
                            <View className="bg-red-100 px-2 py-1 rounded">
                                <Text className="text-red-800 font-bold text-xs">{awaySets} SETS</Text>
                            </View>
                            {serverTeamId === matchData.away_team?.id && (
                                <View className="bg-yellow-400 w-6 h-6 rounded-full items-center justify-center shadow-sm">
                                    <MaterialCommunityIcons name="table-tennis" size={14} color="white" />
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* BIG BUTTONS */}
                <View className="flex-row gap-4 mb-8 mt-4">
                    <TouchableOpacity
                        onPress={() => handleAddPoint(matchData.home_team.id)}
                        className="flex-1 bg-blue-600 rounded-2xl p-6 items-center shadow-lg active:bg-blue-700 active:scale-95 transform transition"
                        style={{ elevation: 5 }}
                    >
                        <Text className="text-white font-bold text-4xl mb-1">+</Text>
                        <Text className="text-blue-100 font-medium text-xs uppercase">Ponto</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleAddPoint(matchData.away_team.id)}
                        className="flex-1 bg-red-600 rounded-2xl p-6 items-center shadow-lg active:bg-red-700 active:scale-95 transform transition"
                        style={{ elevation: 5 }}
                    >
                        <Text className="text-white font-bold text-4xl mb-1">+</Text>
                        <Text className="text-red-100 font-medium text-xs uppercase">Ponto</Text>
                    </TouchableOpacity>
                </View>

                {/* Undo Row */}
                <View className="flex-row justify-center gap-4 mb-8">
                    <TouchableOpacity className="bg-white border border-gray-200 px-6 py-3 rounded-full shadow-sm flex-row items-center">
                        <Ionicons name="arrow-undo" size={18} color="#666" />
                        <Text className="ml-2 font-bold text-gray-600">Corrigir (-1)</Text>
                    </TouchableOpacity>
                </View>

                {/* Match Status Controls */}
                <View className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <Text className="font-bold text-gray-700 mb-4 border-b border-gray-100 pb-2">Controle da Partida</Text>

                    <View className="flex-row gap-3 mb-3">
                        <TouchableOpacity className="bg-gray-100 flex-1 p-4 rounded-lg items-center">
                            <Ionicons name="time" size={24} color="#555" />
                            <Text className="text-xs font-bold text-gray-600 mt-1">Tempo Técnico</Text>
                        </TouchableOpacity>
                    </View>

                    <Text className="text-xs text-gray-400 text-center mt-2">
                        O saque alterna a cada 2 pontos. Em 10-10, alterna a cada ponto.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

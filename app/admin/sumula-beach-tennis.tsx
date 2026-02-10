import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { api } from '../../src/services/api';

export default function BeachTennisSumulaScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // States
    const [loading, setLoading] = useState(true);
    const [matchData, setMatchData] = useState<any>(null);

    // Mock logic for Tennis Score
    const getTennisScore = (points: number) => {
        if (points === 0) return '0';
        if (points === 1) return '15';
        if (points === 2) return '30';
        if (points === 3) return '40';
        if (points >= 4) return 'AD'; // Should be Game usually, but if advantage set
        return points;
    };

    const fetchMatchDetails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/matches/${id}/full-details`);
            const data = response.data;
            setMatchData(data.match || data);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao carregar súmula.');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchMatchDetails();
    }, [id, fetchMatchDetails]);

    const handleAddPoint = async (teamId: number) => {
        try {
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

    // Assumptions:
    // home_score = games in current set? Or points? 
    // Usually backend returns "points" as raw integer (0,1,2,3).
    // sets_home = sets won.
    // games_home = games won in current set.

    // We will assume backend provides this detail, or we map raw points if simple.
    // robust fallback:
    const homePointsRaw = matchData.current_game_points_home || 0;
    const awayPointsRaw = matchData.current_game_points_away || 0;

    const homeGames = matchData.home_score || 0; // assuming score field holds Games
    const awayGames = matchData.away_score || 0;

    const homeSets = matchData.sets_home || 0;
    const awaySets = matchData.sets_away || 0;

    return (
        <SafeAreaView className="flex-1 bg-yellow-50">
            {/* HEADER */}
            <View className="bg-white p-4 border-b border-gray-200 shadow-sm">
                <View className="flex-row justify-between items-center mb-2">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="font-bold text-gray-500 uppercase text-xs">
                        Beach Tennis • Set {matchData.current_set || 1}
                    </Text>
                    <View className="w-6" />
                </View>

                {/* PLACAR */}
                <View className="flex-row justify-between items-center px-4 py-2">
                    {/* HOME */}
                    <View className="items-center flex-1">
                        <Text className="font-bold text-lg text-center mb-1 text-gray-800" numberOfLines={1}>
                            {matchData.home_team?.name}
                        </Text>
                        <View className="flex-row items-end gap-2">
                            <Text className="text-6xl font-extrabold text-blue-900">
                                {getTennisScore(homePointsRaw)}
                            </Text>
                        </View>
                        <View className="flex-row mt-2 gap-2">
                            <View className="bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                <Text className="font-bold text-gray-600 text-xs">{homeGames} GAMES</Text>
                            </View>
                            <View className="bg-blue-100 px-2 py-1 rounded">
                                <Text className="font-bold text-blue-700 text-xs">{homeSets} SETS</Text>
                            </View>
                        </View>
                    </View>

                    {/* VS */}
                    <View className="items-center px-2">
                        <View className="h-12 w-px bg-gray-300 mx-2" />
                    </View>

                    {/* AWAY */}
                    <View className="items-center flex-1">
                        <Text className="font-bold text-lg text-center mb-1 text-gray-800" numberOfLines={1}>
                            {matchData.away_team?.name}
                        </Text>
                        <View className="flex-row items-end gap-2">
                            <Text className="text-6xl font-extrabold text-green-900">
                                {getTennisScore(awayPointsRaw)}
                            </Text>
                        </View>
                        <View className="flex-row mt-2 gap-2">
                            <View className="bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                <Text className="font-bold text-gray-600 text-xs">{awayGames} GAMES</Text>
                            </View>
                            <View className="bg-green-100 px-2 py-1 rounded">
                                <Text className="font-bold text-green-700 text-xs">{awaySets} SETS</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* BUTTONS */}
                <View className="flex-row gap-4 mb-6 mt-4">
                    <TouchableOpacity
                        onPress={() => handleAddPoint(matchData.home_team.id)}
                        className="flex-1 bg-blue-500 rounded-2xl p-6 items-center shadow-lg border-b-4 border-blue-700 active:translate-y-1 active:border-b-0"
                    >
                        <Text className="text-white font-bold text-lg mb-2">PONTO</Text>
                        <FontAwesome5 name="baseball-ball" size={32} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleAddPoint(matchData.away_team.id)}
                        className="flex-1 bg-green-500 rounded-2xl p-6 items-center shadow-lg border-b-4 border-green-700 active:translate-y-1 active:border-b-0"
                    >
                        <Text className="text-white font-bold text-lg mb-2">PONTO</Text>
                        <FontAwesome5 name="baseball-ball" size={32} color="white" />
                    </TouchableOpacity>
                </View>

                {/* GAME LOG */}
                <View className="bg-white rounded-xl p-4 shadow-sm">
                    <Text className="font-bold text-gray-700 mb-2">Histórico Resumido</Text>
                    <View className="bg-gray-50 p-3 rounded-lg">
                        <Text className="text-gray-500 text-xs text-center">Nenhum evento recente.</Text>
                    </View>
                </View>

                {/* INFO */}
                <Text className="text-center text-gray-400 text-xs mt-8">
                    Toque em PONTO para avançar (15 -> 30 -> 40 -> Game)
                </Text>
            </ScrollView>
        </SafeAreaView>
    );
}

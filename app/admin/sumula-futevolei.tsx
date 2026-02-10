import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';

export default function FutevoleiSumulaScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // States
    const [loading, setLoading] = useState(true);
    const [matchData, setMatchData] = useState<any>(null);

    // Modais e Estados de UI
    const [modalPointVisible, setModalPointVisible] = useState(false);
    const [selectedScoringTeam, setSelectedScoringTeam] = useState<number | null>(null);

    const fetchMatchDetails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/matches/${id}/full-details`);
            const data = response.data;
            setMatchData(data.match || data);
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

    const handleAddPoint = (teamId: number) => {
        setSelectedScoringTeam(teamId);
        setModalPointVisible(true);
    };

    const confirmPoint = async (type: string) => {
        if (!matchData) return;
        try {
            await api.post(`/admin/matches/${id}/events`, {
                type: 'point',
                description: type,
                team_id: selectedScoringTeam,
                points: 1
            });
            fetchMatchDetails(); // Refresh
            setModalPointVisible(false);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao registrar ponto.');
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
        <SafeAreaView className="flex-1 bg-yellow-50">
            {/* HEADER */}
            <View className="bg-white p-4 border-b border-gray-200 shadow-sm">
                <View className="flex-row justify-between items-center mb-2">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="font-bold text-gray-500 uppercase text-xs">
                        Futevôlei • Ao Vivo
                    </Text>
                    <View className="w-6" />
                </View>

                {/* PLACAR */}
                <View className="flex-row justify-between items-center px-2 mt-2">
                    <View className="items-center w-1/3">
                        <Text className="font-bold text-lg text-center leading-5" numberOfLines={2}>
                            {matchData.home_team?.name || 'Time A'}
                        </Text>
                        <Text className="text-5xl font-extrabold text-blue-900 my-2">
                            {homeScore}
                        </Text>
                        <View className="bg-blue-100 px-3 py-1 rounded-full">
                            <Text className="text-blue-800 font-bold text-xs">{homeSets} SETS</Text>
                        </View>
                    </View>

                    <View className="items-center">
                        <Text className="text-gray-400 font-bold text-xs mb-1">SET ATUAL</Text>
                        <View className="w-px h-10 bg-gray-300" />
                    </View>

                    <View className="items-center w-1/3">
                        <Text className="font-bold text-lg text-center leading-5" numberOfLines={2}>
                            {matchData.away_team?.name || 'Time B'}
                        </Text>
                        <Text className="text-5xl font-extrabold text-green-900 my-2">
                            {awayScore}
                        </Text>
                        <View className="bg-green-100 px-3 py-1 rounded-full">
                            <Text className="text-green-800 font-bold text-xs">{awaySets} SETS</Text>
                        </View>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* BIG BUTTONS */}
                <View className="flex-row gap-4 mb-6 mt-4">
                    <TouchableOpacity
                        onPress={() => handleAddPoint(matchData.home_team.id)}
                        className="flex-1 bg-blue-600 rounded-3xl p-8 items-center shadow-lg active:bg-blue-700 border-b-4 border-blue-800"
                    >
                        <Ionicons name="football" size={40} color="white" />
                        <Text className="text-white font-bold text-xl mt-2">PONTO</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleAddPoint(matchData.away_team.id)}
                        className="flex-1 bg-green-600 rounded-3xl p-8 items-center shadow-lg active:bg-green-700 border-b-4 border-green-800"
                    >
                        <Ionicons name="football" size={40} color="white" />
                        <Text className="text-white font-bold text-xl mt-2">PONTO</Text>
                    </TouchableOpacity>
                </View>

                {/* ACTIONS */}
                <View className="bg-white rounded-xl p-4 shadow-sm mb-6">
                    <Text className="font-bold text-gray-700 mb-4 ml-1">Ações de Jogo</Text>
                    <View className="flex-row flex-wrap gap-3">
                        <TouchableOpacity className="flex-row items-center bg-gray-100 px-4 py-3 rounded-lg flex-1 justify-center">
                            <Ionicons name="time-outline" size={20} color="#555" />
                            <Text className="font-bold text-gray-700 ml-2">Tempo</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-row items-center bg-gray-100 px-4 py-3 rounded-lg flex-1 justify-center">
                            <Ionicons name="swap-horizontal" size={20} color="#555" />
                            <Text className="font-bold text-gray-700 ml-2">Lados</Text>
                        </TouchableOpacity>
                        <TouchableOpacity className="flex-row items-center bg-red-50 px-4 py-3 rounded-lg flex-1 justify-center">
                            <Ionicons name="alert-circle-outline" size={20} color="#d32f2f" />
                            <Text className="font-bold text-red-700 ml-2">Anular</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* PLAYERS (2 v 2) */}
                <View className="bg-white rounded-xl p-4 shadow-sm pb-6">
                    <Text className="font-bold text-gray-700 mb-4 ml-1">Em Quadra (Duplas)</Text>
                    <View className="flex-row gap-4">
                        <View className="flex-1 bg-blue-50 p-3 rounded-lg">
                            <Text className="text-blue-900 font-bold mb-2 text-xs uppercase">{matchData.home_team?.name}</Text>
                            <PlayerRow name="Jogador 1" number="1" />
                            <PlayerRow name="Jogador 2" number="2" />
                        </View>
                        <View className="flex-1 bg-green-50 p-3 rounded-lg">
                            <Text className="text-green-900 font-bold mb-2 text-xs uppercase">{matchData.away_team?.name}</Text>
                            <PlayerRow name="Jogador A" number="10" />
                            <PlayerRow name="Jogador B" number="11" />
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* MODAL PONTO */}
            <Modal visible={modalPointVisible} animationType="fade" transparent={true}>
                <View className="flex-1 bg-black/60 items-center justify-center p-6">
                    <View className="bg-white w-full rounded-2xl p-6">
                        <Text className="text-xl font-bold text-center mb-6">Como foi o ponto?</Text>
                        <View className="flex-row flex-wrap gap-3 justify-center">
                            <PointButton label="Ataque" color="bg-orange-500" onPress={() => confirmPoint('Ataque')} />
                            <PointButton label="Bloqueio" color="bg-purple-500" onPress={() => confirmPoint('Bloqueio')} />
                            <PointButton label="Shark" color="bg-blue-500" onPress={() => confirmPoint('Shark Attack')} />
                            <PointButton label="Erro Adv." color="bg-gray-500" onPress={() => confirmPoint('Erro')} />
                        </View>
                        <TouchableOpacity onPress={() => setModalPointVisible(false)} className="mt-6 p-4 items-center">
                            <Text className="text-red-500 font-bold">Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const PlayerRow = ({ name, number }: any) => (
    <View className="flex-row items-center mb-2">
        <View className="w-6 h-6 rounded-full bg-white items-center justify-center border border-gray-200 mr-2">
            <Text className="text-xs font-bold text-gray-600">{number}</Text>
        </View>
        <Text className="text-gray-700 text-sm font-medium">{name}</Text>
    </View>
);

const PointButton = ({ label, color, onPress }: any) => (
    <TouchableOpacity onPress={onPress} className={`${color} w-[45%] p-4 rounded-xl items-center justify-center shadow-sm`}>
        <Text className="text-white font-bold">{label}</Text>
    </TouchableOpacity>
);

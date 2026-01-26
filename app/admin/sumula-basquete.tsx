import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { api } from '../../src/services/api';

export default function BasqueteSumulaScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // States
    const [loading, setLoading] = useState(true);
    const [matchData, setMatchData] = useState<any>(null);
    const [timerRunning, setTimerRunning] = useState(false);
    const [modalFoulVisible, setModalFoulVisible] = useState(false);
    const [selectedFoulTeam, setSelectedFoulTeam] = useState<number | null>(null);
    const [quarterTime, setQuarterTime] = useState(600); // 10 min em segundos (exemplo)

    // Load Data
    useEffect(() => {
        if (id) fetchMatchDetails();
    }, [id]);

    // Timer Logic
    useEffect(() => {
        let interval: any;
        if (timerRunning && quarterTime > 0) {
            interval = setInterval(() => {
                setQuarterTime(t => t - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerRunning, quarterTime]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const fetchMatchDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/matches/${id}/full-details`);
            const data = response.data;

            if (data.match) {
                const details = data.details || {};
                const scoreHome = parseInt(data.match.home_score);
                const scoreAway = parseInt(data.match.away_score);

                // Historico
                const history = (details.events || []).map((ev: any, idx: number) => ({
                    id: ev.id || idx,
                    type: ev.type,
                    team_id: parseInt(ev.team_id),
                    player: ev.player_name || 'Desconhecido',
                    score: '?' // Snapshot
                }));

                const fouls = { home: 0, away: 0 }; // TODO: Calcular do histórico se tiver eventos 'foul'

                setMatchData({
                    ...data.match,
                    home_team: data.match.home_team,
                    away_team: data.match.away_team,
                    total_score: { _custom: true, home: scoreHome, away: scoreAway }, // _custom flag
                    fouls_quarter: fouls,
                    current_quarter: 1, // Mock
                    history: history
                });
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Erro", "Falha ao carregar jogo");
        } finally {
            setLoading(false);
        }
    };

    const handleScore = async (teamId: number, points: number) => {
        if (!matchData) return;

        try {
            await api.post(`/admin/matches/${id}/events`, {
                type: `${points}pt`, // 2pt, 3pt
                team_id: teamId,
                points: points,
                minute: formatTime(quarterTime),
                period: matchData.current_quarter + 'º Quarto'
            });
            fetchMatchDetails();
        } catch (e) {
            console.error(e);
        }
    };

    const handleFoul = (teamId: number) => {
        setSelectedFoulTeam(teamId);
        setModalFoulVisible(true);
    };

    const confirmFoul = async (type: string) => {
        if (!selectedFoulTeam) return;

        try {
            await api.post(`/admin/matches/${id}/events`, {
                type: 'foul',
                description: type,
                team_id: selectedFoulTeam,
                minute: formatTime(quarterTime),
                period: matchData.current_quarter + 'º Quarto'
            });
            fetchMatchDetails(); // Recomputar faltas se tivesse logica no backend
            setModalFoulVisible(false);
        } catch (e) {
            console.error(e);
        }
    };

    if (loading || !matchData) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
                <Text className="text-white">Carregando Basquete...</Text>
            </SafeAreaView>
        );
    }

    const homeScore = matchData.total_score?.home || 0;
    const awayScore = matchData.total_score?.away || 0;
    const foulsHome = matchData.fouls_quarter?.home || 0;
    const foulsAway = matchData.fouls_quarter?.away || 0;

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* PLACAR ELETRÔNICO STYLE */}
            <View className="bg-black p-4 border-b border-gray-800">
                {/* TIMER & QUARTER */}
                <View className="items-center mb-6">
                    <Text className="text-red-600 font-mono text-5xl font-bold tracking-widest border-2 border-red-900/50 px-4 py-1 rounded bg-red-950/20">
                        {formatTime(quarterTime)}
                    </Text>
                    <View className="flex-row items-center mt-2 gap-4">
                        <Text className="text-yellow-500 font-bold text-xl">{matchData.current_quarter}º QUARTO</Text>
                        <TouchableOpacity
                            onPress={() => setTimerRunning(!timerRunning)}
                            className={`px-4 py-1 rounded ${timerRunning ? 'bg-red-600' : 'bg-green-600'}`}
                        >
                            <Text className="text-white font-bold">{timerRunning ? 'PARAR' : 'INICIAR'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="flex-row justify-between items-end">
                    {/* HOME */}
                    <View className="items-center w-5/12">
                        <Text className="text-white font-bold text-lg mb-1" numberOfLines={1}>{matchData.home_team.name}</Text>
                        <Text className="text-yellow-400 text-6xl font-mono font-bold">{homeScore}</Text>

                        {/* INDICADOR DE FALTAS */}
                        <View className="flex-row mt-2 gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <View key={i} className={`w-3 h-3 rounded-full ${i <= foulsHome ? 'bg-red-500' : 'bg-gray-700'}`} />
                            ))}
                        </View>
                        <Text className="text-gray-500 text-xs mt-1">FALTAS COLETIVAS</Text>
                    </View>

                    {/* VS */}
                    <View className="pb-8">
                        <Text className="text-gray-600 text-xl font-bold">VS</Text>
                    </View>

                    {/* AWAY */}
                    <View className="items-center w-5/12">
                        <Text className="text-white font-bold text-lg mb-1" numberOfLines={1}>{matchData.away_team.name}</Text>
                        <Text className="text-yellow-400 text-6xl font-mono font-bold">{awayScore}</Text>

                        {/* INDICADOR DE FALTAS */}
                        <View className="flex-row mt-2 gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <View key={i} className={`w-3 h-3 rounded-full ${i <= foulsAway ? 'bg-red-500' : 'bg-gray-700'}`} />
                            ))}
                        </View>
                        <Text className="text-gray-500 text-xs mt-1">FALTAS COLETIVAS</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 bg-gray-100 p-4">

                {/* AÇÕES DE JOGO - GRID */}
                <View className="flex-row gap-4 mb-6">
                    {/* COLUNA HOME */}
                    <View className="flex-1 gap-3">
                        <ScoreBtn points={1} color="bg-gray-200 text-gray-800" onPress={() => handleScore(matchData.home_team.id, 1)} />
                        <ScoreBtn points={2} color="bg-purple-600 text-white" onPress={() => handleScore(matchData.home_team.id, 2)} />
                        <ScoreBtn points={3} color="bg-purple-800 text-white" onPress={() => handleScore(matchData.home_team.id, 3)} />
                        <TouchableOpacity
                            onPress={() => handleFoul(matchData.home_team.id)}
                            className="bg-red-100 p-3 rounded-lg items-center mt-2 border border-red-200"
                        >
                            <Text className="text-red-700 font-bold">FALTA</Text>
                        </TouchableOpacity>
                    </View>

                    {/* COLUNA AWAY */}
                    <View className="flex-1 gap-3">
                        <ScoreBtn points={1} color="bg-gray-200 text-gray-800" onPress={() => handleScore(matchData.away_team.id, 1)} />
                        <ScoreBtn points={2} color="bg-green-600 text-white" onPress={() => handleScore(matchData.away_team.id, 2)} />
                        <ScoreBtn points={3} color="bg-green-800 text-white" onPress={() => handleScore(matchData.away_team.id, 3)} />
                        <TouchableOpacity
                            onPress={() => handleFoul(matchData.away_team.id)}
                            className="bg-red-100 p-3 rounded-lg items-center mt-2 border border-red-200"
                        >
                            <Text className="text-red-700 font-bold">FALTA</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* TIMELINE */}
                <Text className="font-bold text-gray-700 mb-2">Lance a lance</Text>
                {matchData.history.map((evt: any) => (
                    <View key={evt.id} className="bg-white p-3 rounded-lg border-b border-gray-100 flex-row justify-between mb-2">
                        <View>
                            <Text className="font-bold text-gray-800">{evt.type} - {evt.team_id == matchData.home_team.id ? matchData.home_team.name : matchData.away_team.name}</Text>
                            <Text className="text-xs text-gray-500">{evt.player}</Text>
                        </View>
                        <Text className="font-mono font-bold text-gray-600">{evt.score}</Text>
                    </View>
                ))}

            </ScrollView>

            {/* MODAL FALTA */}
            <Modal visible={modalFoulVisible} transparent animationType="fade">
                <View className="flex-1 bg-black/70 justify-center p-6">
                    <View className="bg-white rounded-xl p-6">
                        <Text className="text-xl font-bold text-center mb-4">Marcar Falta</Text>
                        <Text className="text-center text-gray-600 mb-6">Selecione o tipo de falta:</Text>

                        <View className="gap-3">
                            <TouchableOpacity onPress={() => confirmFoul('Pessoal')} className="bg-gray-100 p-4 rounded-lg"><Text className="text-center font-bold">Falta Pessoal (P)</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => confirmFoul('Tecnica')} className="bg-yellow-100 p-4 rounded-lg"><Text className="text-center font-bold text-yellow-800">Falta Técnica (T)</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => confirmFoul('Antidesportiva')} className="bg-red-100 p-4 rounded-lg"><Text className="text-center font-bold text-red-800">Falta Antidesportiva (U)</Text></TouchableOpacity>
                        </View>

                        <TouchableOpacity onPress={() => setModalFoulVisible(false)} className="mt-4 p-4">
                            <Text className="text-center text-red-500">Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const ScoreBtn = ({ points, color, onPress }: any) => (
    <TouchableOpacity onPress={onPress} className={`p-4 rounded-xl items-center justify-center shadow-sm ${color.split(' ')[0]}`}>
        <Text className={`font-bold text-2xl ${color.split(' ')[1]}`}>+{points}</Text>
    </TouchableOpacity>
);

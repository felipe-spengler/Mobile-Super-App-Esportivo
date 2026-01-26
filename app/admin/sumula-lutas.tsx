import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { api } from '../../src/services/api';

export default function LutasSumulaScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // States
    const [loading, setLoading] = useState(true);
    const [matchData, setMatchData] = useState<any>(null);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timeInSeconds, setTimeInSeconds] = useState(300); // 5 min regressivo

    // Config de Pontos Local (para UI instantânea)
    const [localStats, setLocalStats] = useState({
        a: { points: 0, adv: 0, pen: 0 },
        b: { points: 0, adv: 0, pen: 0 }
    });

    useEffect(() => {
        if (id) fetchMatchDetails();
    }, [id]);

    useEffect(() => {
        let interval: any;
        if (timerRunning && timeInSeconds > 0) {
            interval = setInterval(() => setTimeInSeconds(t => t - 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timerRunning, timeInSeconds]);

    const formatTime = (totalSeconds: number) => {
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const fetchMatchDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/matches/${id}/full-details`);
            const data = response.data;

            if (data.match) {
                // Calcular pontos acumulados do histórico
                const stats = {
                    a: { points: 0, adv: 0, pen: 0 },
                    b: { points: 0, adv: 0, pen: 0 }
                };

                (data.details?.events || []).forEach((ev: any) => {
                    const side = parseInt(ev.team_id) === data.match.home_team_id ? 'a' : 'b';
                    if (ev.type.includes('pt')) stats[side].points += parseInt(ev.type) || 0;
                    if (ev.type === 'point') stats[side].points += 1; // Default
                    if (ev.type === 'advantage') stats[side].adv += 1;
                    if (ev.type === 'penalty') stats[side].pen += 1;
                });

                setLocalStats(stats);
                setMatchData(data.match);
            }
        } catch (e) {
            Alert.alert('Erro', 'Falha ao carregar luta.');
        } finally {
            setLoading(false);
        }
    };

    const handleEvent = async (side: 'a' | 'b', type: string, value: number = 0) => {
        if (!matchData) return;
        const teamId = side === 'a' ? matchData.home_team_id : matchData.away_team_id;

        // Backend Type Mapping
        let apiType = type;
        if (type === 'point') apiType = `${value}pt`; // ex: 2pt, 3pt

        try {
            await api.post(`/admin/matches/${id}/events`, {
                type: apiType,
                team_id: teamId,
                points: value, // Para somar no placar geral se necessario
                minute: formatTime(timeInSeconds)
            });
            fetchMatchDetails();
        } catch (e) {
            console.error(e);
        }
    };

    // Configuração Dinâmica de Botões baseada na modalidade
    const getPointButtons = () => {
        // Se a modalidade fosse detectada via API... por enquanto Jiu-Jitsu default
        return [
            { label: 'Queda/Rasp (2)', value: 2 },
            { label: 'Passagem (3)', value: 3 },
            { label: 'Montada/Costas (4)', value: 4 },
        ];
    };

    if (loading || !matchData) {
        return (
            <SafeAreaView className="flex-1 bg-gray-900 justify-center items-center">
                <Text className="text-white">Carregando Luta...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-900">
            {/* HEADER DE COMBATE */}
            <View className="flex-row h-1/3 w-full">
                {/* LADO A (VERMELHO) */}
                <View className="flex-1 bg-red-700 items-center justify-center relative border-r-2 border-black">
                    <Text className="text-white font-bold text-lg text-center px-2">{matchData.home_team.name}</Text>
                    <Text className="text-white/70 text-xs mb-2">Fighter A</Text>
                    <Text className="text-8xl font-bold text-white shadow-lg">{localStats.a.points}</Text>

                    <View className="flex-row gap-4 mt-2">
                        <View className="items-center">
                            <Text className="text-white text-xs font-bold">VANT</Text>
                            <Text className="text-yellow-300 text-xl font-bold">{localStats.a.adv}</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-white text-xs font-bold">PUNI</Text>
                            <Text className="text-black text-xl font-bold">{localStats.a.pen}</Text>
                        </View>
                    </View>
                </View>

                {/* LADO B (AZUL) */}
                <View className="flex-1 bg-blue-700 items-center justify-center relative">
                    <Text className="text-white font-bold text-lg text-center px-2">{matchData.away_team.name}</Text>
                    <Text className="text-white/70 text-xs mb-2">Fighter B</Text>
                    <Text className="text-8xl font-bold text-white shadow-lg">{localStats.b.points}</Text>

                    <View className="flex-row gap-4 mt-2">
                        <View className="items-center">
                            <Text className="text-white text-xs font-bold">VANT</Text>
                            <Text className="text-yellow-300 text-xl font-bold">{localStats.b.adv}</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-white text-xs font-bold">PUNI</Text>
                            <Text className="text-black text-xl font-bold">{localStats.b.pen}</Text>
                        </View>
                    </View>
                </View>

                {/* TIMER OVERLAY (CENTRAL) */}
                <View className="absolute top-1/2 left-1/2 -ml-16 -mt-8 w-32 bg-black rounded-full border-4 border-gray-600 items-center py-2 z-10 shadow-2xl">
                    <Text className="text-white font-mono font-bold text-2xl">{formatTime(timeInSeconds)}</Text>
                    <TouchableOpacity onPress={() => setTimerRunning(!timerRunning)}>
                        <Ionicons name={timerRunning ? "pause" : "play"} color={timerRunning ? "red" : "lime"} size={20} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* CONTROLES */}
            <ScrollView className="flex-1 bg-gray-100 p-2">
                <View className="flex-row gap-2">
                    {/* CONTROLES VERMELHO */}
                    <View className="flex-1 gap-2 border-r border-gray-300 pr-2">
                        <Text className="text-red-700 font-bold text-center mb-1">Pontuar VERMELHO</Text>
                        {getPointButtons().map((btn, idx) => (
                            <TouchableOpacity key={idx} onPress={() => handleEvent('a', 'point', btn.value)} className="bg-red-100 border border-red-300 p-3 rounded items-center">
                                <Text className="text-red-800 font-bold">{btn.label}</Text>
                            </TouchableOpacity>
                        ))}
                        <View className="flex-row gap-2 mt-2">
                            <MiniBtn label="+Vant" color="bg-yellow-100 border-yellow-300" onPress={() => handleEvent('a', 'advantage')} />
                            <MiniBtn label="+Puni" color="bg-gray-300 border-gray-400" onPress={() => handleEvent('a', 'penalty')} />
                        </View>
                    </View>

                    {/* CONTROLES AZUL */}
                    <View className="flex-1 gap-2 pl-2">
                        <Text className="text-blue-700 font-bold text-center mb-1">Pontuar AZUL</Text>
                        {getPointButtons().map((btn, idx) => (
                            <TouchableOpacity key={idx} onPress={() => handleEvent('b', 'point', btn.value)} className="bg-blue-100 border border-blue-300 p-3 rounded items-center">
                                <Text className="text-blue-800 font-bold">{btn.label}</Text>
                            </TouchableOpacity>
                        ))}
                        <View className="flex-row gap-2 mt-2">
                            <MiniBtn label="+Vant" color="bg-yellow-100 border-yellow-300" onPress={() => handleEvent('b', 'advantage')} />
                            <MiniBtn label="+Puni" color="bg-gray-300 border-gray-400" onPress={() => handleEvent('b', 'penalty')} />
                        </View>
                    </View>
                </View>

                {/* FINALIZAR */}
                <TouchableOpacity className="bg-black mx-4 mt-8 p-4 rounded-xl items-center" onPress={() => Alert.alert('Finalizar', 'Confirmar vitória por finalização?', [{ text: 'Cancel' }, { text: 'Confirmar' }])}>
                    <Text className="text-white font-bold text-lg">ENCERRAR LUTA (SUBMISSION)</Text>
                </TouchableOpacity>

            </ScrollView>
        </SafeAreaView>
    );
}

const MiniBtn = ({ label, color, onPress }: any) => (
    <TouchableOpacity onPress={onPress} className={`flex-1 ${color} p-2 rounded items-center border`}>
        <Text className="font-bold text-xs">{label}</Text>
    </TouchableOpacity>
);

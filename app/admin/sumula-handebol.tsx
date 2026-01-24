import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

// API Configuration
const API_URL = 'http://localhost:8000/api';

export default function HandebolSumulaScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // States
    const [loading, setLoading] = useState(true);
    const [matchData, setMatchData] = useState<any>(null);
    const [timerRunning, setTimerRunning] = useState(false);
    const [timeInSeconds, setTimeInSeconds] = useState(0);

    // Load Data
    useEffect(() => {
        if (id) fetchMatchDetails();
    }, [id]);

    // Timer Logic
    useEffect(() => {
        let interval: any;
        if (timerRunning) {
            interval = setInterval(() => setTimeInSeconds(t => t + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [timerRunning]);

    const formatTime = (totalSeconds: number) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const fetchMatchDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/admin/matches/${id}/full-details`);
            const data = await response.json();

            if (data.match) {
                const details = data.details || {};

                // Calculando suspensões localmente baseadas no histórico
                const suspensions = { home: 0, away: 0 };
                (details.events || []).forEach((ev: any) => {
                    if (ev.type === 'suspension_2min') {
                        if (ev.team_id == data.match.home_team_id) suspensions.home++;
                        else suspensions.away++;
                    }
                });

                setMatchData({
                    ...data.match,
                    score: { home: parseInt(data.match.home_score), away: parseInt(data.match.away_score) },
                    suspensions: suspensions
                });
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Erro', 'Falha ao carregar jogo.');
        } finally {
            setLoading(false);
        }
    };

    const handleEvent = async (type: string, teamId: number) => {
        if (!matchData) return;

        try {
            await fetch(`${API_URL}/admin/matches/${id}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: type, // goal, suspension_2min, yellow_card
                    team_id: teamId,
                    minute: formatTime(timeInSeconds),
                    period: '1º Tempo' // TODO: Period logic
                })
            });
            fetchMatchDetails();
        } catch (e) {
            console.error(e);
            Alert.alert('Erro', 'Falha ao enviar evento.');
        }
    };

    if (loading || !matchData) {
        return (
            <SafeAreaView className="flex-1 bg-slate-50 justify-center items-center">
                <Text className="text-blue-900">Carregando Handebol...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-slate-50">
            {/* PLACAR HANDEBOL */}
            <View className="bg-blue-900 p-4 pb-6 rounded-b-3xl shadow-lg">
                <View className="flex-row justify-between items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" color="white" size={24} />
                    </TouchableOpacity>
                    <View className="bg-black/40 px-3 py-1 rounded-full border border-white/20">
                        <Text className="text-white font-bold">1º Tempo</Text>
                    </View>
                    <TouchableOpacity onPress={() => setTimerRunning(!timerRunning)}>
                        <Ionicons name={timerRunning ? "pause" : "play"} color="white" size={24} />
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-between items-center px-2">
                    <TeamScore name={matchData.home_team.name} score={matchData.score.home} />

                    <View className="items-center justify-center">
                        <Text className="text-4xl font-mono text-yellow-400 font-bold tracking-widest bg-black/50 px-2 rounded">
                            {formatTime(timeInSeconds)}
                        </Text>
                    </View>

                    <TeamScore name={matchData.away_team.name} score={matchData.score.away} align="right" />
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* AÇÕES RÁPIDAS */}
                <View className="flex-row gap-4 mb-6">
                    <ActionCard
                        team={matchData.home_team.name}
                        color="bg-blue-600"
                        onGoal={() => handleEvent('goal', matchData.home_team_id)}
                        onSuspension={() => handleEvent('suspension_2min', matchData.home_team_id)}
                        onYellow={() => handleEvent('yellow_card', matchData.home_team_id)}
                        suspCount={matchData.suspensions.home}
                    />
                    <ActionCard
                        team={matchData.away_team.name}
                        color="bg-red-600"
                        onGoal={() => handleEvent('goal', matchData.away_team_id)}
                        onSuspension={() => handleEvent('suspension_2min', matchData.away_team_id)}
                        onYellow={() => handleEvent('yellow_card', matchData.away_team_id)}
                        suspCount={matchData.suspensions.away}
                    />
                </View>

                {/* TIMELINE SIMPLES */}
                <Text className="font-bold text-gray-700 mb-2 ml-1">Histórico de Jogo</Text>
                {(!matchData.match_details?.events || matchData.match_details.events.length === 0) && (
                    <View className="bg-white p-4 rounded-xl shadow-sm">
                        <Text className="text-center text-gray-400 italic">Nenhum evento registrado ainda.</Text>
                    </View>
                )}
                {/* Lista de eventos renderizada aqui se necessário */}
            </ScrollView>
        </SafeAreaView>
    );
}

const TeamScore = ({ name, score, align = 'left' }: any) => (
    <View className={`w-1/3 ${align === 'right' ? 'items-end' : 'items-start'}`}>
        <Text className="text-white font-bold text-sm mb-1" numberOfLines={1}>{name}</Text>
        <Text className="text-5xl font-bold text-white shadow-sm">{score}</Text>
    </View>
);

const ActionCard = ({ team, color, onGoal, onSuspension, onYellow, suspCount }: any) => (
    <View className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <Text className="font-bold text-gray-800 mb-4 text-center h-10" numberOfLines={2}>{team}</Text>

        <TouchableOpacity onPress={onGoal} className={`${color} py-4 rounded-lg mb-3 items-center shadow-md active:opacity-90`}>
            <Text className="text-white font-bold text-xl">GOL</Text>
        </TouchableOpacity>

        <View className="flex-row gap-2">
            <TouchableOpacity onPress={onYellow} className="flex-1 bg-yellow-400 py-2 rounded items-center">
                <Text className="text-yellow-900 font-bold text-xs">🟨</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onSuspension} className="flex-1 bg-gray-200 py-2 rounded items-center relative">
                <Text className="text-gray-700 font-bold text-xs">2'</Text>
                {suspCount > 0 && <View className="absolute -top-2 -right-2 bg-red-500 w-5 h-5 rounded-full items-center justify-center"><Text className="text-white text-[10px] font-bold">{suspCount}</Text></View>}
            </TouchableOpacity>
        </View>
    </View>
);

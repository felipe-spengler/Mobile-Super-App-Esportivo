import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Modal, FlatList } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import '../../global.css';

import { api } from '../../src/services/api';

interface Player {
    id: number;
    name: string;
    number: number;
}

interface Event {
    id: number;
    type: string;
    team: 'home' | 'away';
    time: string;
    player_name?: string;
    is_own_goal?: boolean;
}

export default function SumulaDigitalScreen() {
    const router = useRouter();
    const { gameId } = useLocalSearchParams();

    // Game State
    const [loading, setLoading] = useState(true);
    const [matchData, setMatchData] = useState<any>(null);
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [rosters, setRosters] = useState<{ home: Player[], away: Player[] }>({ home: [], away: [] });

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<'home' | 'away' | null>(null);
    const [eventType, setEventType] = useState<'goal' | 'yellow' | 'red' | null>(null);
    const [isOwnGoal, setIsOwnGoal] = useState(false);

    useEffect(() => {
        if (gameId) fetchMatchDetails();
    }, [gameId]);

    // Timer Logic 
    useEffect(() => {
        let interval: any = null;
        if (isRunning) {
            interval = setInterval(() => setTime(t => t + 1), 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const fetchMatchDetails = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/matches/${gameId}/full-details`);
            const data = response.data;
            if (data.match) {
                // Parse history
                const history = (data.details?.events || []).map((e: any) => ({
                    id: e.id,
                    type: e.type === 'yellow_card' ? 'yellow' : e.type === 'red_card' ? 'red' : e.type,
                    team: parseInt(e.team_id) === data.match.home_team_id ? 'home' : 'away',
                    time: e.minute,
                    period: e.period,
                    player_name: e.player_name,
                    is_own_goal: e.metadata?.own_goal
                }));

                setMatchData({
                    ...data.match,
                    history: history,
                    // Converte score para sets ou gols dependendo do backend, mas aqui esperamos gols
                    scoreHome: parseInt(data.match.home_score),
                    scoreAway: parseInt(data.match.away_score)
                });
                if (data.rosters) {
                    setRosters(data.rosters);
                }
            }
        } catch (e) {
            console.error(e);
            Alert.alert('Erro', 'Falha ao carregar jogo.');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const openEventModal = (type: 'goal' | 'yellow' | 'red', team: 'home' | 'away') => {
        if (!isRunning) {
            Alert.alert('Atenção', 'Inicie o cronômetro para registrar eventos.');
            return;
        }
        setEventType(type);
        setSelectedTeam(team);
        setIsOwnGoal(false);
        setModalVisible(true);
    };

    const confirmEvent = async (player: Player | null) => {
        if (!matchData || !selectedTeam || !eventType) return;

        const teamId = selectedTeam === 'home' ? matchData.home_team_id : matchData.away_team_id;
        // Map simple types to API types
        const apiEventType = eventType === 'goal' ? 'goal' : (eventType === 'yellow' ? 'yellow_card' : 'red_card');
        const currentTime = formatTime(time);

        try {
            // Call API
            const response = await api.post(`/admin/matches/${gameId}/events`, {
                event_type: apiEventType,
                team_id: teamId,
                minute: currentTime,
                period: '1º Tempo', // TODO: Implement Period Logic similar to Web
                player_id: player ? player.id : null,
                metadata: isOwnGoal ? { own_goal: true } : null
            });

            // Optimistic Update
            // Logic for score update
            let homeInc = 0;
            let awayInc = 0;

            if (eventType === 'goal') {
                if (isOwnGoal) {
                    // Own Goal: selectedTeam (who did it) gives point to Opponent
                    if (selectedTeam === 'home') awayInc = 1;
                    else homeInc = 1;
                } else {
                    if (selectedTeam === 'home') homeInc = 1;
                    else awayInc = 1;
                }
            }

            const newEvent: Event = {
                id: response.data.id || Date.now(),
                type: eventType,
                team: selectedTeam,
                time: currentTime,
                player_name: player ? (isOwnGoal ? `${player.name} (Gol Contra)` : player.name) : (isOwnGoal ? 'Gol Contra' : undefined),
                is_own_goal: isOwnGoal
            };

            setMatchData((prev: any) => ({
                ...prev,
                history: [newEvent, ...prev.history],
                scoreHome: (prev.scoreHome || 0) + homeInc,
                scoreAway: (prev.scoreAway || 0) + awayInc
            }));

            setModalVisible(false);

        } catch (e) {
            console.error(e);
            Alert.alert('Erro', 'Falha ao registrar evento.');
        }
    };

    const handleFinish = () => {
        Alert.alert('Encerrar Jogo', 'Confirmar resultado final?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Confirmar',
                onPress: () => {
                    // Usually call an API to finish
                    api.post(`/admin/matches/${gameId}/finish`, {
                        home_score: matchData.scoreHome,
                        away_score: matchData.scoreAway
                    }).then(() => {
                        router.back();
                        Alert.alert('Sucesso', 'Súmula enviada!');
                    }).catch(() => {
                        Alert.alert('Erro', 'Falha ao finalizar.');
                    });
                }
            }
        ]);
    };

    if (loading || !matchData) {
        return <View className="flex-1 bg-gray-900 justify-center items-center"><Text className="text-white">Carregando...</Text></View>;
    }

    const scoreHome = matchData.scoreHome || 0;
    const scoreAway = matchData.scoreAway || 0;
    const period = 1;
    const events = matchData.history || [];
    const homeName = matchData.home_team?.name || 'Casa';
    const awayName = matchData.away_team?.name || 'Visitante';

    // Get roster for modal
    const currentRoster = selectedTeam === 'home' ? rosters.home : rosters.away;

    return (
        <View className="flex-1 bg-gray-900">
            {/* Placar Header */}
            <View className="pt-12 pb-6 px-4 bg-gray-900 border-b border-gray-800">
                <View className="flex-row justify-between items-center mb-6">
                    <TouchableOpacity onPress={() => router.back()}>
                        <FontAwesome5 name="arrow-left" size={20} color="white" />
                    </TouchableOpacity>
                    <Text className="text-gray-400 font-bold tracking-widest text-xs">SUMULA DIGITAL</Text>
                    <TouchableOpacity onPress={() => Alert.alert('Menu', 'Opções')}>
                        <FontAwesome5 name="ellipsis-v" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Score Board */}
                <View className="flex-row items-center justify-between px-2">
                    <View className="items-center w-1/3">
                        <Text className="text-white font-bold text-lg mb-2 text-center" numberOfLines={1}>{homeName}</Text>
                        <Text className="text-6xl font-black text-white">{scoreHome}</Text>
                    </View>

                    <View className="items-center w-1/3">
                        <Text className={`text-4xl font-mono mb-2 ${isRunning ? 'text-green-400' : 'text-gray-500'}`}>
                            {formatTime(time)}
                        </Text>
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-4">{period}º Tempo</Text>

                        <TouchableOpacity
                            onPress={() => setIsRunning(!isRunning)}
                            className={`w-14 h-14 rounded-full items-center justify-center ${isRunning ? 'bg-yellow-500' : 'bg-green-600'}`}
                        >
                            <FontAwesome5 name={isRunning ? "pause" : "play"} size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View className="items-center w-1/3">
                        <Text className="text-white font-bold text-lg mb-2 text-center" numberOfLines={1}>{awayName}</Text>
                        <Text className="text-6xl font-black text-white">{scoreAway}</Text>
                    </View>
                </View>
            </View>

            {/* Controls */}
            <View className="flex-1 bg-gray-100 rounded-t-[30px] p-6">
                <View className="flex-row justify-between mb-8">
                    {/* Home Controls */}
                    <View className="flex-1 mr-2 gap-3">
                        <TouchableOpacity
                            onPress={() => openEventModal('goal', 'home')}
                            className="bg-white p-4 rounded-xl items-center shadow-sm border-l-4 border-blue-600 flex-row justify-center gap-2"
                        >
                            <FontAwesome5 name="futbol" size={20} color="#2563eb" />
                            <Text className="font-bold text-gray-800">GOL</Text>
                        </TouchableOpacity>
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => openEventModal('yellow', 'home')}
                                className="flex-1 bg-yellow-100 p-3 rounded-xl items-center border border-yellow-200"
                            >
                                <View className="w-4 h-6 bg-yellow-400 rounded-sm mb-1" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => openEventModal('red', 'home')}
                                className="flex-1 bg-red-100 p-3 rounded-xl items-center border border-red-200"
                            >
                                <View className="w-4 h-6 bg-red-500 rounded-sm mb-1" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Away Controls */}
                    <View className="flex-1 ml-2 gap-3">
                        <TouchableOpacity
                            onPress={() => openEventModal('goal', 'away')}
                            className="bg-white p-4 rounded-xl items-center shadow-sm border-r-4 border-red-600 flex-row justify-center gap-2"
                        >
                            <Text className="font-bold text-gray-800">GOL</Text>
                            <FontAwesome5 name="futbol" size={20} color="#dc2626" />
                        </TouchableOpacity>
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => openEventModal('yellow', 'away')}
                                className="flex-1 bg-yellow-100 p-3 rounded-xl items-center border border-yellow-200"
                            >
                                <View className="w-4 h-6 bg-yellow-400 rounded-sm mb-1" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => openEventModal('red', 'away')}
                                className="flex-1 bg-red-100 p-3 rounded-xl items-center border border-red-200"
                            >
                                <View className="w-4 h-6 bg-red-500 rounded-sm mb-1" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Timeline Feed */}
                <Text className="text-gray-500 font-bold mb-3 uppercase text-xs tracking-wider">Linha do Tempo</Text>
                <ScrollView className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    {events.length === 0 && <Text className="text-center text-gray-400 mt-4">Jogo iniciado. Aguardando eventos...</Text>}

                    {events.map((ev: Event) => (
                        <View key={ev.id} className="flex-row items-center mb-3 border-b border-gray-50 pb-2 last:border-0">
                            <Text className="text-gray-400 font-mono text-xs w-12">{ev.time}</Text>
                            <View className="flex-1 flex-row items-center">
                                {ev.type === 'goal' && <FontAwesome5 name="futbol" size={14} color="#333" className="mr-2" />}
                                {ev.type === 'yellow' && <View className="w-3 h-4 bg-yellow-400 rounded-sm mr-2" />}
                                {ev.type === 'red' && <View className="w-3 h-4 bg-red-500 rounded-sm mr-2" />}

                                <Text className="font-bold text-gray-800 text-sm">
                                    {ev.type === 'goal' ? 'GOL!' : 'Cartão'} ({ev.team === 'home' ? 'Casa' : 'Visitante'})
                                </Text>
                            </View>
                            {ev.player_name && (
                                <Text className="text-xs text-gray-500">{ev.player_name}</Text>
                            )}
                        </View>
                    ))}
                </ScrollView>

                {/* Footer Action */}
                <TouchableOpacity onPress={handleFinish} className="bg-gray-900 mt-4 p-4 rounded-xl items-center">
                    <Text className="text-white font-bold uppercase tracking-widest">Encerrar Partida</Text>
                </TouchableOpacity>
            </View>

            {/* Event Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-gray-100 rounded-t-3xl min-h-[50%] p-6">
                        <View className="flex-row justify-between items-center mb-4">
                            <Text className="text-xl font-bold text-gray-800">
                                {eventType === 'goal' ? 'GOL - Selecione o Jogador' : 'Cartão - Selecione o Jogador'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-gray-200 rounded-full">
                                <MaterialIcons name="close" size={24} color="#333" />
                            </TouchableOpacity>
                        </View>

                        {eventType === 'goal' && (
                            <View className="flex-row mb-4 bg-white p-2 rounded-xl shadow-sm">
                                <TouchableOpacity
                                    onPress={() => setIsOwnGoal(!isOwnGoal)}
                                    className={`flex-1 p-3 rounded-lg flex-row justify-center items-center gap-2 border ${isOwnGoal ? 'bg-red-50 border-red-500' : 'bg-gray-50 border-gray-200'}`}
                                >
                                    <View className={`w-5 h-5 rounded border flex items-center justify-center ${isOwnGoal ? 'bg-red-500 border-red-500' : 'border-gray-400'}`}>
                                        {isOwnGoal && <MaterialIcons name="check" size={14} color="white" />}
                                    </View>
                                    <Text className={`font-bold ${isOwnGoal ? 'text-red-600' : 'text-gray-600'}`}>GOL CONTRA {isOwnGoal ? '(Ativado)' : ''}</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        <FlatList
                            data={currentRoster}
                            keyExtractor={(item) => item.id.toString()}
                            ListHeaderComponent={() => (
                                <TouchableOpacity
                                    onPress={() => confirmEvent(null)}
                                    className="bg-white p-4 rounded-xl mb-2 flex-row items-center gap-3 border border-gray-200"
                                >
                                    <View className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                        <FontAwesome5 name="user" size={16} color="#666" />
                                    </View>
                                    <Text className="font-bold text-gray-700">Sem Jogador Específico</Text>
                                </TouchableOpacity>
                            )}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => confirmEvent(item)}
                                    className="bg-white p-4 rounded-xl mb-2 flex-row items-center gap-3 border border-gray-200"
                                >
                                    <View className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                                        <Text>{item.number}</Text>
                                    </View>
                                    <Text className="font-bold text-gray-800 text-lg">{item.name}</Text>
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text className="text-center text-gray-500 py-4">Nenhum jogador na escalação.</Text>}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}
const router = useRouter();
const { gameId } = useLocalSearchParams();

// Game State
const [loading, setLoading] = useState(true);
const [matchData, setMatchData] = useState<any>(null);
const [time, setTime] = useState(0);
const [isRunning, setIsRunning] = useState(false);

useEffect(() => {
    if (gameId) fetchMatchDetails();
}, [gameId]);

// Timer Logic 
useEffect(() => {
    let interval: any = null;
    if (isRunning) {
        interval = setInterval(() => setTime(t => t + 1), 1000);
    } else {
        clearInterval(interval);
    }
    return () => clearInterval(interval);
}, [isRunning]);

const fetchMatchDetails = async () => {
    try {
        setLoading(true);
        const response = await api.get(`/admin/matches/${gameId}/full-details`);
        const data = response.data;
        if (data.match) {
            // Parse history
            const history = (data.details?.events || []).map((e: any) => ({
                id: e.id,
                type: e.type,
                team: parseInt(e.team_id) === data.match.home_team_id ? 'home' : 'away',
                time: e.minute,
                period: e.period
            }));

            setMatchData({
                ...data.match,
                history: history,
                // Converte score para sets ou gols dependendo do backend, mas aqui esperamos gols
                scoreHome: parseInt(data.match.home_score),
                scoreAway: parseInt(data.match.away_score)
            });
        }
    } catch (e) {
        console.error(e);
        Alert.alert('Erro', 'Falha ao carregar jogo.');
    } finally {
        setLoading(false);
    }
};

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const addEvent = async (type: 'goal' | 'yellow' | 'red', team: 'home' | 'away') => {
    if (!matchData) return;

    const teamId = team === 'home' ? matchData.home_team_id : matchData.away_team_id;
    const eventType = type === 'goal' ? 'goal' : (type === 'yellow' ? 'yellow_card' : 'red_card');

    try {
        // Optimistic Update
        const newEvent = {
            id: Date.now(),
            type: eventType,
            team,
            time: formatTime(time),
            period: 1 // TODO: Logic for periods
        };

        // Call API
        await api.post(`/admin/matches/${gameId}/events`, {
            type: eventType,
            team_id: teamId,
            minute: formatTime(time),
            period: '1º Tempo'
        });

        // Reload Data
        fetchMatchDetails();

    } catch (e) {
        Alert.alert('Erro', 'Falha ao registrar evento.');
    }
};

const handleFinish = () => {
    Alert.alert('Encerrar Jogo', 'Confirmar resultado final?', [
        { text: 'Cancelar', style: 'cancel' },
        {
            text: 'Confirmar',
            onPress: () => {
                router.back();
                Alert.alert('Sucesso', 'Súmula enviada!');
            }
        }
    ]);
};

if (loading || !matchData) {
    return <View className="flex-1 bg-gray-900 justify-center items-center"><Text className="text-white">Carregando...</Text></View>;
}

const scoreHome = matchData.scoreHome || 0;
const scoreAway = matchData.scoreAway || 0;
const period = 1;
const events = matchData.history || [];
const homeName = matchData.home_team?.name || 'Casa';
const awayName = matchData.away_team?.name || 'Visitante';

return (
    <View className="flex-1 bg-gray-900">
        {/* Placar Header */}
        <View className="pt-12 pb-6 px-4 bg-gray-900 border-b border-gray-800">
            <View className="flex-row justify-between items-center mb-6">
                <TouchableOpacity onPress={() => router.back()}>
                    <FontAwesome5 name="arrow-left" size={20} color="white" />
                </TouchableOpacity>
                <Text className="text-gray-400 font-bold tracking-widest text-xs">SUMULA DIGITAL</Text>
                <TouchableOpacity onPress={() => Alert.alert('Menu', 'Opções')}>
                    <FontAwesome5 name="ellipsis-v" size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Score Board */}
            <View className="flex-row items-center justify-between px-2">
                <View className="items-center w-1/3">
                    <Text className="text-white font-bold text-lg mb-2 text-center" numberOfLines={1}>{homeName}</Text>
                    <Text className="text-6xl font-black text-white">{scoreHome}</Text>
                </View>

                <View className="items-center w-1/3">
                    <Text className={`text-4xl font-mono mb-2 ${isRunning ? 'text-green-400' : 'text-gray-500'}`}>
                        {formatTime(time)}
                    </Text>
                    <Text className="text-gray-400 text-xs font-bold uppercase mb-4">{period}º Tempo</Text>

                    <TouchableOpacity
                        onPress={() => setIsRunning(!isRunning)}
                        className={`w-14 h-14 rounded-full items-center justify-center ${isRunning ? 'bg-yellow-500' : 'bg-green-600'}`}
                    >
                        <FontAwesome5 name={isRunning ? "pause" : "play"} size={20} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="items-center w-1/3">
                    <Text className="text-white font-bold text-lg mb-2 text-center" numberOfLines={1}>{awayName}</Text>
                    <Text className="text-6xl font-black text-white">{scoreAway}</Text>
                </View>
            </View>
        </View>

        {/* Controls */}
        <View className="flex-1 bg-gray-100 rounded-t-[30px] p-6">
            <View className="flex-row justify-between mb-8">
                {/* Home Controls */}
                <View className="flex-1 mr-2 gap-3">
                    <TouchableOpacity
                        onPress={() => addEvent('goal', 'home')}
                        className="bg-white p-4 rounded-xl items-center shadow-sm border-l-4 border-blue-600 flex-row justify-center gap-2"
                    >
                        <FontAwesome5 name="futbol" size={20} color="#2563eb" />
                        <Text className="font-bold text-gray-800">GOL</Text>
                    </TouchableOpacity>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => addEvent('yellow', 'home')}
                            className="flex-1 bg-yellow-100 p-3 rounded-xl items-center border border-yellow-200"
                        >
                            <View className="w-4 h-6 bg-yellow-400 rounded-sm mb-1" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => addEvent('red', 'home')}
                            className="flex-1 bg-red-100 p-3 rounded-xl items-center border border-red-200"
                        >
                            <View className="w-4 h-6 bg-red-500 rounded-sm mb-1" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Away Controls */}
                <View className="flex-1 ml-2 gap-3">
                    <TouchableOpacity
                        onPress={() => addEvent('goal', 'away')}
                        className="bg-white p-4 rounded-xl items-center shadow-sm border-r-4 border-red-600 flex-row justify-center gap-2"
                    >
                        <Text className="font-bold text-gray-800">GOL</Text>
                        <FontAwesome5 name="futbol" size={20} color="#dc2626" />
                    </TouchableOpacity>
                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => addEvent('yellow', 'away')}
                            className="flex-1 bg-yellow-100 p-3 rounded-xl items-center border border-yellow-200"
                        >
                            <View className="w-4 h-6 bg-yellow-400 rounded-sm mb-1" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => addEvent('red', 'away')}
                            className="flex-1 bg-red-100 p-3 rounded-xl items-center border border-red-200"
                        >
                            <View className="w-4 h-6 bg-red-500 rounded-sm mb-1" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            {/* Timeline Feed */}
            <Text className="text-gray-500 font-bold mb-3 uppercase text-xs tracking-wider">Linha do Tempo</Text>
            <ScrollView className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                {events.length === 0 && <Text className="text-center text-gray-400 mt-4">Jogo iniciado. Aguardando eventos...</Text>}

                {events.map(ev => (
                    <View key={ev.id} className="flex-row items-center mb-3 border-b border-gray-50 pb-2 last:border-0">
                        <Text className="text-gray-400 font-mono text-xs w-12">{ev.time}</Text>
                        <View className="flex-1 flex-row items-center">
                            {ev.type === 'goal' && <FontAwesome5 name="futbol" size={14} color="#333" className="mr-2" />}
                            {ev.type === 'yellow' && <View className="w-3 h-4 bg-yellow-400 rounded-sm mr-2" />}
                            {ev.type === 'red' && <View className="w-3 h-4 bg-red-500 rounded-sm mr-2" />}

                            <Text className="font-bold text-gray-800 text-sm">
                                {ev.type === 'goal' ? 'GOL!' : 'Cartão'} ({ev.team === 'home' ? 'Casa' : 'Visitante'})
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>

            {/* Footer Action */}
            <TouchableOpacity onPress={handleFinish} className="bg-gray-900 mt-4 p-4 rounded-xl items-center">
                <Text className="text-white font-bold uppercase tracking-widest">Encerrar Partida</Text>
            </TouchableOpacity>

        </View>
    </View>
);
}

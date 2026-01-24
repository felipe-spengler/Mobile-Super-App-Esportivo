import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../src/services/api';


export default function VoleiSumulaScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    // States
    const [loading, setLoading] = useState(true);
    const [matchData, setMatchData] = useState<any>(null); // Tipagem any por enquanto
    const [rotationHome, setRotationHome] = useState<any[]>([]);
    const [rotationAway, setRotationAway] = useState<any[]>([]);

    // Modais e Estados de UI
    const [modalRotationVisible, setModalRotationVisible] = useState(false);
    const [modalPointVisible, setModalPointVisible] = useState(false);
    const [selectedScoringTeam, setSelectedScoringTeam] = useState<number | null>(null);

    const [selectedPos, setSelectedPos] = useState<{ pos: number, isHome: boolean } | null>(null);

    const fetchMatchDetails = useCallback(async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/matches/${id}/full-details`);
            const data = response.data;

            if (data.match) {
                // Adaptar resposta da API para o estado local
                const details = data.details || {};
                const currentSetScore = details.current_set_score || { home: 0, away: 0 };

                // Mapeia histórico de eventos
                const history = (details.events || []).map((ev: any, idx: number) => ({
                    id: ev.id || idx,
                    type: ev.type,
                    team_id: parseInt(ev.team_id),
                    description: ev.type === 'point' ? 'Ponto' : ev.type,
                    score: '?' // Backend não retornou placar snapshot no evento ainda, mas ok
                }));

                const adaptedMatch = {
                    id: data.match.id,
                    home_team: { id: data.match.home_team.id, name: data.match.home_team.name },
                    away_team: { id: data.match.away_team.id, name: data.match.away_team.name },
                    current_set: (details.sets?.length || 0) + 1,
                    sets_score: {
                        home: data.match.home_score, // Assumindo que score principal guarda sets
                        away: data.match.away_score
                    },
                    current_points: currentSetScore,
                    serving_team_id: data.match.home_team_id, // TODO: Persistir quem saca no backend
                    status: data.match.status,
                    history: history
                };

                setMatchData(adaptedMatch);

                // Se o backend de full-details já trouxe rotation, usa. 
                // Senão eles serão populados pelo fetchRotation
                if (data.rosters) {
                    setRotationHome(data.rosters.home || []);
                    setRotationAway(data.rosters.away || []);
                }
            }
        } catch (error) {
            Alert.alert('Erro', 'Falha ao carregar súmula.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchRotation = useCallback(async () => {
        try {
            const res = await api.get(`/volleyball/match/${id}/positions?set=1`);
            const data = res.data;
            // TODO: Converter formato do rotation controller para array de jogadores visual
            // Por enquanto deixamos o backend de full-details popular se possível
        } catch (e) {
            console.error("Erro rotação:", e);
        }
    }, [id]);

    // Carregar dados iniciais e ROTAÇÃO
    useEffect(() => {
        if (!id) return;
        fetchMatchDetails();
        fetchRotation();
    }, [id, fetchMatchDetails, fetchRotation]);

    const handleRotate = async (teamId: number) => {
        try {
            const res = await api.post('/volleyball/rotate', {
                game_match_id: id,
                team_id: teamId,
                set_number: matchData?.current_set || 1,
                direction: 'forward'
            });

            if (res.status === 200) {
                fetchMatchDetails(); // Refresh full data
                fetchRotation(); // Use fetchRotation to refresh positions specifically if needed, but matchDetails should cover it
                Alert.alert("Sucesso", "Rodízio realizado!");
            }
        } catch (e) {
            console.error(e);
            Alert.alert("Erro", "Falha ao rodar.");
        }
    };

    const saveRotation = async (newRotation: any[], teamId: number) => {
        try {
            // Converte para formato { player_id, position }
            const payload = newRotation.map(p => ({
                player_id: p.player_id,
                position: p.position
            }));

            await api.post(`/volleyball/match/${id}/positions`, {
                team_id: teamId,
                set_number: matchData?.current_set || 1, // Usa set atual
                positions: payload
            });
            console.log('Rotação salva com sucesso');
        } catch (error) {
            console.error('Erro ao salvar rotação:', error);
            Alert.alert('Erro', 'Falha ao salvar nova formação.');
        }
    };

    // Handler para troca visual de posições
    const handleVisualSwap = async (clickedPos: number, isHomeTeam: boolean) => {
        // 1. Se nada selecionado, seleciona
        if (!selectedPos) {
            setSelectedPos({ pos: clickedPos, isHome: isHomeTeam });
            return;
        }

        // 2. Se clicou no mesmo, desseleciona
        if (selectedPos.pos === clickedPos && selectedPos.isHome === isHomeTeam) {
            setSelectedPos(null);
            return;
        }

        // 3. Se clicou em time diferente, troca a seleção para o novo time
        if (selectedPos.isHome !== isHomeTeam) {
            setSelectedPos({ pos: clickedPos, isHome: isHomeTeam });
            return;
        }

        // 4. Se clicou em outro jogador do MESMO time -> SWAP
        const currentRotation = isHomeTeam ? rotationHome : rotationAway;
        const setRotation = isHomeTeam ? setRotationHome : setRotationAway;
        const teamId = isHomeTeam ? matchData.home_team.id : matchData.away_team.id;

        // Cria nova lista trocando as posições
        const newRotation = currentRotation.map(p => {
            if (p.position === selectedPos.pos) return { ...p, position: clickedPos };
            if (p.position === clickedPos) return { ...p, position: selectedPos.pos };
            return p;
        });

        // Atualiza UI instantaneamente
        setRotation(newRotation);
        setSelectedPos(null);

        // Persiste no Backend
        await saveRotation(newRotation, teamId);
    };

    // ... restante das funções (handleAddPoint, confirmPoint etc)
    const handleAddPoint = (teamId: number) => {
        setSelectedScoringTeam(teamId);
        setModalPointVisible(true);
    };

    // Confirmar Ponto via API
    const confirmPoint = async (type: string) => {
        if (!matchData) return;

        try {
            // Optimistic UI Update (opcional, aqui vou esperar a API)
            await api.post(`/admin/matches/${id}/events`, {
                type: 'point', // Volei sempre é 'point' genérico + metadata
                description: type, // ataque, bloqueio
                team_id: selectedScoringTeam,
                points: 1
            });

            fetchMatchDetails();
            setModalPointVisible(false);

        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao registrar ponto.');
        }
    };

    // Render Loading
    if (loading || !matchData) {
        return (
            <SafeAreaView className="flex-1 justify-center items-center bg-gray-100">
                <Text className="text-gray-500">Carregando Súmula...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            {/* HEADER: Placar & Status */}
            <View className="bg-white p-4 border-b border-gray-200 shadow-sm">
                <View className="flex-row justify-between items-center mb-2">
                    <TouchableOpacity onPress={() => router.back()}>
                        <Ionicons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="font-bold text-gray-500 uppercase text-xs">
                        {matchData.sets_score.home} - {matchData.sets_score.away} em Sets
                    </Text>
                    <View className="w-6" />
                </View>

                <View className="flex-row justify-between items-center px-2">
                    {/* HOME */}
                    <View className="items-center w-1/3">
                        <Text className="font-bold text-lg text-center" numberOfLines={1}>
                            {matchData.home_team.name}
                        </Text>
                        <Text className="text-4xl font-extrabold text-blue-900">
                            {matchData.current_points.home}
                        </Text>
                        {matchData.serving_team_id === matchData.home_team.id && (
                            <View className="bg-yellow-400 px-2 py-0.5 rounded-full mt-1">
                                <Text className="text-[10px] font-bold text-white">SAQUE</Text>
                            </View>
                        )}
                    </View>

                    {/* VS / SET */}
                    <View className="items-center">
                        <Text className="text-gray-400 font-bold mb-1">SET {matchData.current_set}</Text>
                        <View className="w-px h-8 bg-gray-300" />
                    </View>

                    {/* AWAY */}
                    <View className="items-center w-1/3">
                        <Text className="font-bold text-lg text-center" numberOfLines={1}>
                            {matchData.away_team.name}
                        </Text>
                        <Text className="text-4xl font-extrabold text-green-900">
                            {matchData.current_points.away}
                        </Text>
                        {matchData.serving_team_id === matchData.away_team.id && (
                            <View className="bg-yellow-400 px-2 py-0.5 rounded-full mt-1">
                                <Text className="text-[10px] font-bold text-white">SAQUE</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 p-4">

                {/* CARD RODÍZIO (MINI-QUADRA) */}
                <TouchableOpacity
                    onPress={() => setModalRotationVisible(true)}
                    className="bg-white rounded-xl p-3 mb-6 shadow-sm border border-gray-200"
                >
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="font-bold text-gray-700">Quadra & Rodízio Atual</Text>
                        <Ionicons name="expand-outline" size={20} color="#666" />
                    </View>

                    {/* Mini Vizualização */}
                    <View className="h-24 bg-orange-100 rounded-lg border-2 border-orange-300 relative overflow-hidden flex-row">
                        {/* Rede */}
                        <View className="absolute left-1/2 top-0 bottom-0 w-1 bg-white z-10" />

                        {/* Lado A */}
                        <View className="flex-1 justify-center items-center">
                            <Text className="text-xs font-bold text-blue-800">Sacador: #{rotationHome.find(p => p.position === 1)?.number}</Text>
                        </View>
                        {/* Lado B */}
                        <View className="flex-1 justify-center items-center">
                            <Text className="text-xs font-bold text-green-800">Sacador: #{rotationAway.find(p => p.position === 1)?.number}</Text>
                        </View>
                    </View>
                    <Text className="text-center text-xs text-gray-400 mt-2">Toque para ver posições completas</Text>
                </TouchableOpacity>

                {/* CONTROLES PRINCIPAIS (BIG BUTTONS) */}
                <View className="flex-row gap-4 mb-6">
                    <TouchableOpacity
                        onPress={() => handleAddPoint(matchData.home_team.id)}
                        className="flex-1 bg-blue-600 rounded-2xl p-6 items-center shadow-md active:bg-blue-700"
                    >
                        <Text className="text-white font-bold text-lg text-center mb-1">PONTO</Text>
                        <Text className="text-blue-100 text-sm text-center">{matchData.home_team.name}</Text>
                        <Ionicons name="add-circle" size={40} color="white" style={{ marginTop: 10 }} />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => handleAddPoint(matchData.away_team.id)}
                        className="flex-1 bg-green-600 rounded-2xl p-6 items-center shadow-md active:bg-green-700"
                    >
                        <Text className="text-white font-bold text-lg text-center mb-1">PONTO</Text>
                        <Text className="text-green-100 text-sm text-center">{matchData.away_team.name}</Text>
                        <Ionicons name="add-circle" size={40} color="white" style={{ marginTop: 10 }} />
                    </TouchableOpacity>
                </View>

                {/* AÇÕES SECUNDÁRIAS */}
                <View className="flex-row gap-2 mb-8 justify-center">
                    <ActionButton icon="time" label="Tempo" color="bg-gray-200 text-gray-700" />
                    <ActionButton icon="swap-horizontal" label="Subst." color="bg-gray-200 text-gray-700" />
                    <ActionButton icon="alert-circle" label="Desfazer" color="bg-red-100 text-red-700" />
                </View>

                {/* TIMELINE (EVENTOS RECENTES) */}
                <View className="mb-20">
                    <Text className="font-bold text-gray-700 mb-3 px-1">Últimos Eventos</Text>
                    {matchData.history.map((event) => (
                        <View key={event.id} className="flex-row items-center py-3 border-b border-gray-100">
                            <View className={`w-2 h-10 rounded-full mr-3 ${event.team_id === 1001 ? 'bg-blue-500' : 'bg-green-500'}`} />
                            <View className="flex-1">
                                <Text className="font-bold text-gray-800">{event.description}</Text>
                                <Text className="text-xs text-gray-500">
                                    {event.team_id === 1001 ? matchData.home_team.name : matchData.away_team.name}
                                </Text>
                            </View>
                            <Text className="font-mono font-bold text-gray-600">{event.score}</Text>
                        </View>
                    ))}
                </View>

            </ScrollView>

            {/* MODAL RODÍZIO COMPLETO */}
            <Modal visible={modalRotationVisible} animationType="slide" transparent={true}>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl h-[80%] p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold">Rodízio em Quadra</Text>
                            <TouchableOpacity onPress={() => setModalRotationVisible(false)}>
                                <Ionicons name="close-circle" size={30} color="#ddd" />
                            </TouchableOpacity>
                        </View>

                        {/* Exemplo visual de quadra Volei (6 posições) */}
                        <View className="flex-1 items-center justify-center bg-gray-50 rounded-xl border border-gray-200 relative mb-4">
                            {/* Rede */}
                            <View className="absolute left-0 right-0 top-1/2 h-1 bg-red-500 z-10" />

                            {/* Time A (Cima) */}
                            <View className="h-1/2 w-full p-4 relative">
                                <Text className="absolute top-2 left-2 font-bold text-blue-900">{matchData.home_team.name}</Text>
                                <PlayerPosition pos={4} data={rotationHome} top="10%" left="10%" onPlayerTap={(p: number) => handleVisualSwap(p, true)} selectedPos={selectedPos?.isHome ? selectedPos.pos : null} />
                                <PlayerPosition pos={3} data={rotationHome} top="10%" left="45%" onPlayerTap={(p: number) => handleVisualSwap(p, true)} selectedPos={selectedPos?.isHome ? selectedPos.pos : null} />
                                <PlayerPosition pos={2} data={rotationHome} top="10%" left="80%" onPlayerTap={(p: number) => handleVisualSwap(p, true)} selectedPos={selectedPos?.isHome ? selectedPos.pos : null} />

                                <PlayerPosition pos={5} data={rotationHome} top="60%" left="10%" onPlayerTap={(p: number) => handleVisualSwap(p, true)} selectedPos={selectedPos?.isHome ? selectedPos.pos : null} />
                                <PlayerPosition pos={6} data={rotationHome} top="60%" left="45%" onPlayerTap={(p: number) => handleVisualSwap(p, true)} selectedPos={selectedPos?.isHome ? selectedPos.pos : null} />
                                <PlayerPosition pos={1} data={rotationHome} top="60%" left="80%" isServer onPlayerTap={(p: number) => handleVisualSwap(p, true)} selectedPos={selectedPos?.isHome ? selectedPos.pos : null} />
                            </View>

                            {/* Time B (Baixo) */}
                            <View className="h-1/2 w-full p-4 relative">
                                <Text className="absolute bottom-2 right-2 font-bold text-green-900">{matchData.away_team.name}</Text>

                                <PlayerPosition pos={1} data={rotationAway} top="10%" right="80%" isServer onPlayerTap={(p: number) => handleVisualSwap(p, false)} selectedPos={!selectedPos?.isHome ? selectedPos?.pos : null} />
                                <PlayerPosition pos={6} data={rotationAway} top="10%" right="45%" onPlayerTap={(p: number) => handleVisualSwap(p, false)} selectedPos={!selectedPos?.isHome ? selectedPos?.pos : null} />
                                <PlayerPosition pos={5} data={rotationAway} top="10%" right="10%" onPlayerTap={(p: number) => handleVisualSwap(p, false)} selectedPos={!selectedPos?.isHome ? selectedPos?.pos : null} />

                                <PlayerPosition pos={2} data={rotationAway} top="60%" right="80%" onPlayerTap={(p: number) => handleVisualSwap(p, false)} selectedPos={!selectedPos?.isHome ? selectedPos?.pos : null} />
                                <PlayerPosition pos={3} data={rotationAway} top="60%" right="45%" onPlayerTap={(p: number) => handleVisualSwap(p, false)} selectedPos={!selectedPos?.isHome ? selectedPos?.pos : null} />
                                <PlayerPosition pos={4} data={rotationAway} top="60%" right="10%" onPlayerTap={(p: number) => handleVisualSwap(p, false)} selectedPos={!selectedPos?.isHome ? selectedPos?.pos : null} />
                            </View>
                        </View>

                        <TouchableOpacity className="bg-gray-200 p-4 rounded-xl items-center" onPress={() => setModalRotationVisible(false)}>
                            <Text className="font-bold text-gray-700">Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAL TIPO DE PONTO */}
            <Modal visible={modalPointVisible} animationType="fade" transparent={true}>
                <View className="flex-1 bg-black/60 items-center justify-center p-6">
                    <View className="bg-white w-full rounded-2xl p-6">
                        <Text className="text-xl font-bold text-center mb-6">Como foi o ponto?</Text>

                        <View className="flex-row flex-wrap gap-3 justify-center">
                            <PointTypeButton label="Ataque" color="bg-orange-500" onPress={() => confirmPoint('Ataque')} />
                            <PointTypeButton label="Bloqueio" color="bg-purple-500" onPress={() => confirmPoint('Bloqueio')} />
                            <PointTypeButton label="Ace / Saque" color="bg-yellow-500" onPress={() => confirmPoint('Saque')} />
                            <PointTypeButton label="Erro Adversário" color="bg-gray-500" onPress={() => confirmPoint('Erro')} />
                        </View>

                        <TouchableOpacity
                            onPress={() => setModalPointVisible(false)}
                            className="mt-6 p-4 items-center"
                        >
                            <Text className="text-red-500 font-bold">Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

        </SafeAreaView >
    );
}

// Subcomponentes
const ActionButton = ({ icon, label, color }: any) => (
    <TouchableOpacity className={`flex-row items-center px-4 py-3 rounded-lg ${color.split(' ')[0]}`}>
        <Ionicons name={icon} size={18} className="mr-2" color={color.includes('red') ? '#c00' : '#444'} />
        <Text className={`font-bold ml-1 ${color.split(' ')[1]}`}>{label}</Text>
    </TouchableOpacity>
);

const PlayerPosition = ({ pos, data, top, left, right, isServer, onPlayerTap, selectedPos }: any) => {
    const player = data.find((p: any) => p.position === pos);
    const isSelected = selectedPos === pos;

    return (
        <TouchableOpacity
            onPress={() => onPlayerTap(pos)}
            className={`absolute w-12 h-12 rounded-full items-center justify-center shadow-sm 
                ${isSelected ? 'bg-blue-200 border-4 border-blue-500 scale-110 z-50' : ''}
                ${isServer ? 'bg-yellow-100 border-2 border-yellow-400' : 'bg-white border border-gray-300'}
            `}
            style={{ top, left, right }}
        >
            <Text className="font-bold text-gray-800">{player?.number || '?'}</Text>
            {isServer && <View className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full" />}
        </TouchableOpacity>
    );
};

const PointTypeButton = ({ label, color, onPress }: any) => (
    <TouchableOpacity
        onPress={onPress}
        className={`${color} w-[45%] p-4 rounded-xl items-center justify-center shadow-sm active:opacity-80`}
    >
        <Text className="text-white font-bold text-lg">{label}</Text>
    </TouchableOpacity>
);

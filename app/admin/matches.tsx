import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import '../../global.css';

export default function AdminMatchesScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState<any[]>([]);
    const [championships, setChampionships] = useState<any[]>([]);
    const [teams, setTeams] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    const [showScoreModal, setShowScoreModal] = useState(false);
    const [newMatch, setNewMatch] = useState({
        championship_id: '',
        home_team_id: '',
        away_team_id: '',
        start_time: '',
        location: '',
        round_name: ''
    });
    const [score, setScore] = useState({ home: '0', away: '0' });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            const [matchesRes, champsRes, teamsRes] = await Promise.all([
                api.get('/admin/matches'),
                api.get('/admin/championships'),
                api.get('/admin/teams')
            ]);
            setMatches(matchesRes.data);
            setChampionships(champsRes.data);
            setTeams(teamsRes.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar os dados');
        } finally {
            setLoading(false);
        }
    }

    async function createMatch() {
        try {
            await api.post('/admin/matches', newMatch);
            Alert.alert('Sucesso', 'Partida criada!');
            setShowCreateModal(false);
            loadData();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível criar a partida');
        }
    }

    async function finishMatch() {
        if (!selectedMatch) return;

        try {
            await api.post(`/admin/matches/${selectedMatch.id}/finish`, {
                home_score: parseInt(score.home),
                away_score: parseInt(score.away)
            });
            Alert.alert('Sucesso', 'Partida finalizada!');
            setShowScoreModal(false);
            setSelectedMatch(null);
            loadData();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível finalizar a partida');
        }
    }

    async function deleteMatch(id: number) {
        Alert.alert(
            'Confirmar',
            'Deseja realmente excluir esta partida?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/matches/${id}`);
                            Alert.alert('Sucesso', 'Partida excluída!');
                            loadData();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir');
                        }
                    }
                }
            ]
        );
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'finished': return 'bg-green-100 text-green-700';
            case 'live': return 'bg-red-100 text-red-700';
            case 'scheduled': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'finished': return 'Finalizada';
            case 'live': return 'Ao Vivo';
            case 'scheduled': return 'Agendada';
            case 'cancelled': return 'Cancelada';
            default: return status;
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white dark:bg-gray-800 rounded-xl mb-3 shadow-sm border-l-4 border-l-green-600 overflow-hidden">
            <View className="p-4">
                <View className="flex-row justify-between items-start mb-3">
                    <View className="flex-1">
                        <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                            {item.championship?.name} • {item.round_name || 'Rodada'}
                        </Text>
                        <Text className="text-gray-800 dark:text-gray-100 font-bold text-base">
                            {item.home_team?.name} {item.home_score !== null ? item.home_score : '-'} x {item.away_score !== null ? item.away_score : '-'} {item.away_team?.name}
                        </Text>
                    </View>
                    <View className={`px-2 py-1 rounded ${getStatusColor(item.status)}`}>
                        <Text className="text-xs font-bold">{getStatusLabel(item.status)}</Text>
                    </View>
                </View>

                <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    {item.status === 'scheduled' && (
                        <TouchableOpacity
                            className="flex-row items-center bg-green-50 dark:bg-green-900 px-3 py-2 rounded"
                            onPress={() => {
                                setSelectedMatch(item);
                                setScore({ home: '0', away: '0' });
                                setShowScoreModal(true);
                            }}
                        >
                            <FontAwesome5 name="check" size={12} color="#198754" />
                            <Text className="text-green-600 dark:text-green-400 text-xs font-bold ml-2">Finalizar</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        className="flex-row items-center bg-blue-50 dark:bg-blue-900 px-3 py-2 rounded"
                        onPress={() => router.push(`/admin/sumula-futebol?matchId=${item.id}`)}
                    >
                        <FontAwesome5 name="clipboard-list" size={12} color="#0d6efd" />
                        <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold ml-2">Súmula</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center bg-red-50 dark:bg-red-900 px-3 py-2 rounded"
                        onPress={() => deleteMatch(item.id)}
                    >
                        <FontAwesome5 name="trash" size={12} color="#dc3545" />
                        <Text className="text-red-600 dark:text-red-400 text-xs font-bold ml-2">Excluir</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                        <MaterialIcons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800 dark:text-white">Partidas</Text>
                </View>
                <TouchableOpacity
                    className="bg-green-600 px-4 py-2 rounded-lg flex-row items-center"
                    onPress={() => setShowCreateModal(true)}
                >
                    <FontAwesome5 name="plus" size={14} color="white" />
                    <Text className="text-white font-bold text-xs ml-2">NOVA</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#198754" className="mt-10" />
            ) : (
                <FlatList
                    data={matches}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <FontAwesome5 name="futbol" size={48} color="#ccc" />
                            <Text className="text-gray-400 mt-4 text-center">Nenhuma partida criada ainda</Text>
                        </View>
                    }
                />
            )}

            {/* Create Modal */}
            <Modal visible={showCreateModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <ScrollView className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 pt-8 max-h-[80%]">
                        <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4">Nova Partida</Text>

                        <Text className="text-gray-600 dark:text-gray-400 text-sm mb-2">Campeonato</Text>
                        <View className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3">
                            <Text className="text-gray-800 dark:text-white">
                                {championships.find(c => c.id.toString() === newMatch.championship_id)?.name || 'Selecione'}
                            </Text>
                        </View>

                        <TextInput
                            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3 text-gray-800 dark:text-white"
                            placeholder="Rodada (ex: Rodada 1)"
                            placeholderTextColor="#999"
                            value={newMatch.round_name}
                            onChangeText={(text) => setNewMatch({ ...newMatch, round_name: text })}
                        />

                        <TextInput
                            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3 text-gray-800 dark:text-white"
                            placeholder="Local"
                            placeholderTextColor="#999"
                            value={newMatch.location}
                            onChangeText={(text) => setNewMatch({ ...newMatch, location: text })}
                        />

                        <TextInput
                            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3 text-gray-800 dark:text-white"
                            placeholder="Data/Hora (YYYY-MM-DD HH:MM:SS)"
                            placeholderTextColor="#999"
                            value={newMatch.start_time}
                            onChangeText={(text) => setNewMatch({ ...newMatch, start_time: text })}
                        />

                        <View className="flex-row gap-3 mt-4">
                            <TouchableOpacity
                                className="flex-1 bg-gray-200 dark:bg-gray-700 p-4 rounded-lg"
                                onPress={() => setShowCreateModal(false)}
                            >
                                <Text className="text-gray-700 dark:text-gray-300 font-bold text-center">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-green-600 p-4 rounded-lg"
                                onPress={createMatch}
                            >
                                <Text className="text-white font-bold text-center">Criar</Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            {/* Score Modal */}
            <Modal visible={showScoreModal} transparent animationType="fade">
                <View className="flex-1 bg-black/50 justify-center items-center p-6">
                    <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
                        <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">Finalizar Partida</Text>

                        <Text className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-center">
                            {selectedMatch?.home_team?.name} x {selectedMatch?.away_team?.name}
                        </Text>

                        <View className="flex-row gap-4 mb-6">
                            <View className="flex-1">
                                <Text className="text-gray-600 dark:text-gray-400 text-xs mb-2 text-center">Casa</Text>
                                <TextInput
                                    className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-gray-800 dark:text-white text-center text-2xl font-bold"
                                    keyboardType="numeric"
                                    value={score.home}
                                    onChangeText={(text) => setScore({ ...score, home: text })}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 dark:text-gray-400 text-xs mb-2 text-center">Fora</Text>
                                <TextInput
                                    className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-gray-800 dark:text-white text-center text-2xl font-bold"
                                    keyboardType="numeric"
                                    value={score.away}
                                    onChangeText={(text) => setScore({ ...score, away: text })}
                                />
                            </View>
                        </View>

                        <View className="flex-row gap-3">
                            <TouchableOpacity
                                className="flex-1 bg-gray-200 dark:bg-gray-700 p-4 rounded-lg"
                                onPress={() => setShowScoreModal(false)}
                            >
                                <Text className="text-gray-700 dark:text-gray-300 font-bold text-center">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-green-600 p-4 rounded-lg"
                                onPress={finishMatch}
                            >
                                <Text className="text-white font-bold text-center">Confirmar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

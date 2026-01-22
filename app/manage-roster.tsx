import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import api from '../src/services/api';
import '../global.css';

interface Player {
    id: number;
    name: string;
    position: string;
    number: number;
}

export default function ManageRosterScreen() {
    const { teamId } = useLocalSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState<any>(null);
    const [players, setPlayers] = useState<Player[]>([]);

    // Add Player Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerPos, setNewPlayerPos] = useState('');

    useEffect(() => {
        fetchTeamDetails();
    }, [teamId]);

    async function fetchTeamDetails() {
        try {
            const response = await api.get(`/teams/${teamId}`);
            setTeam(response.data);
            if (response.data.players) {
                setPlayers(response.data.players);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleAddPlayer() {
        if (!newPlayerName || !newPlayerPos) return Alert.alert('Erro', 'Preencha todos os campos.');

        try {
            await api.post(`/teams/${teamId}/players`, {
                name: newPlayerName,
                position: newPlayerPos
            });
            Alert.alert('Sucesso', 'Jogador adicionado.');
            setModalVisible(false);
            setNewPlayerName('');
            setNewPlayerPos('');
            fetchTeamDetails(); // Reload
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível adicionar.');
        }
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Elenco</Text>
            </View>

            {loading ? (
                <ActivityIndicator className="mt-10" size="large" color="#059669" />
            ) : (
                <View className="flex-1 p-4">
                    <View className="bg-blue-900 p-6 rounded-2xl mb-6 items-center shadow-lg">
                        <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-3">
                            <FontAwesome5 name="shield-alt" size={40} color="#1e3a8a" />
                        </View>
                        <Text className="text-white text-2xl font-bold">{team?.name}</Text>
                        <Text className="text-blue-200">Capitão: {team?.captain?.name || 'Você'}</Text>
                    </View>

                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-gray-800">Jogadores ({players.length})</Text>
                        <TouchableOpacity onPress={() => setModalVisible(true)} className="flex-row items-center bg-emerald-100 px-3 py-1 rounded-full">
                            <FontAwesome5 name="plus" size={12} color="#059669" />
                            <Text className="text-emerald-700 font-bold text-xs ml-2">ADICIONAR</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={players}
                        keyExtractor={item => String(item.id)}
                        renderItem={({ item }) => (
                            <View className="bg-white p-4 rounded-xl mb-3 flex-row items-center border border-gray-100">
                                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3">
                                    <Text className="font-bold text-gray-500">{item.number || '#'}</Text>
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-800">{item.name}</Text>
                                    <Text className="text-gray-500 text-xs">{item.position}</Text>
                                </View>
                                <TouchableOpacity>
                                    <FontAwesome5 name="trash" size={14} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        )}
                    />
                </View>
            )}

            {/* Modal Add Player */}
            <Modal visible={modalVisible} animationType="fade" transparent>
                <View className="flex-1 bg-black/50 justify-center items-center p-4">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-sm">
                        <Text className="text-xl font-bold text-gray-800 mb-4">Novo Jogador</Text>

                        <Text className="text-gray-600 mb-1">Nome Completo</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 mb-4"
                            placeholder="Ex: João da Silva"
                            value={newPlayerName}
                            onChangeText={setNewPlayerName}
                        />

                        <Text className="text-gray-600 mb-1">Posição</Text>
                        <TextInput
                            className="border border-gray-300 rounded-lg p-3 mb-6"
                            placeholder="Ex: Goleiro"
                            value={newPlayerPos}
                            onChangeText={setNewPlayerPos}
                        />

                        <View className="flex-row gap-3">
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="flex-1 bg-gray-200 p-3 rounded-lg items-center">
                                <Text className="font-bold text-gray-700">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAddPlayer} className="flex-1 bg-emerald-600 p-3 rounded-lg items-center">
                                <Text className="font-bold text-white">Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

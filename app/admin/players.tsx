import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import '../../global.css';

export default function AdminPlayersScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [players, setPlayers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPlayer, setNewPlayer] = useState({
        name: '',
        email: '',
        cpf: '',
        phone: '',
        birth_date: '',
        password: 'senha123'
    });

    useEffect(() => {
        loadPlayers();
    }, []);

    async function loadPlayers() {
        try {
            setLoading(true);
            const response = await api.get('/admin/players');
            setPlayers(response.data.data || response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar os jogadores');
        } finally {
            setLoading(false);
        }
    }

    async function searchPlayers() {
        if (!searchQuery.trim()) {
            loadPlayers();
            return;
        }

        try {
            setLoading(true);
            const response = await api.get(`/admin/players?search=${searchQuery}`);
            setPlayers(response.data.data || response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Erro na busca');
        } finally {
            setLoading(false);
        }
    }

    async function createPlayer() {
        try {
            await api.post('/admin/players', newPlayer);
            Alert.alert('Sucesso', 'Jogador cadastrado!');
            setShowCreateModal(false);
            setNewPlayer({ name: '', email: '', cpf: '', phone: '', birth_date: '', password: 'senha123' });
            loadPlayers();
        } catch (error: any) {
            console.error(error);
            Alert.alert('Erro', error.response?.data?.message || 'Não foi possível cadastrar');
        }
    }

    async function deletePlayer(id: number) {
        Alert.alert(
            'Confirmar',
            'Deseja realmente excluir este jogador?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/players/${id}`);
                            Alert.alert('Sucesso', 'Jogador excluído!');
                            loadPlayers();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir');
                        }
                    }
                }
            ]
        );
    }

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white dark:bg-gray-800 rounded-xl mb-3 shadow-sm border-l-4 border-l-purple-600 overflow-hidden">
            <View className="p-4">
                <View className="flex-row items-center mb-3">
                    <View className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full items-center justify-center mr-3">
                        <FontAwesome5 name="user" size={20} color="#9333ea" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-800 dark:text-gray-100 font-bold text-base">
                            {item.name}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs">
                            {item.email}
                        </Text>
                    </View>
                </View>

                {(item.cpf || item.phone) && (
                    <View className="mb-3 bg-gray-50 dark:bg-gray-700 p-2 rounded">
                        {item.cpf && (
                            <Text className="text-gray-600 dark:text-gray-400 text-xs">
                                CPF: {item.cpf}
                            </Text>
                        )}
                        {item.phone && (
                            <Text className="text-gray-600 dark:text-gray-400 text-xs">
                                Tel: {item.phone}
                            </Text>
                        )}
                    </View>
                )}

                <View className="flex-row justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                    <TouchableOpacity
                        className="flex-row items-center bg-blue-50 dark:bg-blue-900 px-3 py-2 rounded"
                        onPress={() => router.push(`/admin/player-detail/${item.id}`)}
                    >
                        <FontAwesome5 name="edit" size={12} color="#0d6efd" />
                        <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold ml-2">Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center bg-red-50 dark:bg-red-900 px-3 py-2 rounded"
                        onPress={() => deletePlayer(item.id)}
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
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <View className="flex-row items-center justify-between mb-3">
                    <View className="flex-row items-center flex-1">
                        <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                            <MaterialIcons name="arrow-back" size={24} color="#333" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-800 dark:text-white">Jogadores</Text>
                    </View>
                    <TouchableOpacity
                        className="bg-purple-600 px-4 py-2 rounded-lg flex-row items-center"
                        onPress={() => setShowCreateModal(true)}
                    >
                        <FontAwesome5 name="plus" size={14} color="white" />
                        <Text className="text-white font-bold text-xs ml-2">NOVO</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Bar */}
                <View className="flex-row gap-2">
                    <TextInput
                        className="flex-1 bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-800 dark:text-white"
                        placeholder="Buscar por nome, email ou CPF..."
                        placeholderTextColor="#999"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={searchPlayers}
                    />
                    <TouchableOpacity
                        className="bg-blue-600 px-4 rounded-lg items-center justify-center"
                        onPress={searchPlayers}
                    >
                        <FontAwesome5 name="search" size={16} color="white" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#9333ea" className="mt-10" />
            ) : (
                <FlatList
                    data={players}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <FontAwesome5 name="user-friends" size={48} color="#ccc" />
                            <Text className="text-gray-400 mt-4 text-center">Nenhum jogador encontrado</Text>
                        </View>
                    }
                />
            )}

            {/* Create Modal */}
            <Modal visible={showCreateModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 pt-8">
                        <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4">Novo Jogador</Text>

                        <TextInput
                            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3 text-gray-800 dark:text-white"
                            placeholder="Nome Completo"
                            placeholderTextColor="#999"
                            value={newPlayer.name}
                            onChangeText={(text) => setNewPlayer({ ...newPlayer, name: text })}
                        />

                        <TextInput
                            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3 text-gray-800 dark:text-white"
                            placeholder="Email"
                            placeholderTextColor="#999"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={newPlayer.email}
                            onChangeText={(text) => setNewPlayer({ ...newPlayer, email: text })}
                        />

                        <TextInput
                            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3 text-gray-800 dark:text-white"
                            placeholder="CPF"
                            placeholderTextColor="#999"
                            keyboardType="numeric"
                            value={newPlayer.cpf}
                            onChangeText={(text) => setNewPlayer({ ...newPlayer, cpf: text })}
                        />

                        <TextInput
                            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3 text-gray-800 dark:text-white"
                            placeholder="Telefone"
                            placeholderTextColor="#999"
                            keyboardType="phone-pad"
                            value={newPlayer.phone}
                            onChangeText={(text) => setNewPlayer({ ...newPlayer, phone: text })}
                        />

                        <View className="flex-row gap-3 mt-4">
                            <TouchableOpacity
                                className="flex-1 bg-gray-200 dark:bg-gray-700 p-4 rounded-lg"
                                onPress={() => setShowCreateModal(false)}
                            >
                                <Text className="text-gray-700 dark:text-gray-300 font-bold text-center">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-purple-600 p-4 rounded-lg"
                                onPress={createPlayer}
                            >
                                <Text className="text-white font-bold text-center">Criar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

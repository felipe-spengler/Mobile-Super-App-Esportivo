import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import '../../global.css';

export default function AdminChampionshipsScreen() {
    const router = useRouter();
    const { selectedClub } = useAuth();
    const [loading, setLoading] = useState(true);
    const [championships, setChampionships] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newChampionship, setNewChampionship] = useState({
        name: '',
        sport_id: 1,
        start_date: '',
        format: 'league'
    });

    useEffect(() => {
        loadChampionships();
    }, []);

    async function loadChampionships() {
        try {
            setLoading(true);
            const response = await api.get('/admin/championships');
            setChampionships(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar os campeonatos');
        } finally {
            setLoading(false);
        }
    }

    async function createChampionship() {
        try {
            await api.post('/admin/championships', newChampionship);
            Alert.alert('Sucesso', 'Campeonato criado!');
            setShowCreateModal(false);
            loadChampionships();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível criar o campeonato');
        }
    }

    async function deleteChampionship(id: number) {
        Alert.alert(
            'Confirmar',
            'Deseja realmente excluir este campeonato?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/championships/${id}`);
                            Alert.alert('Sucesso', 'Campeonato excluído!');
                            loadChampionships();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir');
                        }
                    }
                }
            ]
        );
    }

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white dark:bg-gray-800 rounded-xl mb-3 shadow-sm border-l-4 border-l-blue-600 overflow-hidden">
            <View className="p-4">
                <View className="flex-row justify-between items-start mb-2">
                    <View className="flex-1">
                        <Text className="text-gray-800 dark:text-gray-100 font-bold text-base mb-1">
                            {item.name}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs">
                            {item.sport?.name} • {item.format}
                        </Text>
                    </View>
                    <View className={`px-2 py-1 rounded ${item.is_active ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <Text className={`text-xs font-bold ${item.is_active ? 'text-green-700' : 'text-gray-500'}`}>
                            {item.is_active ? 'Ativo' : 'Inativo'}
                        </Text>
                    </View>
                </View>

                <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <TouchableOpacity
                        className="flex-row items-center bg-blue-50 dark:bg-blue-900 px-3 py-2 rounded"
                        onPress={() => router.push(`/admin/championship-detail/${item.id}`)}
                    >
                        <FontAwesome5 name="edit" size={12} color="#0d6efd" />
                        <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold ml-2">Editar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center bg-red-50 dark:bg-red-900 px-3 py-2 rounded"
                        onPress={() => deleteChampionship(item.id)}
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
            {/* Header */}
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                        <MaterialIcons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800 dark:text-white">Campeonatos</Text>
                </View>
                <TouchableOpacity
                    className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
                    onPress={() => setShowCreateModal(true)}
                >
                    <FontAwesome5 name="plus" size={14} color="white" />
                    <Text className="text-white font-bold text-xs ml-2">NOVO</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0d6efd" className="mt-10" />
            ) : (
                <FlatList
                    data={championships}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <FontAwesome5 name="trophy" size={48} color="#ccc" />
                            <Text className="text-gray-400 mt-4 text-center">Nenhum campeonato criado ainda</Text>
                        </View>
                    }
                />
            )}

            {/* Create Modal */}
            <Modal visible={showCreateModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 pt-8">
                        <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4">Novo Campeonato</Text>

                        <TextInput
                            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3 text-gray-800 dark:text-white"
                            placeholder="Nome do Campeonato"
                            placeholderTextColor="#999"
                            value={newChampionship.name}
                            onChangeText={(text) => setNewChampionship({ ...newChampionship, name: text })}
                        />

                        <TextInput
                            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3 text-gray-800 dark:text-white"
                            placeholder="Data de Início (YYYY-MM-DD)"
                            placeholderTextColor="#999"
                            value={newChampionship.start_date}
                            onChangeText={(text) => setNewChampionship({ ...newChampionship, start_date: text })}
                        />

                        <View className="flex-row gap-3 mt-4">
                            <TouchableOpacity
                                className="flex-1 bg-gray-200 dark:bg-gray-700 p-4 rounded-lg"
                                onPress={() => setShowCreateModal(false)}
                            >
                                <Text className="text-gray-700 dark:text-gray-300 font-bold text-center">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-blue-600 p-4 rounded-lg"
                                onPress={createChampionship}
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

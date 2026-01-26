import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import '../../global.css';

export default function AdminTeamsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState<any[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTeam, setNewTeam] = useState({
        name: '',
        short_name: '',
        primary_color: '#0d6efd',
        secondary_color: '#ffffff'
    });

    useEffect(() => {
        loadTeams();
    }, []);

    async function loadTeams() {
        try {
            setLoading(true);
            const response = await api.get('/admin/teams');
            setTeams(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar as equipes');
        } finally {
            setLoading(false);
        }
    }

    async function createTeam() {
        try {
            await api.post('/admin/teams', newTeam);
            Alert.alert('Sucesso', 'Equipe criada!');
            setShowCreateModal(false);
            setNewTeam({ name: '', short_name: '', primary_color: '#0d6efd', secondary_color: '#ffffff' });
            loadTeams();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível criar a equipe');
        }
    }

    async function deleteTeam(id: number) {
        Alert.alert(
            'Confirmar',
            'Deseja realmente excluir esta equipe?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/teams/${id}`);
                            Alert.alert('Sucesso', 'Equipe excluída!');
                            loadTeams();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível excluir');
                        }
                    }
                }
            ]
        );
    }

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white dark:bg-gray-800 rounded-xl mb-3 shadow-sm overflow-hidden">
            <View
                className="h-2"
                style={{ backgroundColor: item.primary_color || '#0d6efd' }}
            />
            <View className="p-4">
                <View className="flex-row items-center mb-3">
                    <View
                        className="w-12 h-12 rounded-full items-center justify-center mr-3"
                        style={{ backgroundColor: `${item.primary_color || '#0d6efd'}20` }}
                    >
                        <FontAwesome5 name="shield-alt" size={20} color={item.primary_color || '#0d6efd'} />
                    </View>
                    <View className="flex-1">
                        <Text className="text-gray-800 dark:text-gray-100 font-bold text-base">
                            {item.name}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs">
                            {item.short_name || 'Sem abreviação'}
                        </Text>
                    </View>
                </View>

                <View className="flex-row gap-2 mb-3">
                    <View className="flex-row items-center">
                        <View
                            className="w-6 h-6 rounded mr-2"
                            style={{ backgroundColor: item.primary_color || '#0d6efd' }}
                        />
                        <Text className="text-gray-600 dark:text-gray-400 text-xs">Primária</Text>
                    </View>
                    <View className="flex-row items-center">
                        <View
                            className="w-6 h-6 rounded mr-2 border border-gray-300"
                            style={{ backgroundColor: item.secondary_color || '#ffffff' }}
                        />
                        <Text className="text-gray-600 dark:text-gray-400 text-xs">Secundária</Text>
                    </View>
                </View>

                <View className="flex-row justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
                    <TouchableOpacity
                        className="flex-row items-center bg-blue-50 dark:bg-blue-900 px-3 py-2 rounded"
                        onPress={() => router.push(`/admin/team-detail/${item.id}`)}
                    >
                        <FontAwesome5 name="users" size={12} color="#0d6efd" />
                        <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold ml-2">Jogadores</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className="flex-row items-center bg-red-50 dark:bg-red-900 px-3 py-2 rounded"
                        onPress={() => deleteTeam(item.id)}
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
                    <Text className="text-xl font-bold text-gray-800 dark:text-white">Equipes</Text>
                </View>
                <TouchableOpacity
                    className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
                    onPress={() => setShowCreateModal(true)}
                >
                    <FontAwesome5 name="plus" size={14} color="white" />
                    <Text className="text-white font-bold text-xs ml-2">NOVA</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0d6efd" className="mt-10" />
            ) : (
                <FlatList
                    data={teams}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <FontAwesome5 name="users" size={48} color="#ccc" />
                            <Text className="text-gray-400 mt-4 text-center">Nenhuma equipe criada ainda</Text>
                        </View>
                    }
                />
            )}

            {/* Create Modal */}
            <Modal visible={showCreateModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 pt-8">
                        <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4">Nova Equipe</Text>

                        <TextInput
                            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3 text-gray-800 dark:text-white"
                            placeholder="Nome da Equipe"
                            placeholderTextColor="#999"
                            value={newTeam.name}
                            onChangeText={(text) => setNewTeam({ ...newTeam, name: text })}
                        />

                        <TextInput
                            className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg mb-3 text-gray-800 dark:text-white"
                            placeholder="Abreviação (ex: FLA)"
                            placeholderTextColor="#999"
                            value={newTeam.short_name}
                            onChangeText={(text) => setNewTeam({ ...newTeam, short_name: text })}
                        />

                        <View className="flex-row gap-3 mb-3">
                            <View className="flex-1">
                                <Text className="text-gray-600 dark:text-gray-400 text-xs mb-2">Cor Primária</Text>
                                <TextInput
                                    className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-800 dark:text-white"
                                    placeholder="#0d6efd"
                                    placeholderTextColor="#999"
                                    value={newTeam.primary_color}
                                    onChangeText={(text) => setNewTeam({ ...newTeam, primary_color: text })}
                                />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-600 dark:text-gray-400 text-xs mb-2">Cor Secundária</Text>
                                <TextInput
                                    className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-800 dark:text-white"
                                    placeholder="#ffffff"
                                    placeholderTextColor="#999"
                                    value={newTeam.secondary_color}
                                    onChangeText={(text) => setNewTeam({ ...newTeam, secondary_color: text })}
                                />
                            </View>
                        </View>

                        <View className="flex-row gap-3 mt-4">
                            <TouchableOpacity
                                className="flex-1 bg-gray-200 dark:bg-gray-700 p-4 rounded-lg"
                                onPress={() => setShowCreateModal(false)}
                            >
                                <Text className="text-gray-700 dark:text-gray-300 font-bold text-center">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                className="flex-1 bg-blue-600 p-4 rounded-lg"
                                onPress={createTeam}
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

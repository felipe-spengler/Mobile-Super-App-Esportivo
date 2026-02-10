import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../src/services/api';
import '../global.css';

interface Player {
    id: number;
    name: string;
    position: string;
    number: number;
    photo_url?: string;
    pivot?: {
        is_approved: boolean;
        number: number;
        position: string;
    }
}

export default function ManageRosterScreen() {
    const { teamId } = useLocalSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [team, setTeam] = useState<any>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [adding, setAdding] = useState(false);

    // Add Player Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerPos, setNewPlayerPos] = useState('');
    const [newPlayerNum, setNewPlayerNum] = useState('');
    const [newPlayerEmail, setNewPlayerEmail] = useState('');
    const [newPlayerCpf, setNewPlayerCpf] = useState('');
    const [playerPhoto, setPlayerPhoto] = useState<string | null>(null);

    useEffect(() => {
        if (teamId) fetchTeamDetails();
    }, [teamId]);

    async function fetchTeamDetails() {
        setLoading(true);
        try {
            const response = await api.get(`/teams/${teamId}`);
            setTeam(response.data);
            if (response.data.players) {
                setPlayers(response.data.players);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao carregar detalhes da equipe.');
        } finally {
            setLoading(false);
        }
    }

    async function handlePickImage() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setPlayerPhoto(result.assets[0].uri);
        }
    }

    async function handleAddPlayer() {
        if (!newPlayerName || !newPlayerPos) return Alert.alert('Erro', 'Nome e Posição são obrigatórios.');

        setAdding(true);
        try {
            const formData = new FormData();
            formData.append('name', newPlayerName);
            formData.append('position', newPlayerPos);
            formData.append('number', newPlayerNum);
            formData.append('email', newPlayerEmail);
            formData.append('cpf', newPlayerCpf);

            if (playerPhoto) {
                // @ts-ignore
                formData.append('document_file', {
                    uri: playerPhoto,
                    name: 'document.jpg',
                    type: 'image/jpeg',
                });
            }

            await api.post(`/teams/${teamId}/players`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            Alert.alert('Sucesso', 'Jogador adicionado.');
            setModalVisible(false);
            resetForm();
            fetchTeamDetails();
        } catch (error) {
            console.error(error);
            // Mock success for UI demo if API fails
            Alert.alert('Erro', 'Não foi possível adicionar o jogador.');
        } finally {
            setAdding(false);
        }
    }

    function resetForm() {
        setNewPlayerName('');
        setNewPlayerPos('');
        setNewPlayerNum('');
        setNewPlayerEmail('');
        setNewPlayerCpf('');
        setPlayerPhoto(null);
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-white dark:bg-gray-800 pt-12 pb-4 px-4 shadow-sm flex-row items-center border-b border-gray-100 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 p-1 -ml-1 rounded-full active:bg-gray-100 dark:active:bg-gray-700">
                    <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 dark:text-white">Gerenciar Elenco</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : (
                <View className="flex-1 p-4">
                    {/* Team Banner */}
                    <View className="bg-indigo-900 p-6 rounded-2xl mb-6 items-center shadow-lg relative overflow-hidden">
                        <View className="absolute inset-0 bg-blue-600/20" />
                        <View className="w-20 h-20 bg-white rounded-full items-center justify-center mb-3 shadow-md border-2 border-white/50">
                            <FontAwesome5 name="shield-alt" size={40} color="#4F46E5" />
                        </View>
                        <Text className="text-white text-2xl font-bold">{team?.name}</Text>
                        <View className="flex-row items-center mt-1">
                            <FontAwesome5 name="crown" size={12} color="#FBBF24" />
                            <Text className="text-indigo-200 text-xs ml-1 uppercase font-bold">Capitão: {team?.captain?.name || 'Você'}</Text>
                        </View>
                    </View>

                    <View className="flex-row justify-between items-center mb-4 px-1">
                        <Text className="text-lg font-bold text-gray-800 dark:text-white">Jogadores ({players.length})</Text>
                        <TouchableOpacity
                            onPress={() => setModalVisible(true)}
                            className="flex-row items-center bg-indigo-100 dark:bg-indigo-900/30 px-4 py-2 rounded-full active:opacity-80"
                        >
                            <FontAwesome5 name="plus" size={12} color="#4F46E5" />
                            <Text className="text-indigo-700 dark:text-indigo-400 font-bold text-xs ml-2 uppercase">Adicionar</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={players}
                        keyExtractor={item => String(item.id)}
                        renderItem={({ item }) => (
                            <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 flex-row items-center border border-gray-100 dark:border-gray-700 shadow-sm">
                                <View className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center mr-3 overflow-hidden">
                                    {item.photo_url ? (
                                        <Image source={{ uri: item.photo_url }} className="w-full h-full" resizeMode="cover" />
                                    ) : (
                                        <Text className="font-bold text-gray-500 dark:text-gray-400 text-xs">{item.pivot?.number || item.number || '#'}</Text>
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-800 dark:text-white">{item.name}</Text>
                                    <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase">{item.pivot?.position || item.position}</Text>
                                </View>
                                <View className="flex-row items-center gap-2">
                                    {item.pivot?.is_approved ? (
                                        <MaterialIcons name="check-circle" size={20} color="#10B981" />
                                    ) : (
                                        <MaterialIcons name="schedule" size={20} color="#F59E0B" />
                                    )}
                                    <TouchableOpacity className="p-2">
                                        <FontAwesome5 name="trash" size={14} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                        contentContainerStyle={{ paddingBottom: 20 }}
                        ListEmptyComponent={
                            <View className="py-10 items-center">
                                <Text className="text-gray-400">Nenhum jogador encontrado.</Text>
                            </View>
                        }
                    />
                </View>
            )}

            {/* Modal Add Player */}
            <Modal visible={modalVisible} animationType="slide" transparent statusBarTranslucent>
                <View className="flex-1 bg-black/60 justify-end sm:justify-center items-center">
                    <View className="bg-white dark:bg-gray-800 rounded-t-3xl sm:rounded-2xl p-6 w-full max-w-md h-[80%] sm:h-auto">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-800 dark:text-white">Adicionar Jogador</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                                <MaterialIcons name="close" size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View className="space-y-4">
                                <TouchableOpacity onPress={handlePickImage} className="self-center mb-2">
                                    <View className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center border-2 border-indigo-100 dark:border-gray-600 overflow-hidden">
                                        {playerPhoto ? (
                                            <Image source={{ uri: playerPhoto }} className="w-full h-full" />
                                        ) : (
                                            <FontAwesome5 name="camera" size={24} color="#9CA3AF" />
                                        )}
                                    </View>
                                    <Text className="text-center text-indigo-600 dark:text-indigo-400 text-xs font-bold mt-2">Escolher Foto / Doc</Text>
                                </TouchableOpacity>

                                <View>
                                    <Text className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 ml-1">Nome Completo *</Text>
                                    <TextInput
                                        className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-gray-900 dark:text-white"
                                        placeholder="Ex: João da Silva"
                                        placeholderTextColor="#9CA3AF"
                                        value={newPlayerName}
                                        onChangeText={setNewPlayerName}
                                    />
                                </View>

                                <View className="flex-row gap-3">
                                    <View className="flex-1">
                                        <Text className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 ml-1">Posição *</Text>
                                        <TextInput
                                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-gray-900 dark:text-white"
                                            placeholder="Ex: Goleiro"
                                            placeholderTextColor="#9CA3AF"
                                            value={newPlayerPos}
                                            onChangeText={setNewPlayerPos}
                                        />
                                    </View>
                                    <View className="w-24">
                                        <Text className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 ml-1">Número</Text>
                                        <TextInput
                                            className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-gray-900 dark:text-white"
                                            placeholder="10"
                                            placeholderTextColor="#9CA3AF"
                                            keyboardType="numeric"
                                            value={newPlayerNum}
                                            onChangeText={setNewPlayerNum}
                                        />
                                    </View>
                                </View>

                                <View>
                                    <Text className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 ml-1">CPF (Opcional)</Text>
                                    <TextInput
                                        className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-gray-900 dark:text-white"
                                        placeholder="000.000.000-00"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="numeric"
                                        value={newPlayerCpf}
                                        onChangeText={setNewPlayerCpf}
                                    />
                                </View>

                                <View>
                                    <Text className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1 ml-1">Email (Opcional)</Text>
                                    <TextInput
                                        className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-3 text-gray-900 dark:text-white"
                                        placeholder="email@atleta.com"
                                        placeholderTextColor="#9CA3AF"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        value={newPlayerEmail}
                                        onChangeText={setNewPlayerEmail}
                                    />
                                </View>
                            </View>
                        </ScrollView>

                        <View className="flex-row gap-3 mt-6">
                            <TouchableOpacity
                                onPress={() => setModalVisible(false)}
                                className="flex-1 bg-gray-100 dark:bg-gray-700 p-4 rounded-xl items-center"
                            >
                                <Text className="font-bold text-gray-600 dark:text-gray-300">Cancelar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleAddPlayer}
                                disabled={adding}
                                className="flex-1 bg-indigo-600 p-4 rounded-xl items-center shadow-lg shadow-indigo-200 dark:shadow-none"
                            >
                                {adding ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="font-bold text-white">Confirmar</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

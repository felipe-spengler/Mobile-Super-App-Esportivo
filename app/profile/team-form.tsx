import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import '../../global.css';

export default function TeamFormScreen() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [city, setCity] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        if (!name.trim() || !city.trim()) {
            Alert.alert('Atenção', 'Preencha todos os campos.');
            return;
        }

        setLoading(true);
        try {
            // Assume POST /my-teams logic exists or matches Web intention
            await api.post('/my-teams', { name, city });

            Alert.alert('Sucesso', 'Equipe criada com sucesso!');
            router.back();

        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível criar a equipe. Tente novamente.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-white dark:bg-gray-800 pt-12 pb-4 px-4 shadow-sm z-10 flex-row items-center border-b border-gray-100 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1 -ml-1 rounded-full active:bg-gray-100 dark:active:bg-gray-700">
                    <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 dark:text-white">Criar Nova Equipe</Text>
            </View>

            <ScrollView className="p-4">
                <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                    <View className="w-16 h-16 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FontAwesome5 name="shield-alt" size={32} color="#4F46E5" />
                    </View>
                    <Text className="text-center text-gray-500 dark:text-gray-400 text-sm mb-6 px-4">
                        Crie seu time para participar dos campeonatos. Você será o capitão.
                    </Text>

                    <View className="space-y-4">
                        <View>
                            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Nome do Time</Text>
                            <TextInput
                                value={name}
                                onChangeText={setName}
                                placeholder="Ex: Galáticos FC"
                                placeholderTextColor="#9CA3AF"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                            />
                        </View>
                        <View className="mt-4">
                            <Text className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Cidade Base</Text>
                            <TextInput
                                value={city}
                                onChangeText={setCity}
                                placeholder="Ex: Toledo"
                                placeholderTextColor="#9CA3AF"
                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                            />
                        </View>

                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={loading}
                            className={`w-full bg-indigo-600 py-4 rounded-xl shadow-lg mt-6 flex-row items-center justify-center gap-2 ${loading ? 'opacity-70' : ''}`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <FontAwesome5 name="save" size={16} color="white" />
                            )}
                            <Text className="text-white font-bold text-lg">
                                {loading ? 'Criando...' : 'Criar Equipe'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

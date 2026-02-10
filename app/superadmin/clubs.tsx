import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import '../../global.css';

export default function SuperAdminClubsList() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [clubs, setClubs] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadClubs();
    }, []);

    async function loadClubs() {
        try {
            setLoading(true);
            const response = await api.get('/superadmin/clubs');
            setClubs(response.data);
        } catch (error) {
            console.error(error);
            // Alert.alert('Erro', 'Não foi possível carregar os clubes');
            // Mock data for development if API fails
            setClubs([
                { id: 1, name: 'Clube Exemplo A', city: 'São Paulo', active: true },
                { id: 2, name: 'Associação B', city: 'Rio de Janeiro', active: true },
                { id: 3, name: 'Liga C', city: 'Curitiba', active: false },
            ]);
        } finally {
            setLoading(false);
        }
    }

    const filteredClubs = clubs.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderItem = ({ item }: { item: any }) => (
        <View className="bg-white dark:bg-gray-800 rounded-xl mb-3 shadow-sm border border-gray-100 dark:border-gray-700">
            <View className="p-4 flex-row items-center">
                <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${item.active ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                    <FontAwesome5 name="building" size={20} color={item.active ? '#4F46E5' : '#9CA3AF'} />
                </View>
                <View className="flex-1">
                    <Text className="text-gray-800 dark:text-gray-100 font-bold text-base">
                        {item.name}
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs">
                        {item.city || 'Cidade não informada'} • {item.active ? 'Ativo' : 'Inativo'}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/superadmin/club-form', params: { id: item.id } } as any)}
                    className="p-2"
                >
                    <MaterialIcons name="edit" size={24} color="#4F46E5" />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 border-b border-gray-100 dark:border-gray-700 shadow-sm">
                <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center">
                        <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                            <MaterialIcons name="arrow-back" size={24} color="#374151" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-800 dark:text-white ml-2">Gerenciar Clubes</Text>
                    </View>
                    <TouchableOpacity
                        className="bg-indigo-600 px-4 py-2 rounded-lg flex-row items-center"
                        onPress={() => router.push('/superadmin/club-form' as any)}
                    >
                        <FontAwesome5 name="plus" size={12} color="white" />
                        <Text className="text-white font-bold text-xs ml-2">NOVO</Text>
                    </TouchableOpacity>
                </View>

                <TextInput
                    className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-800 dark:text-white"
                    placeholder="Buscar clube..."
                    placeholderTextColor="#999"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : (
                <FlatList
                    data={filteredClubs}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <Text className="text-gray-400 mt-4 text-center">Nenhum clube encontrado</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

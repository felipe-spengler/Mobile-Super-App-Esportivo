import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import api from '../src/services/api';
import '../global.css';

export default function ChampionshipsScreen() {
    const { sportId, clubId, sportName } = useLocalSearchParams();
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [loading, setLoading] = useState(true);
    const [championships, setChampionships] = useState([]);

    useEffect(() => {
        async function loadData() {
            try {
                // clubId hardcoded pra 1 por enquanto se não vier
                const cId = clubId || 1;
                const response = await api.get(`/clubs/${cId}/championships`, {
                    params: { sport_id: sportId }
                });
                setChampionships(response.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [sportId]);

    if (loading) {
        return <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900"><ActivityIndicator size="large" color="#00C851" /></View>;
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 shadow-sm flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <FontAwesome5 name="arrow-left" size={20} color={isDark ? '#FFF' : '#333'} />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4 text-gray-800 dark:text-white">
                    {sportName || 'Campeonatos'}
                </Text>
            </View>

            <FlatList
                data={championships}
                keyExtractor={(item: any) => item.id.toString()}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                    <Text className="text-center text-gray-500 dark:text-gray-400 mt-10">Nenhum campeonato encontrado.</Text>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="bg-white dark:bg-gray-800 rounded-xl mb-4 shadow-sm overflow-hidden"
                        onPress={() => {
                            if (item.format === 'racing') {
                                router.push({ pathname: '/race/[id]', params: { id: item.id } } as any);
                            } else {
                                router.push({ pathname: '/championship/[id]', params: { id: item.id } });
                            }
                        }}
                    >
                        <View className="h-2 bg-green-500 w-full" />
                        <View className="p-4">
                            <View className="flex-row justify-between items-start mb-2">
                                <Text className="text-lg font-bold text-gray-800 dark:text-white flex-1">{item.name}</Text>
                                <View className={`px-2 py-1 rounded-md ${item.status === 'registrations_open' ? 'bg-green-100 dark:bg-green-900/40' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                    <Text className={`text-xs font-bold ${item.status === 'registrations_open' ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-300'}`}>
                                        {item.status === 'registrations_open' ? 'INSCRIÇÕES ABERTAS' : 'EM ANDAMENTO'}
                                    </Text>
                                </View>
                            </View>

                            <Text className="text-gray-500 dark:text-gray-400 text-sm mb-4" numberOfLines={2}>
                                {item.description || 'Sem descrição.'}
                            </Text>

                            <View className="flex-row items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                                <Text className="text-xs text-gray-400 dark:text-gray-500">
                                    De {new Date(item.start_date).toLocaleDateString()} a {new Date(item.end_date).toLocaleDateString()}
                                </Text>
                                <FontAwesome5 name="chevron-right" size={12} color={isDark ? '#666' : '#ccc'} />
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

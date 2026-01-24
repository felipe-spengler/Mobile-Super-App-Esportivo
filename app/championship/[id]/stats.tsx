import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import api from '../../../src/services/api';
import '../../../global.css';

export default function ChampionshipStatsScreen() {
    const { id, type, title, category_id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any[]>([]);

    const displayTitle = Array.isArray(title) ? title[0] : title || 'Estatísticas';

    useEffect(() => {
        api.get(`/championships/${id}/stats`, { params: { type, category_id } })
            .then(res => setStats(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id, type, category_id]);

    const renderItem = ({ item, index }: any) => (
        <View className="flex-row p-4 items-center bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <Text className="w-8 font-bold text-gray-500 text-lg">{index + 1}</Text>

            <View className="w-10 h-10 bg-gray-200 rounded-full mr-3 items-center justify-center overflow-hidden">
                {item.photo_url ? (
                    <Image source={{ uri: item.photo_url }} className="w-10 h-10" />
                ) : (
                    <FontAwesome5 name="user" size={16} color="#999" />
                )}
            </View>

            <View className="flex-1">
                <Text className="font-bold text-gray-800 dark:text-gray-100 text-base">{item.player_name}</Text>
                <Text className="text-gray-500 text-xs">{item.team_name}</Text>
            </View>

            <View className="bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-lg">
                <Text className="font-bold text-blue-600 dark:text-blue-300 text-lg">{item.value}</Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 shadow-sm flex-row items-center border-b border-gray-100 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <FontAwesome5 name="arrow-left" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4 text-gray-800 dark:text-white">{displayTitle}</Text>
            </View>

            {loading ? <ActivityIndicator size="large" className="mt-10" color="#3B82F6" /> : (
                <FlatList
                    data={stats}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <View className="flex-1 justify-center items-center mt-20 p-8">
                            <FontAwesome5 name="clipboard-list" size={50} color="#E5E7EB" />
                            <Text className="text-gray-500 mt-4 text-center">
                                Nenhum dado registrado para {displayTitle.toLowerCase()} até o momento.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

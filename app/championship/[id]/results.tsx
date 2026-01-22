import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import api from '../../../src/services/api';
import '../../../global.css';

export default function ResultsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<any[]>([]);

    useEffect(() => {
        api.get(`/championships/${id}/race-results`)
            .then(res => setResults(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const renderItem = ({ item }: any) => (
        <View className="flex-row p-4 items-center bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
            <View className={`w-10 h-10 rounded-full items-center justify-center ${item.position_general <= 3 ? 'bg-yellow-100 dark:bg-yellow-900' : 'bg-gray-100 dark:bg-gray-700'}`}>
                <Text className={`font-bold ${item.position_general <= 3 ? 'text-yellow-600 dark:text-yellow-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {item.position_general}º
                </Text>
            </View>
            <View className="flex-1 ml-4">
                <Text className="font-bold text-gray-800 dark:text-gray-100 text-lg">{item.name}</Text>
                <Text className="text-gray-500 text-sm">Categoria: {item.category_name || 'Geral'}</Text>
            </View>
            <Text className="font-mono font-bold text-blue-600 dark:text-blue-400 text-lg">{item.time}</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 shadow-sm flex-row items-center border-b border-gray-200 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <FontAwesome5 name="arrow-left" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4 text-gray-800 dark:text-white">Resultados</Text>
            </View>

            {loading ? <ActivityIndicator size="large" className="mt-10" color="#3B82F6" /> : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={<Text className="text-center mt-10 text-gray-500">Nenhum resultado encontrado.</Text>}
                />
            )}
        </View>
    );
}

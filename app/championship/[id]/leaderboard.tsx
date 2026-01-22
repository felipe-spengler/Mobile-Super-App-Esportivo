import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import api from '../../../src/services/api';
import '../../../global.css';

export default function LeaderboardScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [table, setTable] = useState<any[]>([]);
    const [sportSlug, setSportSlug] = useState('futebol');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [champRes, tableRes] = await Promise.all([
                    api.get(`/championships/${id}`),
                    api.get(`/championships/${id}/leaderboard`)
                ]);

                setSportSlug(champRes.data.sport?.slug || 'futebol');
                setTable(tableRes.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const isVolei = sportSlug === 'volei';

    const renderItem = ({ item, index }: any) => (
        <View className={`flex-row p-3 items-center border-b border-gray-100 dark:border-gray-700 ${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'}`}>
            <Text className="w-8 text-center font-bold text-gray-700 dark:text-gray-300">{item.rank || index + 1}</Text>
            <Text className="flex-1 font-medium text-gray-800 dark:text-gray-100 ml-2" numberOfLines={1}>{item.name}</Text>
            <Text className="w-8 text-center font-bold text-gray-900 dark:text-white">{item.stats?.points ?? 0}</Text>
            <Text className="w-8 text-center text-gray-500">{item.stats?.played ?? 0}</Text>
            <Text className="w-8 text-center text-green-600 font-bold">{item.stats?.wins ?? 0}</Text>
            {!isVolei && <Text className="w-8 text-center text-gray-500">{item.stats?.draws ?? 0}</Text>}
            <Text className="w-8 text-center text-red-500">{item.stats?.losses ?? 0}</Text>
            <Text className="w-8 text-center text-gray-600 dark:text-gray-400 text-xs">{item.stats?.goals_for ?? 0}</Text>
            <Text className="w-8 text-center text-gray-600 dark:text-gray-400 text-xs">{item.stats?.goals_against ?? 0}</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 shadow-sm flex-row items-center border-b border-gray-200 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <FontAwesome5 name="arrow-left" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4 text-gray-800 dark:text-white">Classificação</Text>
            </View>

            <View className="bg-blue-100 dark:bg-blue-900/40 flex-row p-3 border-b border-blue-200 dark:border-blue-800">
                <Text className="w-8 text-center font-bold text-blue-800 dark:text-blue-200">#</Text>
                <Text className="flex-1 font-bold text-blue-800 dark:text-blue-200 ml-2">Time</Text>
                <Text className="w-8 text-center font-bold text-blue-800 dark:text-blue-200" title="Pontos">P</Text>
                <Text className="w-8 text-center font-bold text-blue-800 dark:text-blue-200" title="Jogos">J</Text>
                <Text className="w-8 text-center font-bold text-blue-800 dark:text-blue-200" title="Vitórias">V</Text>
                {!isVolei && <Text className="w-8 text-center font-bold text-blue-800 dark:text-blue-200" title="Empates">E</Text>}
                <Text className="w-8 text-center font-bold text-blue-800 dark:text-blue-200" title="Derrotas">D</Text>
                <Text className="w-8 text-center font-bold text-blue-800 dark:text-blue-200 text-xs" title={isVolei ? "Sets Pró" : "Gols Pró"}>{isVolei ? 'SP' : 'GP'}</Text>
                <Text className="w-8 text-center font-bold text-blue-800 dark:text-blue-200 text-xs" title={isVolei ? "Sets Contra" : "Gols Contra"}>{isVolei ? 'SC' : 'GC'}</Text>
            </View>

            {loading ? <ActivityIndicator size="large" className="mt-10" color="#3B82F6" /> : (
                <FlatList
                    data={table}
                    keyExtractor={(item) => (item.id || Math.random()).toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={<Text className="text-center mt-10 text-gray-500">Tabela não disponível.</Text>}
                />
            )}
        </View>
    );
}

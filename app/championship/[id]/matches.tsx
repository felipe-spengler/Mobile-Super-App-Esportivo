import { useEffect, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import api from '../../../src/services/api';
import '../../../global.css';

export default function ChampionshipMatchesScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState<any[]>([]);

    useEffect(() => {
        async function loadMatches() {
            try {
                const response = await api.get(`/championships/${id}/matches`);
                setMatches(response.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        loadMatches();
    }, [id]);

    const groupedMatches = matches.reduce((acc: any, match: any) => {
        const round = match.round_name || (match.round_number ? `Rodada ${match.round_number}` : 'Jogos');
        if (!acc[round]) acc[round] = [];
        acc[round].push(match);
        return acc;
    }, {});

    const sections = Object.keys(groupedMatches).map(title => ({
        title,
        data: groupedMatches[title]
    }));

    if (loading) return <ActivityIndicator className="flex-1 mt-20" size="large" color="#00C851" />;

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 shadow-sm flex-row items-center border-b border-gray-100 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <FontAwesome5 name="arrow-left" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4 text-gray-800 dark:text-white">Jogos</Text>
            </View>

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 16 }}
                renderSectionHeader={({ section: { title } }) => (
                    <View className="bg-gray-200 dark:bg-gray-700 px-4 py-2 rounded-lg mb-3 mt-2">
                        <Text className="font-bold text-gray-700 dark:text-gray-200 uppercase text-xs">{title}</Text>
                    </View>
                )}
                renderItem={({ item: match }) => (
                    <TouchableOpacity
                        className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center justify-between"
                        onPress={() => router.push({ pathname: '/match-detail', params: { id: match.id } })}
                    >
                        {/* Time Casa */}
                        <View className="flex-1 flex-row items-center justify-end">
                            <Text className="font-bold text-gray-800 dark:text-white mr-2 text-right text-sm">{match.home_team?.name || 'TBD'}</Text>
                            <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 items-center justify-center">
                                <Text className="text-xs font-bold text-gray-500 dark:text-gray-300">{match.home_team?.name?.substring(0, 1) || '?'}</Text>
                            </View>
                        </View>

                        {/* Placar Central */}
                        <View className="mx-3 items-center bg-gray-50 dark:bg-gray-900 px-3 py-1 rounded-lg min-w-[60px]">
                            {match.status === 'scheduled' ? (
                                <Text className="text-xs text-gray-500 dark:text-gray-400 font-bold">VS</Text>
                            ) : (
                                <Text className="text-lg font-black text-gray-900 dark:text-white">
                                    {match.home_score} <Text className="text-gray-300 dark:text-gray-600">-</Text> {match.away_score}
                                </Text>
                            )}
                            {match.status === 'live' && (
                                <Text className="text-[10px] text-red-500 font-bold uppercase mt-1">• AO VIVO</Text>
                            )}
                        </View>

                        {/* Time Visitante */}
                        <View className="flex-1 flex-row items-center justify-start">
                            <View className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 items-center justify-center">
                                <Text className="text-xs font-bold text-gray-500 dark:text-gray-300">{match.away_team?.name?.substring(0, 1) || '?'}</Text>
                            </View>
                            <Text className="font-bold text-gray-800 dark:text-white ml-2 text-sm">{match.away_team?.name || 'TBD'}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <Text className="text-center text-gray-500 mt-10">Nenhum jogo encontrado.</Text>
                )}
            />
        </View>
    );
}

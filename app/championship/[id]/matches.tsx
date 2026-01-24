import { useEffect, useState } from 'react';
import { View, Text, SectionList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import api from '../../../src/services/api';
import '../../../global.css';

export default function ChampionshipMatchesScreen() {
    const { id, category_id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [matches, setMatches] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('scheduled'); // scheduled, finished, all

    useEffect(() => {
        async function loadMatches() {
            try {
                const response = await api.get(`/championships/${id}/matches`, {
                    params: { category_id }
                });
                setMatches(response.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        loadMatches();
    }, [id]);

    const filteredMatches = matches.filter(m => {
        if (activeTab === 'all') return true;
        if (activeTab === 'scheduled') return ['scheduled', 'expected', 'live', 'ongoing'].includes(m.status);
        if (activeTab === 'finished') return ['finished', 'canceled'].includes(m.status);
        return true;
    });

    const groupedMatches = filteredMatches.reduce((acc: any, match: any) => {
        // Group by Date since Round is missing
        const dateObj = new Date(match.start_time);
        const dateStr = dateObj.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: '2-digit' });
        // E.g. "Sáb, 01/02"
        const groupTitle = match.round_name || dateStr.toUpperCase();

        if (!acc[groupTitle]) acc[groupTitle] = [];
        acc[groupTitle].push(match);
        return acc;
    }, {});

    const sections = Object.keys(groupedMatches).map(title => ({
        title,
        data: groupedMatches[title]
    }));

    const TabButton = ({ title, value, active }: any) => (
        <TouchableOpacity
            onPress={() => setActiveTab(value)}
            className={`px-4 py-2 rounded-full mr-2 ${active ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
            <Text className={`${active ? 'text-white font-bold' : 'text-gray-600 dark:text-gray-300'}`}>{title}</Text>
        </TouchableOpacity>
    );

    if (loading) return <ActivityIndicator className="flex-1 mt-20" size="large" color="#00C851" />;

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-white dark:bg-gray-800 pt-12 pb-4 shadow-sm border-b border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center px-4 mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <FontAwesome5 name="arrow-left" size={20} color="#3B82F6" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold ml-4 text-gray-800 dark:text-white">Jogos</Text>
                </View>

                {/* Tabs */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4">
                    <TabButton title="Próximos" value="scheduled" active={activeTab === 'scheduled'} />
                    <TabButton title="Finalizados" value="finished" active={activeTab === 'finished'} />
                    <TabButton title="Todos" value="all" active={activeTab === 'all'} />
                </ScrollView>
            </View>

            <SectionList
                sections={sections}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 16 }}
                stickySectionHeadersEnabled={false}
                renderSectionHeader={({ section: { title } }) => (
                    <View className="flex-row items-center mb-3 mt-2">
                        <View className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-md">
                            <Text className="font-bold text-blue-700 dark:text-blue-200 text-xs">{title}</Text>
                        </View>
                        <View className="h-[1px] bg-gray-200 dark:bg-gray-700 flex-1 ml-3" />
                    </View>
                )}
                renderItem={({ item: match }) => (
                    <TouchableOpacity
                        className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 shadow-sm border border-gray-100 dark:border-gray-700"
                        onPress={() => router.push({ pathname: '/match-detail', params: { id: match.id } })}
                    >
                        <View className="flex-row items-center justify-between mb-2">
                            <Text className="text-[10px] text-gray-400 uppercase font-bold">{match.location || 'Local a definir'}</Text>
                            {match.status === 'live' || match.status === 'ongoing' ? (
                                <View className="bg-red-100 px-2 py-0.5 rounded">
                                    <Text className="text-[10px] text-red-600 font-bold">AO VIVO</Text>
                                </View>
                            ) : match.status === 'finished' ? (
                                <View className="bg-gray-100 px-2 py-0.5 rounded">
                                    <Text className="text-[10px] text-gray-500 font-bold">ENCERRADO</Text>
                                </View>
                            ) : (
                                <View className="bg-green-50 px-2 py-0.5 rounded">
                                    <Text className="text-[10px] text-green-600 font-bold">AGENDADO</Text>
                                </View>
                            )}
                        </View>

                        <View className="flex-row items-center justify-between">
                            {/* Time Casa */}
                            <View className="flex-1 flex-row items-center justify-end">
                                <Text className="font-bold text-gray-800 dark:text-white mr-3 text-right text-sm flex-wrap" numberOfLines={2}>
                                    {match.home_team?.name || 'TBD'}
                                </Text>
                                <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-600 items-center justify-center border border-gray-100 dark:border-gray-500">
                                    {match.home_team?.logo_url ? (
                                        <Text className="text-[8px]">LOG</Text> // Image would go here
                                    ) : (
                                        <Text className="text-sm font-bold text-gray-500 dark:text-gray-300">{match.home_team?.name?.substring(0, 1) || '?'}</Text>
                                    )}
                                </View>
                            </View>

                            {/* Placar Central */}
                            <View className="mx-2 w-16 items-center">
                                {match.status === 'scheduled' || match.status === 'expected' ? (
                                    <View className="items-center">
                                        <Text className="text-[10px] text-gray-500 font-bold mb-1">
                                            {new Date(match.start_time).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                        </Text>
                                        <Text className="text-xs text-gray-800 dark:text-gray-200 font-bold bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                            {new Date(match.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text className="text-xl font-black text-gray-900 dark:text-white tracking-widest">
                                        {match.home_score} - {match.away_score}
                                    </Text>
                                )}
                            </View>

                            {/* Time Visitante */}
                            <View className="flex-1 flex-row items-center justify-start">
                                <View className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-600 items-center justify-center border border-gray-100 dark:border-gray-500">
                                    <Text className="text-sm font-bold text-gray-500 dark:text-gray-300">{match.away_team?.name?.substring(0, 1) || '?'}</Text>
                                </View>
                                <Text className="font-bold text-gray-800 dark:text-white ml-3 text-sm flex-wrap" numberOfLines={2}>
                                    {match.away_team?.name || 'TBD'}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={() => (
                    <View className="items-center justify-center py-10">
                        <FontAwesome5 name="calendar-times" size={40} color="#CBD5E1" />
                        <Text className="text-center text-gray-400 mt-4">Nenhum jogo encontrado nesta seção.</Text>
                    </View>
                )}
            />
        </View>
    );
}

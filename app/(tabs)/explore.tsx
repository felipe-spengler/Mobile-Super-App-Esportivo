import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import '../../global.css';

export default function ExploreScreen() {
    const router = useRouter();
    const { selectedClub, selectClub } = useAuth();
    const params = useLocalSearchParams();
    const initialSport = params.sport ? String(params.sport) : 'Todos';

    const [sportName, setSportName] = useState(initialSport);
    const [championships, setChampionships] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadChampionships();
    }, [selectedClub, sportName]);

    async function loadChampionships() {
        setLoading(true);
        try {
            // For now, if no club selected, we might want to list 'Featured' or ask to select.
            // But to follow Web logic (which hardcoded 1), we will try to use selectedClub.
            // If no selectedClub, maybe default to 1 or show empty.
            // Better UX: Show ALL championships if possible, or force select.
            // Let's assume we want to show "My Selected Club's" events + maybe others if we had a global endpoint.
            // For parity with Web's "Explore" which acts essentially as "Events List", we use the club context.

            const clubIdToUse = selectedClub?.id || 1; // Fallback to 1 like Web if none selected, or handle empty.

            const res = await api.get(`/clubs/${clubIdToUse}/championships`);

            let filtered = res.data;

            if (sportName && sportName !== 'Todos') {
                filtered = filtered.filter((c: any) => {
                    const s = c.sport?.name || c.sport?.slug || c.sport_name || '';
                    return s.toString().toLowerCase() === sportName.toLowerCase();
                });
            }
            setChampionships(filtered);

        } catch (error) {
            console.error("Erro ao carregar campeonatos", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    const onRefresh = () => {
        setRefreshing(true);
        loadChampionships();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'registrations_open': return { bg: 'bg-green-100', text: 'text-green-700', label: 'Inscrições Abertas', border: 'bg-green-500' };
            case 'finished': return { bg: 'bg-gray-200', text: 'text-gray-600', label: 'Finalizado', border: 'bg-gray-500' };
            case 'upcoming': return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Em Breve', border: 'bg-blue-500' };
            default: return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Em Andamento', border: 'bg-yellow-500' };
        }
    };

    const renderItem = ({ item }: { item: any }) => {
        const status = getStatusColor(item.status);

        return (
            <TouchableOpacity
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4 border border-gray-100 dark:border-gray-700 overflow-hidden active:opacity-90 transition-all"
                onPress={() => {
                    // Navigate to Event Details
                    // Link: item.format === 'racing' ? `/races/${item.id}` : `/events/${item.id}`
                    // Mobile route: app/championship/[id]/index.tsx or app/race/[id].tsx
                    if (item.format === 'racing') {
                        router.push(`/race/${item.id}`);
                    } else {
                        router.push(`/championship/${item.id}`);
                    }
                }}
            >
                {/* Status Strip */}
                <View className={`h-2 ${status.border} w-full`} />

                <View className="p-4">
                    <View className="flex-row justify-between items-start mb-2">
                        <Text className="text-lg font-bold text-gray-900 dark:text-white flex-1 mr-2 leading-tight">
                            {item.name}
                        </Text>
                        <View className={`px-2 py-1 rounded-md ${status.bg} shrink-0`}>
                            <Text className={`text-[10px] font-bold uppercase tracking-wide ${status.text}`}>
                                {status.label}
                            </Text>
                        </View>
                    </View>

                    <Text className="text-gray-500 dark:text-gray-400 text-sm mb-4" numberOfLines={2}>
                        {item.description || 'Sem descrição disponível para este campeonato.'}
                    </Text>

                    <View className="flex-row items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3">
                        <View className="flex-col gap-1">
                            {/* Club Name */}
                            {item.club?.name && (
                                <View className="flex-row items-center">
                                    <FontAwesome5 name="trophy" size={12} color="#4F46E5" style={{ marginRight: 6 }} />
                                    <Text className="text-xs text-gray-700 dark:text-gray-300 font-bold">
                                        {item.club.name}
                                    </Text>
                                    {(item.club.city || item.city) && (
                                        <>
                                            <View className="mx-2 w-[1px] h-3 bg-gray-300 dark:bg-gray-600" />
                                            <Text className="text-xs text-gray-500 dark:text-gray-400 font-normal">
                                                {item.club.city || item.city}
                                            </Text>
                                        </>
                                    )}
                                </View>
                            )}

                            {/* Location Fallback */}
                            {!item.club?.name && (item.city || item.location) && (
                                <View className="flex-row items-center">
                                    <MaterialIcons name="location-on" size={14} color="#4F46E5" style={{ marginRight: 4 }} />
                                    <Text className="text-xs text-gray-700 dark:text-gray-300 font-bold">
                                        {item.city || item.location}
                                    </Text>
                                </View>
                            )}

                            {/* Dates */}
                            <View className="flex-row items-center mt-1">
                                <Feather name="calendar" size={12} color="#6366F1" style={{ marginRight: 6 }} />
                                <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                    De {item.start_date ? new Date(item.start_date).toLocaleDateString('pt-BR') : 'TBA'} a {item.end_date ? new Date(item.end_date).toLocaleDateString('pt-BR') : 'TBA'}
                                </Text>
                            </View>
                        </View>

                        <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 shadow-sm flex-row items-center justify-between z-10 border-b border-gray-100 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-gray-700">
                    <MaterialIcons name="arrow-back" size={24} color={loading ? '#ccc' : '#4B5563'} />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 dark:text-white">
                    {sportName !== 'Todos' ? sportName : 'Campeonatos'}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : (
                <FlatList
                    data={championships}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <FontAwesome5 name="trophy" size={48} color="#D1D5DB" />
                            <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center">
                                Nenhum campeonato encontrado.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

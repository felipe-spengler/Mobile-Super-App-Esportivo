import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import '../../global.css';

interface Team {
    id: number;
    name: string;
    logo_url?: string;
    city?: string;
    role?: 'captain' | 'player';
    club?: { name: string };
    primary_color?: string;
}

export default function MyTeamsScreen() {
    const router = useRouter();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTeams() {
            setLoading(true);
            try {
                const response = await api.get('/my-teams');
                // Mock data if empty for testing aesthetics
                if (response.data.length === 0) {
                    // remove this in prod
                    /*
                   setTeams([
                       { id: 1, name: 'Tigrão FC', role: 'captain', club: { name: 'Clube Toledão' }, primary_color: '#F59E0B' },
                       { id: 2, name: 'Vôlei Master', role: 'player', club: { name: 'Clube Toledão' } }
                   ]);
                   */
                    setTeams([]);
                } else {
                    setTeams(response.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchTeams();
    }, []);

    const renderItem = ({ item }: { item: Team }) => (
        <TouchableOpacity
            onPress={() => router.push({ pathname: '/manage-roster', params: { teamId: item.id } })}
            className="bg-white dark:bg-gray-800 p-5 rounded-2xl mb-4 shadow-sm border border-gray-100 dark:border-gray-700 active:scale-[0.98] transition-transform"
        >
            <View className="flex-row items-center mb-4">
                <View
                    className="w-14 h-14 rounded-full items-center justify-center mr-4 border border-gray-100 dark:border-gray-600 overflow-hidden bg-gray-100 dark:bg-gray-700"
                    style={item.primary_color ? { backgroundColor: item.primary_color } : {}}
                >
                    {item.logo_url ? (
                        <Image source={{ uri: item.logo_url }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <FontAwesome5 name="shield-alt" size={24} color={item.primary_color ? 'white' : '#9CA3AF'} />
                    )}
                </View>

                <View className="flex-1">
                    <Text className="font-bold text-lg text-gray-800 dark:text-white leading-tight">{item.name}</Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-xs font-medium uppercase tracking-wide">
                        {item.city || item.club?.name || 'Clube'}
                    </Text>
                </View>

                <TouchableOpacity className="p-2">
                    <Feather name="more-horizontal" size={24} color="#D1D5DB" />
                </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                <View className={`px-2 py-1 rounded-md ${item.role === 'captain' ? 'bg-indigo-100 dark:bg-indigo-900/30' : 'bg-green-100 dark:bg-green-900/30'}`}>
                    <Text className={`text-[10px] font-bold uppercase ${item.role === 'captain' ? 'text-indigo-700 dark:text-indigo-400' : 'text-green-700 dark:text-green-400'}`}>
                        {item.role === 'captain' ? 'Capitão' : 'Atleta'}
                    </Text>
                </View>

                <View className="flex-row items-center gap-1">
                    <FontAwesome5 name="users" size={12} color="#6B7280" />
                    <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium ml-1">Ver elenco</Text>
                    <Feather name="chevron-right" size={14} color="#9CA3AF" />
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-white dark:bg-gray-800 pt-12 pb-4 px-6 shadow-sm border-b border-gray-100 dark:border-gray-700 flex-row items-center justify-between sticky top-0 z-10">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1 -ml-1">
                        <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800 dark:text-white">Meus Times</Text>
                </View>

                <TouchableOpacity
                    className="bg-indigo-50 dark:bg-indigo-900/30 px-3 py-2 rounded-lg flex-row items-center gap-2"
                    onPress={() => router.push('/profile/team-form')} // New Route for Create
                >
                    <FontAwesome5 name="plus" size={12} color="#4F46E5" />
                    <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">Criar Time</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : (
                <FlatList
                    data={teams}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="items-center py-20 bg-white dark:bg-gray-800 mx-4 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                            <View className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                                <FontAwesome5 name="users-slash" size={24} color="#9CA3AF" />
                            </View>
                            <Text className="text-lg font-bold text-gray-800 dark:text-white mb-1">Você não possui times</Text>
                            <Text className="text-gray-500 dark:text-gray-400 text-sm text-center px-6">Crie um time para participar de campeonatos ou aguarde ser convidado.</Text>

                            <TouchableOpacity
                                className="mt-6 bg-indigo-600 px-6 py-3 rounded-xl shadow-md shadow-indigo-200"
                                onPress={() => router.push('/profile/team-form')}
                            >
                                <Text className="text-white font-bold">Criar Meu Primeiro Time</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}
        </View>
    );
}

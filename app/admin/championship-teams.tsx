import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import '../../global.css';

export default function ChampionshipTeamsScreen() {
    const router = useRouter();
    const { championshipId, categoryId } = useLocalSearchParams();
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadTeams();
    }, [championshipId, categoryId]);

    async function loadTeams() {
        try {
            // Adjust endpoint as per Laravel routes. Assuming /admin/championships/{id}/teams returns all, filtering by category if needed
            // Or /inscriptions endpoint
            const response = await api.get(`/admin/championships/${championshipId}/teams`, { params: { category_id: categoryId } });
            setTeams(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusChange(teamId: number, status: 'approved' | 'rejected') {
        try {
            // Update inscription status
            await api.put(`/admin/inscriptions/${teamId}/status`, { status });
            loadTeams(); // Refresh
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar o status.');
        }
    }

    if (loading) return <View className="flex-1 justify-center items-center"><ActivityIndicator color="#4F46E5" /></View>;

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="flex-row items-center justify-between p-4 pt-12 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <MaterialIcons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 dark:text-white">Times Inscritos</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView className="p-4">
                {teams.length === 0 ? (
                    <View className="items-center justify-center p-10">
                        <FontAwesome5 name="users" size={48} color="#D1D5DB" />
                        <Text className="text-gray-500 mt-4">Nenhum time inscrito nesta categoria.</Text>
                    </View>
                ) : (
                    teams.map(team => (
                        <View key={team.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 border border-gray-100 dark:border-gray-700 shadow-sm">
                            <View className="flex-row items-center mb-4">
                                <View className="w-12 h-12 bg-gray-100 rounded-full mr-3 border border-gray-200 overflow-hidden items-center justify-center">
                                    {team.logo_url ? (
                                        <Image source={{ uri: team.logo_url }} className="w-full h-full" />
                                    ) : (
                                        <FontAwesome5 name="shield-alt" size={20} color="#9CA3AF" />
                                    )}
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-lg text-gray-800 dark:text-white">{team.name}</Text>
                                    <Text className="text-gray-500 text-xs">Capitão ou Responsável: {team.captain_name || 'N/A'}</Text>
                                </View>
                                <View className={`px-2 py-1 rounded text-xs font-bold ${team.status === 'approved' ? 'bg-green-100 text-green-700' : team.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                    <Text className={team.status === 'approved' ? 'text-green-700' : team.status === 'rejected' ? 'text-red-700' : 'text-yellow-700'}>
                                        {team.status === 'approved' ? 'APROVADO' : team.status === 'rejected' ? 'REJEITADO' : 'PENDENTE'}
                                    </Text>
                                </View>
                            </View>

                            {/* Actions */}
                            <View className="flex-row gap-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                                {team.status !== 'approved' && (
                                    <TouchableOpacity
                                        onPress={() => handleStatusChange(team.id, 'approved')}
                                        className="flex-1 bg-green-600 py-2 rounded-lg items-center flex-row justify-center"
                                    >
                                        <MaterialIcons name="check" size={16} color="white" />
                                        <Text className="text-white font-bold ml-1">Aprovar</Text>
                                    </TouchableOpacity>
                                )}
                                {team.status !== 'rejected' && (
                                    <TouchableOpacity
                                        onPress={() => handleStatusChange(team.id, 'rejected')}
                                        className="flex-1 bg-red-500 py-2 rounded-lg items-center flex-row justify-center"
                                    >
                                        <MaterialIcons name="close" size={16} color="white" />
                                        <Text className="text-white font-bold ml-1">Rejeitar</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={() => router.push({ pathname: '/admin/team-detail/[id]', params: { id: team.id } })}
                                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg items-center justify-center"
                                >
                                    <MaterialIcons name="visibility" size={20} color="#6B7280" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

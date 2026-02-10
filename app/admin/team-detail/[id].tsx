import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import '../../global.css';

export default function TeamDetailsScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [team, setTeam] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [id]);

    async function loadData() {
        try {
            const response = await api.get(`/admin/teams/${id}`);
            setTeam(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Erro ao carregar time');
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <View className="flex-1 justify-center items-center"><ActivityIndicator color="#4F46E5" /></View>;
    if (!team) return <View className="flex-1 justify-center items-center"><Text>Time não encontrado</Text></View>;

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 pt-12 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <MaterialIcons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 dark:text-white">Detalhes da Equipe</Text>
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/admin/team-form', params: { id } } as any)}
                    className="p-2 -mr-2"
                >
                    <MaterialIcons name="edit" size={24} color="#4F46E5" />
                </TouchableOpacity>
            </View>

            <ScrollView className="p-4">
                {/* Profile Card */}
                <View className="bg-white dark:bg-gray-800 rounded-xl p-6 items-center border border-gray-100 dark:border-gray-700 shadow-sm mb-6">
                    <View
                        className="w-24 h-24 rounded-full items-center justify-center mb-4 border-4 border-gray-100 dark:border-gray-700"
                        style={{ backgroundColor: `${team.primary_color}20` }}
                    >
                        {team.logo_url ? (
                            <Image source={{ uri: team.logo_url }} className="w-full h-full rounded-full" />
                        ) : (
                            <FontAwesome5 name="shield-alt" size={40} color={team.primary_color || '#ccc'} />
                        )}
                    </View>
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{team.name}</Text>
                    <Text className="text-gray-500 mb-4">{team.city || 'Cidade não informada'} • {team.short_name}</Text>

                    <View className="flex-row gap-4 w-full">
                        <View className="flex-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl items-center">
                            <Text className="text-xs text-gray-500 uppercase font-bold">Jogadores</Text>
                            <Text className="text-xl font-bold text-gray-900 dark:text-white">{team.players?.length || 0}</Text>
                        </View>
                        <View className="flex-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl items-center">
                            <Text className="text-xs text-gray-500 uppercase font-bold">Jogos</Text>
                            <Text className="text-xl font-bold text-gray-900 dark:text-white">{team.stats?.matches || 0}</Text>
                        </View>
                        <View className="flex-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl items-center">
                            <Text className="text-xs text-gray-500 uppercase font-bold">Vitórias</Text>
                            <Text className="text-xl font-bold text-green-600">{team.stats?.wins || 0}</Text>
                        </View>
                    </View>
                </View>

                {/* Colors */}
                <View className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm mb-6">
                    <Text className="font-bold text-gray-700 dark:text-gray-300 mb-3">Cores do Uniforme</Text>
                    <View className="flex-row gap-4">
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-full shadow-sm mr-2" style={{ backgroundColor: team.primary_color }} />
                            <Text className="text-gray-600 dark:text-gray-400">Principal</Text>
                        </View>
                        <View className="flex-row items-center">
                            <View className="w-8 h-8 rounded-full shadow-sm border border-gray-200 mr-2" style={{ backgroundColor: team.secondary_color }} />
                            <Text className="text-gray-600 dark:text-gray-400">Secundária</Text>
                        </View>
                    </View>
                </View>

                {/* Roster */}
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-lg font-bold text-gray-800 dark:text-white">Elenco</Text>
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/admin/player-form', params: { teamId: id } } as any)}
                        className="bg-indigo-100 dark:bg-indigo-900 px-3 py-1.5 rounded-lg"
                    >
                        <Text className="text-indigo-700 dark:text-indigo-300 font-bold text-xs">+ Adicionar</Text>
                    </TouchableOpacity>
                </View>

                {(!team.players || team.players.length === 0) ? (
                    <Text className="text-gray-500 text-center py-8">Nenhum jogador cadastrado.</Text>
                ) : (
                    team.players.map((player: any) => (
                        <View key={player.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl mb-3 border border-gray-100 dark:border-gray-700 shadow-sm flex-row items-center">
                            <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-3 overflow-hidden">
                                {player.photo_url ? (
                                    <Image source={{ uri: player.photo_url }} className="w-full h-full" />
                                ) : (
                                    <FontAwesome5 name="user" size={16} color="#9CA3AF" />
                                )}
                            </View>
                            <View className="flex-1">
                                <Text className="font-bold text-gray-800 dark:text-white">{player.name}</Text>
                                <Text className="text-xs text-gray-500">{player.position} • #{player.number}</Text>
                            </View>
                            <TouchableOpacity onPress={() => router.push({ pathname: '/admin/player-form', params: { id: player.id } } as any)} className="p-2">
                                <MaterialIcons name="edit" size={20} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
}

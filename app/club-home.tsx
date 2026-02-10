import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { api } from '../src/services/api';
import '../global.css';

const ALL_SPORTS = [
    { id: 'futebol', name: 'Futebol', icon: 'futbol', color: 'bg-green-600' },
    { id: 'volei', name: 'Vôlei', icon: 'volleyball-ball', color: 'bg-yellow-500' },
    { id: 'corrida', name: 'Corrida', icon: 'running', color: 'bg-blue-500' },
    { id: 'tenis', name: 'Tênis', icon: 'table-tennis', color: 'bg-orange-500' },
    { id: 'lutas', name: 'Lutas', icon: 'fist-raised', color: 'bg-red-600' },
    { id: 'natacao', name: 'Natação', icon: 'swimmer', color: 'bg-cyan-500' },
    { id: 'padel', name: 'Padel', icon: 'table-tennis', color: 'bg-blue-400' },
    { id: 'futebol-7', name: 'Futebol 7', icon: 'futbol', color: 'bg-green-500' },
];

export default function ClubHomeScreen() {
    const router = useRouter();
    const [club, setClub] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const clubSlug = 'toledao'; // Toledao as default for now

    useEffect(() => {
        loadClub();
    }, []);

    async function loadClub() {
        try {
            const res = await api.get(`/clubs/${clubSlug}`);
            setClub(res.data);
        } catch (error) {
            console.error(error);
            // Mock data if failed or offline
            setClub({
                name: 'Clube Toledão',
                city: { name: 'Toledo', state: 'PR' },
                primary_color: '#3730a3',
                secondary_color: '#ffffff',
                active_modalities: ['futebol', 'volei', 'corrida', 'tenis'],
                banner_url: null,
                logo_url: null
            });
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    if (!club) return (
        <View className="flex-1 justify-center items-center">
            <Text className="text-gray-500">Clube não encontrado</Text>
        </View>
    );

    const primaryColor = club.primary_color || '#4f46e5';
    const activeSports = ALL_SPORTS.filter(sport =>
        club.active_modalities?.includes(sport.id)
    );

    return (
        <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" contentContainerStyle={{ paddingBottom: 40 }}>
            {/* Header / Top Bar */}
            <View className="bg-white dark:bg-gray-800 p-6 pt-12 pb-4 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-2xl font-bold text-gray-800 dark:text-white">{club.name}</Text>
                        <View className="flex-row items-center mt-1">
                            <MaterialIcons name="location-on" size={14} color="#6B7280" />
                            <Text className="text-gray-500 dark:text-gray-400 text-sm ml-1">
                                {club.city?.name} - {club.city?.state}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <MaterialIcons name="close" size={20} color="#4B5563" />
                    </TouchableOpacity>
                </View>
            </View>

            <View className="p-4 space-y-6">
                {/* Banner */}
                {club.banner_url ? (
                    <TouchableOpacity
                        className="rounded-3xl h-56 shadow-lg overflow-hidden relative"
                        onPress={() => router.push(`/(tabs)/explore` as any)}
                    >
                        <Image source={{ uri: club.banner_url }} className="w-full h-full" resizeMode="cover" />
                        <View className="absolute inset-0 bg-black/30" />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={{ backgroundColor: primaryColor }}
                        className="rounded-3xl p-8 h-56 items-center justify-center shadow-lg relative overflow-hidden"
                        onPress={() => router.push(`/(tabs)/explore` as any)}
                    >
                        {/* Background Pattern */}
                        <View className="absolute top-[-50] right-[-50] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl" />
                        <View className="absolute bottom-[-50] left-[-50] w-64 h-64 bg-black opacity-10 rounded-full blur-3xl" />

                        <View className="items-center z-10">
                            <View className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-2xl mb-4 border-4 border-white/20">
                                {club.logo_url ? (
                                    <Image source={{ uri: club.logo_url }} className="w-16 h-16" resizeMode="contain" />
                                ) : (
                                    <FontAwesome5 name="trophy" size={32} color={primaryColor} />
                                )}
                            </View>
                            <Text className="text-white text-2xl font-bold text-center shadow-sm">{club.name}</Text>
                            <Text className="text-white/80 text-sm mt-1 font-medium">Bem-vindo ao App Esportivo</Text>
                        </View>
                    </TouchableOpacity>
                )}

                {/* Quick Shortcuts */}
                <View>
                    <Text className="text-lg font-bold text-gray-800 dark:text-white mb-4 pl-1">Acesso Rápido</Text>
                    <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 flex-row justify-around shadow-sm border border-gray-100 dark:border-gray-700">
                        <TouchableOpacity className="items-center gap-2" onPress={() => router.push('/inscription/my-inscriptions')}>
                            <View className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl">
                                <FontAwesome5 name="trophy" size={20} color={primaryColor} />
                            </View>
                            <Text className="text-xs text-gray-600 dark:text-gray-400 font-medium">Inscrições</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="items-center gap-2" onPress={() => router.push('/shop')}>
                            <View className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl">
                                <FontAwesome5 name="shopping-bag" size={20} color={primaryColor} />
                            </View>
                            <Text className="text-xs text-gray-600 dark:text-gray-400 font-medium">Loja</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="items-center gap-2" onPress={() => router.push('/agenda')}>
                            <View className="bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl">
                                <FontAwesome5 name="calendar-alt" size={20} color={primaryColor} />
                            </View>
                            <Text className="text-xs text-gray-600 dark:text-gray-400 font-medium">Agenda</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Modalities Grid */}
                <View>
                    <Text className="text-lg font-bold text-gray-800 dark:text-white mb-4 pl-1">Modalidades</Text>
                    <View className="flex-row flex-wrap justify-between">
                        {activeSports.length > 0 ? (
                            activeSports.map((sport) => (
                                <TouchableOpacity
                                    key={sport.id}
                                    style={{ width: '31%', aspectRatio: 1 }}
                                    className="bg-white dark:bg-gray-800 rounded-2xl items-center justify-center gap-3 shadow-sm border border-gray-100 dark:border-gray-700 mb-4"
                                    onPress={() => router.push({ pathname: '/(tabs)/explore', params: { sport: sport.name } } as any)}
                                >
                                    <View
                                        className="w-10 h-10 rounded-full items-center justify-center shadow-sm"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        <FontAwesome5 name={sport.icon} size={16} color="white" />
                                    </View>
                                    <Text className="text-gray-700 dark:text-gray-300 font-medium text-xs text-center">{sport.name}</Text>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text className="text-gray-500 text-center w-full py-8">Nenhuma modalidade encontrada.</Text>
                        )}
                        {/* Filler items for grid alignment if needed, but flex-wrap space-between handles it okay */}
                    </View>
                </View>

            </View>
        </ScrollView>
    );
}

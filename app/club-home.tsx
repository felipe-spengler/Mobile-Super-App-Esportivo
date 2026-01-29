import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { api } from '../src/services/api';
import '../global.css';

export default function ClubHomeScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const clubName = params.name || 'Clube Toledão';

    const [sports, setSports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSports() {
            try {
                const response = await api.get('/sports');
                setSports(response.data);
            } catch (error) {
                console.error("Erro ao carregar esportes", error);
            } finally {
                setLoading(false);
            }
        }
        loadSports();
    }, []);

    const getSportConfig = (name: string, index: number) => {
        const lower = name.toLowerCase();
        const colors = ['bg-green-600', 'bg-yellow-500', 'bg-blue-500', 'bg-orange-500', 'bg-red-600', 'bg-cyan-500', 'bg-purple-500', 'bg-pink-500'];
        const color = colors[index % colors.length];

        let icon = 'trophy';
        if (lower.includes('futebol') || lower.includes('futsal') || lower.includes('fut7')) icon = 'futbol';
        else if (lower.includes('vôlei') || lower.includes('volei')) icon = 'volleyball-ball';
        else if (lower.includes('basquete')) icon = 'basketball-ball';
        else if (lower.includes('corrida') || lower.includes('atletismo')) icon = 'running';
        else if (lower.includes('tênis') || lower.includes('tenis') || lower.includes('padel')) icon = 'table-tennis';
        else if (lower.includes('natação') || lower.includes('piscina')) icon = 'swimmer';
        else if (lower.includes('luta') || lower.includes('judô') || lower.includes('karate')) icon = 'fist-raised';
        else if (lower.includes('beach')) icon = 'umbrella-beach';

        return { icon, color };
    };

    return (
        <View className="flex-1 bg-gray-100 dark:bg-gray-900">
            <View className="bg-white dark:bg-gray-800 p-6 pt-12 pb-4 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-2xl font-bold text-gray-800 dark:text-white">
                            {clubName}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400">Bem-vindo ao seu clube!</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <MaterialIcons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 20 }}>

                {/* Destaque / Banner */}
                <View className="bg-blue-900 rounded-2xl p-6 mb-6 overflow-hidden relative h-40 justify-center shadow-lg">
                    {/* Background Pattern */}
                    <View className="absolute right-0 top-0 opacity-20">
                        <FontAwesome5 name="medal" size={150} color="white" />
                    </View>

                    <Text className="text-white text-xl font-bold mb-1">Copa Verão 2026</Text>
                    <Text className="text-blue-200 text-sm mb-4">Inscrições abertas até 30/01</Text>

                    <TouchableOpacity className="bg-white px-4 py-2 rounded-full self-start" onPress={() => router.push('/championships')}>
                        <Text className="text-blue-900 font-bold text-xs">VER CAMPEONATOS</Text>
                    </TouchableOpacity>
                </View>

                {/* Atalhos Rápidos */}
                <Text className="text-lg font-bold text-gray-800 dark:text-white mb-4">Acesso Rápido</Text>

                <View className="bg-white dark:bg-gray-800 rounded-xl p-4 flex-row justify-around shadow-sm mb-6">
                    <TouchableOpacity className="items-center" onPress={() => router.push('/wallet')}>
                        <View className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-full mb-2">
                            <MaterialIcons name="qr-code-scanner" size={24} color="#0044cc" />
                        </View>
                        <Text className="text-xs text-gray-600 dark:text-gray-300 font-medium">Carteirinha</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="items-center" onPress={() => router.push('/shop')}>
                        <View className="bg-green-50 dark:bg-green-900/30 p-4 rounded-full mb-2">
                            <MaterialIcons name="shopping-bag" size={24} color="#00cc66" />
                        </View>
                        <Text className="text-xs text-gray-600 dark:text-gray-300 font-medium">Loja</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="items-center">
                        <View className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-full mb-2">
                            <MaterialIcons name="calendar-today" size={24} color="#ff8800" />
                        </View>
                        <Text className="text-xs text-gray-600 dark:text-gray-300 font-medium">Agenda</Text>
                    </TouchableOpacity>
                </View>

                {/* Grid de Esportes */}
                <Text className="text-lg font-bold text-gray-800 dark:text-white mb-4">Modalidades</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#0044cc" />
                ) : (
                    <View className="flex-row flex-wrap justify-between">
                        {sports.map((sport, index) => {
                            const config = getSportConfig(sport.name, index);
                            return (
                                <TouchableOpacity
                                    key={sport.id}
                                    className="w-[31%] aspect-square bg-white dark:bg-gray-800 rounded-xl items-center justify-center mb-4 shadow-sm border border-gray-100 dark:border-gray-700"
                                    onPress={() => router.push({
                                        pathname: '/championships',
                                        params: {
                                            sportId: sport.id,
                                            sportName: sport.name
                                        }
                                    })}
                                >
                                    <View className={`w-12 h-12 ${config.color} rounded-full items-center justify-center mb-2 shadow-sm`}>
                                        <FontAwesome5 name={config.icon as any} size={20} color="white" solid />
                                    </View>
                                    <Text className="text-gray-700 dark:text-gray-300 font-medium text-xs text-center px-1" numberOfLines={1}>
                                        {sport.name}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

            </ScrollView>
        </View>
    );
}

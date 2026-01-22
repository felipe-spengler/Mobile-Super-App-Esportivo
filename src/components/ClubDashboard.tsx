import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import api from '../services/api';
import '../../global.css';

export default function ClubDashboard({ clubSlug, onBack }: { clubSlug: string, onBack: () => void }) {
    const router = useRouter();
    const [details, setDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const response = await api.get(`/clubs/${clubSlug}`);
                setDetails(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        if (clubSlug) loadData();
    }, [clubSlug]);

    const getSportColor = (name: string) => {
        const map: any = {
            'Futebol': 'bg-green-600',
            'Vôlei': 'bg-yellow-500',
            'Corrida': 'bg-blue-500',
            'Tênis': 'bg-orange-500',
            'Lutas': 'bg-red-600',
            'Natação': 'bg-cyan-500',
            'Basquete': 'bg-orange-600',
            'Handebol': 'bg-teal-600'
        };
        return map[name] || 'bg-gray-500';
    };

    if (loading) {
        return (
            <View className="flex-1 bg-gray-100 dark:bg-gray-900 justify-center items-center">
                <ActivityIndicator size="large" color="#3B82F6" />
            </View>
        );
    }

    if (!details) return null;

    const activeSports = details.active_sports_list || [];

    return (
        <View className="flex-1 bg-gray-100 dark:bg-gray-900">
            <View className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
                <View className="p-6 pt-12 pb-4 w-full max-w-5xl self-center flex-row justify-between items-center">
                    <View>
                        <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            {details.name}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400">Bem-vindo ao seu clube!</Text>
                    </View>
                    <TouchableOpacity onPress={onBack} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600">
                        <MaterialIcons name="close" size={24} className="text-gray-600 dark:text-gray-300" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }}>
                <View className="w-full max-w-5xl self-center p-4">

                    {/* Destaque / Banner */}
                    <View className="bg-blue-900 rounded-2xl p-6 mb-6 overflow-hidden relative h-40 md:h-64 justify-center shadow-lg">
                        {/* Background Pattern */}
                        <View className="absolute right-0 top-0 opacity-20 transform translate-x-10 -translate-y-10">
                            <FontAwesome5 name="medal" size={250} color="white" />
                        </View>

                        <Text className="text-white text-xl md:text-4xl font-bold mb-1">Copa Verão 2026</Text>
                        <Text className="text-blue-200 text-sm md:text-lg mb-4">Inscrições abertas até 30/01</Text>

                        <TouchableOpacity className="bg-white px-4 py-2 md:px-6 md:py-3 rounded-full self-start" onPress={() => router.push('/championships')}>
                            <Text className="text-blue-900 font-bold text-xs md:text-base">VER CAMPEONATOS</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Atalhos Rápidos */}
                    <Text className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Acesso Rápido</Text>

                    <View className="bg-white dark:bg-gray-800 rounded-xl p-4 flex-row justify-start gap-10 shadow-sm mb-6">
                        <TouchableOpacity className="items-center w-20 md:w-32" onPress={() => router.push('/agenda')}>
                            <View className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-full mb-2 md:w-20 md:h-20 md:items-center md:justify-center">
                                <MaterialIcons name="calendar-today" size={24} color="#ff8800" />
                            </View>
                            <Text className="text-xs md:text-base text-gray-600 dark:text-gray-300 font-medium text-center">Agenda</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Grid de Esportes */}
                    <Text className="text-lg md:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Modalidades</Text>

                    {activeSports.length > 0 ? (
                        <View className="flex-row flex-wrap justify-between md:justify-start md:gap-6">
                            {activeSports.map((sport: any) => (
                                <TouchableOpacity
                                    key={sport.id}
                                    className="w-[31%] md:w-48 aspect-square bg-white dark:bg-gray-800 rounded-xl items-center justify-center mb-4 shadow-sm border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                    onPress={() => router.push({
                                        pathname: '/championships',
                                        params: {
                                            sportId: sport.id,
                                            sportName: sport.name
                                        }
                                    } as any)}
                                >
                                    <View className={`w-12 h-12 md:w-20 md:h-20 ${getSportColor(sport.name)} rounded-full items-center justify-center mb-2 md:mb-4`}>
                                        <FontAwesome5 name={sport.icon_name || 'futbol'} size={20} color="white" />
                                    </View>
                                    <Text className="text-gray-700 dark:text-gray-200 font-medium text-xs md:text-lg">{sport.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    ) : (
                        <Text className="text-gray-500 italic">Nenhum campeonato ativo no momento.</Text>
                    )}

                </View>
            </ScrollView>
        </View>
    );
}

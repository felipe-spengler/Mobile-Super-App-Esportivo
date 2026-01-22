import { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../../src/services/api';
import '../../../global.css';

export default function RaceHomeScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [champ, setChamp] = useState<any>(null);
    const [race, setRace] = useState<any>(null);

    useEffect(() => {
        async function loadData() {
            try {
                const [champRes, raceRes] = await Promise.all([
                    api.get(`/championships/${id}`),
                    api.get(`/championships/${id}/race`)
                ]);
                setChamp(champRes.data);
                setRace(raceRes.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id]);

    if (loading) return <ActivityIndicator className="flex-1 mt-20" size="large" color="#00C851" />;

    return (
        <View className="flex-1 bg-white dark:bg-gray-900">
            {/* Hero Image */}
            <View className="h-64 bg-gray-900 relative">
                <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1552674605-4694559e5bc7?q=80&w=2673&auto=format&fit=crop' }}
                    className="w-full h-full opacity-60"
                />
                <View className="absolute bottom-0 w-full p-6 bg-gradient-to-t from-black/80 to-transparent">
                    <Text className="text-white text-3xl font-bold uppercase tracking-wide leading-8">{champ?.name}</Text>
                    <View className="flex-row items-center mt-2">
                        <FontAwesome5 name="calendar-alt" size={14} color="#00C851" />
                        <Text className="text-gray-200 ml-2 font-bold">
                            {new Date(champ?.start_date).toLocaleDateString()}
                        </Text>
                        <View className="w-1 h-1 bg-gray-400 rounded-full mx-2" />
                        <FontAwesome5 name="map-marker-alt" size={14} color="#00C851" />
                        <Text className="text-gray-200 ml-2 font-bold">{race?.location_name || 'Local a confirmar'}</Text>
                    </View>
                </View>

                <TouchableOpacity onPress={() => router.back()} className="absolute top-12 left-4 z-10 w-10 h-10 items-center justify-center bg-black/40 rounded-full">
                    <FontAwesome5 name="arrow-left" size={18} color="white" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1">
                {/* Actions Grid */}
                <View className="p-6 -mt-8">
                    <View className="flex-row gap-4 mb-4">
                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/inscription/[eventId]', params: { eventId: id } } as any)}
                            className="flex-1 bg-emerald-600 p-4 rounded-xl items-center shadow-lg transform active:scale-95 transition"
                        >
                            <FontAwesome5 name="running" size={24} color="white" className="mb-2" />
                            <Text className="text-white font-bold uppercase text-xs tracking-wider">Inscrever-se</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push({ pathname: '/race/[id]/results', params: { id: id } } as any)}
                            className="flex-1 bg-blue-600 p-4 rounded-xl items-center shadow-lg transform active:scale-95 transition"
                        >
                            <FontAwesome5 name="trophy" size={24} color="white" className="mb-2" />
                            <Text className="text-white font-bold uppercase text-xs tracking-wider">Resultados</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="flex-1 bg-gray-800 dark:bg-gray-700 p-4 rounded-xl items-center shadow-lg transform active:scale-95 transition"
                        >
                            <FontAwesome5 name="camera" size={24} color="white" className="mb-2" />
                            <Text className="text-white font-bold uppercase text-xs tracking-wider">Galeria</Text>
                        </TouchableOpacity>
                    </View>

                    {/* About */}
                    <View className="mb-8">
                        <Text className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">Sobre o Evento</Text>
                        <Text className="text-gray-600 dark:text-gray-300 leading-6">
                            Prepare-se para o maior desafio do ano! A {champ?.name} traz percursos desafiadores e uma estrutura completa para você superar seus limites. Kit atleta completo, hidratação a cada 3km e medalha finisher para todos que completarem a prova.
                        </Text>
                    </View>

                    {/* Map Placeholder */}
                    <View className="mb-8">
                        <Text className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3">Percurso</Text>
                        <View className="w-full h-48 bg-gray-200 dark:bg-gray-800 rounded-xl items-center justify-center overflow-hidden relative">
                            <Image
                                source={{ uri: 'https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-53.7431,-24.7259,13,0/600x300?access_token=YOUR_TOKEN' }}
                                className="w-full h-full opacity-50"
                            />
                            <View className="absolute items-center">
                                <FontAwesome5 name="map-marked-alt" size={32} color="#666" />
                                <Text className="text-gray-600 dark:text-gray-400 font-bold mt-2">Mapa Interativo (Em Breve)</Text>
                            </View>
                        </View>
                    </View>

                    {/* Organização */}
                    <View className="border-t border-gray-100 dark:border-gray-800 pt-6">
                        <Text className="text-sm text-gray-400 uppercase font-bold mb-4">Organização</Text>
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full mr-4" />
                            <View>
                                <Text className="font-bold text-gray-800 dark:text-gray-100">Run Events Toledo</Text>
                                <Text className="text-xs text-green-600 dark:text-green-400">Verificado</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

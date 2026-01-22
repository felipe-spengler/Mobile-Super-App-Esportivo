import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, SectionList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import api from '../src/services/api';
import '../global.css';
import { useAuth } from '../src/context/AuthContext';

interface Event {
    id: string;
    type: 'match' | 'championship';
    title: string;
    date: string;
    time?: string;
    color?: string;
    details?: any;
}

interface Section {
    title: string;
    data: Event[];
}

export default function AgendaScreen() {
    const router = useRouter();
    const { selectedClub } = useAuth();
    const [loading, setLoading] = useState(true);
    const [sections, setSections] = useState<Section[]>([]);

    useEffect(() => {
        if (selectedClub) {
            loadEvents();
        }
    }, [selectedClub]);

    async function loadEvents() {
        try {
            const response = await api.get(`/clubs/${selectedClub?.id}/calendar`);
            const events: Event[] = response.data;

            // Agrupar por Mês/Ano (ex: "Outubro 2025")
            const grouped = events.reduce((acc: any, event) => {
                const date = new Date(event.date);
                const monthYear = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
                // Capitalizar
                const title = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);

                if (!acc[title]) {
                    acc[title] = [];
                }
                acc[title].push(event);
                return acc;
            }, {});

            const sectionsArray = Object.keys(grouped).map(key => ({
                title: key,
                data: grouped[key]
            }));

            setSections(sectionsArray);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const renderEvent = ({ item }: { item: Event }) => (
        <View className="flex-row mb-4 bg-white p-4 rounded-xl shadow-sm border-l-4" style={{ borderLeftColor: item.color || '#ccc' }}>
            <View className="mr-4 items-center justify-center w-12">
                <Text className="text-gray-500 font-bold text-lg">{new Date(item.date).getDate()}</Text>
                <Text className="text-gray-400 text-xs">{new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'short' }).toUpperCase().replace('.', '')}</Text>
            </View>

            <View className="flex-1 justify-center">
                <Text className="text-gray-800 font-bold text-base">{item.title}</Text>
                {item.time && (
                    <View className="flex-row items-center mt-1">
                        <FontAwesome5 name="clock" size={12} color="#888" />
                        <Text className="text-gray-500 text-xs ml-1">{item.time}</Text>
                        {item.type === 'match' && item.details?.location && (
                            <>
                                <View className="mx-2 w-[1px] h-3 bg-gray-300" />
                                <Text className="text-gray-500 text-xs">{item.details.location}</Text>
                            </>
                        )}
                    </View>
                )}
                {item.type === 'championship' && (
                    <Text className="text-yellow-600 text-xs mt-1 font-bold">INÍCIO DA COMPETIÇÃO</Text>
                )}
            </View>

            {item.type === 'match' && item.details?.status === 'finished' && (
                <View className="items-center justify-center ml-2 bg-gray-100 px-2 py-1 rounded">
                    <Text className="text-xs font-bold text-gray-700">{item.details.home_score} x {item.details.away_score}</Text>
                </View>
            )}
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white p-4 pt-12 shadow-sm flex-row items-center justify-between z-10">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                        <FontAwesome5 name="arrow-left" size={20} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">Agenda do Clube</Text>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#0044cc" />
                </View>
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    renderItem={renderEvent}
                    renderSectionHeader={({ section: { title } }) => (
                        <View className="bg-gray-50 py-2 px-4 mb-2">
                            <Text className="text-gray-500 font-bold uppercase tracking-wider text-sm">{title}</Text>
                        </View>
                    )}
                    contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
                    ListEmptyComponent={
                        <View className="items-center mt-10">
                            <FontAwesome5 name="calendar-times" size={40} color="#ccc" />
                            <Text className="text-gray-400 mt-4">Nenhum evento agendado.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api } from '../src/services/api';
import '../global.css';

export default function AgendaScreen() {
    const router = useRouter();

    // States
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('agendado');

    // Date Filters
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    useEffect(() => {
        loadEvents();
    }, [status, startDate, endDate]);

    async function loadEvents() {
        setLoading(true);
        try {
            const clubId = 1;
            const params: any = { status };

            if (startDate) params.start_date = startDate.toISOString().split('T')[0];
            if (endDate) params.end_date = endDate.toISOString().split('T')[0];

            const response = await api.get(`/clubs/${clubId}/agenda`, { params });
            setEvents(response.data);
        } catch (error) {
            console.error('Erro ao carregar agenda:', error);
            // Mock data on error
            setEvents([
                { id: 1, date: '2026-02-15', time: '14:00', title: 'Toledão x Cascavel', category: 'Futebol', location: 'Campo 1', status: 'agendado' },
                { id: 2, date: '2026-02-15', time: '16:00', title: 'Final Vôlei', category: 'Vôlei', location: 'Ginásio', status: 'live', home_score: 2, away_score: 1 }
            ]);
        } finally {
            setLoading(false);
        }
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return {
            day: date.getDate(),
            month: date.toLocaleString('pt-BR', { month: 'short' }).toUpperCase().replace('.', ''),
            weekday: date.toLocaleString('pt-BR', { weekday: 'long' }),
        };
    };

    const StatusTab = ({ label, value, activeColor, icon }: any) => (
        <TouchableOpacity
            onPress={() => setStatus(value)}
            className={`px-4 py-2 rounded-full mr-2 flex-row items-center border ${status === value ? `${activeColor} border-transparent` : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}
        >
            {value === 'live' && <View className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />}
            <Text className={`text-xs font-bold ${status === value ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                {label}
            </Text>
        </TouchableOpacity>
    );

    const renderItem = ({ item }: { item: any }) => {
        const dateInfo = formatDate(item.date);
        return (
            <TouchableOpacity className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-3 flex-row gap-4 active:opacity-90">
                <View className="flex-col items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 rounded-lg w-16 h-16 shrink-0">
                    <Text className="text-xs font-bold uppercase text-indigo-700 dark:text-indigo-300">{dateInfo.month}</Text>
                    <Text className="text-2xl font-black leading-none text-indigo-700 dark:text-indigo-300">{dateInfo.day}</Text>
                </View>

                <View className="flex-1 min-w-0 justify-center">
                    <Text className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-0.5">{item.category}</Text>
                    <Text className="font-bold text-gray-900 dark:text-white text-base truncate" numberOfLines={1}>{item.title}</Text>

                    {item.status === 'finished' && (
                        <Text className="mt-1 text-sm font-black text-gray-800 dark:text-gray-200">
                            {item.home_score} x {item.away_score}
                        </Text>
                    )}

                    <View className="flex-row items-center gap-3 mt-1">
                        <View className="flex-row items-center gap-1">
                            <Feather name="clock" size={12} color="#9CA3AF" />
                            <Text className="text-xs text-gray-500 dark:text-gray-400">{item.time}</Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <MaterialIcons name="location-on" size={12} color="#9CA3AF" />
                            <Text className="text-xs text-gray-500 dark:text-gray-400">{item.location}</Text>
                        </View>
                        {item.status === 'live' && (
                            <View className="bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 rounded ml-1">
                                <Text className="text-[10px] font-bold text-red-600 dark:text-red-400">AO VIVO</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View className="self-center">
                    <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 shadow-sm border-b border-gray-100 dark:border-gray-700 z-10">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full mr-2">
                        <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800 dark:text-white">Agenda do Clube</Text>
                </View>

                {/* Status Filter */}
                <View className="flex-row mb-4">
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={[
                            { label: 'Jogos Agendados', value: 'agendado', activeColor: 'bg-indigo-600' },
                            { label: 'Ao Vivo', value: 'live', activeColor: 'bg-red-600' },
                            { label: 'Concluídos', value: 'finished', activeColor: 'bg-green-600' }
                        ]}
                        keyExtractor={item => item.value}
                        renderItem={({ item }) => <StatusTab {...item} />}
                    />
                </View>

                {/* Date Filter */}
                <View className="flex-row gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-xl border border-gray-200 dark:border-gray-600">
                    <TouchableOpacity onPress={() => setShowStartPicker(true)} className="flex-1">
                        <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 flex-row items-center">
                            <Feather name="calendar" size={10} /> De:
                        </Text>
                        <Text className="bg-white dark:bg-gray-600 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-500 text-sm dark:text-white">
                            {startDate ? startDate.toLocaleDateString('pt-BR') : 'Selecionar'}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowEndPicker(true)} className="flex-1">
                        <Text className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-1 flex-row items-center">
                            <Feather name="calendar" size={10} /> Até:
                        </Text>
                        <Text className="bg-white dark:bg-gray-600 px-2 py-1.5 rounded border border-gray-200 dark:border-gray-500 text-sm dark:text-white">
                            {endDate ? endDate.toLocaleDateString('pt-BR') : 'Selecionar'}
                        </Text>
                    </TouchableOpacity>
                    {(startDate || endDate) && (
                        <TouchableOpacity onPress={() => { setStartDate(null); setEndDate(null); }} className="justify-center px-2">
                            <MaterialIcons name="close" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* List */}
            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : (
                <FlatList
                    data={events}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <FontAwesome5 name="calendar-times" size={48} color="#D1D5DB" />
                            <Text className="text-gray-500 dark:text-gray-400 mt-4 text-center">Nenhum evento encontrado.</Text>
                            <TouchableOpacity onPress={() => { setStartDate(null); setEndDate(null); setStatus('agendado') }}>
                                <Text className="text-indigo-600 font-bold mt-2">Limpar filtros</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            )}

            {/* DateTimePickers */}
            {showStartPicker && (
                <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event: any, date?: Date) => {
                        setShowStartPicker(false);
                        if (date) setStartDate(date);
                    }}
                />
            )}
            {showEndPicker && (
                <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event: any, date?: Date) => {
                        setShowEndPicker(false);
                        if (date) setEndDate(date);
                    }}
                />
            )}
        </View>
    );
}

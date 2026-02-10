import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import { useState } from 'react';
import '../../global.css';

export default function MyInscriptionsScreen() {
    const router = useRouter();

    // Mock Data - matching Web's mock for now
    // Future: Fetch from /me/inscriptions
    const [inscriptions, setInscriptions] = useState([
        { id: 101, event: 'Copa Verão 2026', category: 'Futebol - Livre', status: 'confirmed', date: '2026-02-15' },
        { id: 102, event: 'Corrida Noturna', category: '5km Geral', status: 'pending', date: '2026-02-20' },
    ]);

    const renderItem = ({ item }: { item: any }) => {
        return (
            <TouchableOpacity
                className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-3 flex-row items-center justify-between"
                activeOpacity={0.7}
            // navigate to event details?
            >
                <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-1">
                        <FontAwesome5 name="trophy" size={14} color="#4F46E5" />
                        <Text className="font-bold text-gray-900 dark:text-white text-base">{item.event}</Text>
                    </View>
                    <Text className="text-sm text-gray-500 dark:text-gray-400 mb-2">{item.category}</Text>

                    <View className="flex-row items-center gap-3">
                        <View className={`px-2 py-1 rounded-md ${item.status === 'confirmed' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-yellow-100 dark:bg-yellow-900/30'}`}>
                            <Text className={`text-[10px] font-bold uppercase ${item.status === 'confirmed' ? 'text-green-700 dark:text-green-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                                {item.status === 'confirmed' ? 'Confirmada' : 'Pendente Pagamento'}
                            </Text>
                        </View>
                        <View className="flex-row items-center gap-1">
                            <Feather name="calendar" size={12} color="#9CA3AF" />
                            <Text className="text-xs text-gray-400 font-medium">
                                {new Date(item.date).toLocaleDateString('pt-BR')}
                            </Text>
                        </View>
                    </View>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
            </TouchableOpacity>
        );
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-white dark:bg-gray-800 p-6 pt-12 shadow-sm border-b border-gray-100 dark:border-gray-700 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full active:bg-gray-100 dark:active:bg-gray-700 mr-2">
                    <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 dark:text-white">Minhas Inscrições</Text>
            </View>

            <FlatList
                data={inscriptions}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderItem}
                contentContainerStyle={{ padding: 16 }}
                ListEmptyComponent={
                    <View className="items-center justify-center mt-20">
                        <View className="bg-gray-100 dark:bg-gray-800 w-16 h-16 rounded-full flex items-center justify-center mb-3">
                            <FontAwesome5 name="clipboard-list" size={32} color="#9CA3AF" />
                        </View>
                        <Text className="text-gray-500 dark:text-gray-400 text-center">
                            Você ainda não participou de nenhum evento.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

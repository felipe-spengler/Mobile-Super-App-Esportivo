import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import api from '../../../src/services/api';
import '../../../global.css';

interface RaceResult {
    id: number;
    position_general: number;
    name: string;
    bib_number: string;
    net_time: string;
    category_id: number;
}

interface Category {
    id: number;
    name: string;
}

export default function RaceResultsScreen() {
    const { id } = useLocalSearchParams(); // Championship ID
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [results, setResults] = useState<RaceResult[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Filters
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [showFilterModal, setShowFilterModal] = useState(false);

    useEffect(() => {
        loadResults();
        loadCategories();
    }, [id]);

    // Reload when filters change
    useEffect(() => {
        loadResults();
    }, [search, selectedCategory]);

    async function loadCategories() {
        try {
            const response = await api.get(`/championships/${id}`);
            if (response.data.categories) {
                setCategories(response.data.categories);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async function loadResults() {
        setLoading(true);
        try {
            const params: any = {};
            if (search) params.search = search;
            if (selectedCategory) params.category_id = selectedCategory;

            const response = await api.get(`/championships/${id}/race-results`, { params });
            setResults(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const renderItem = ({ item }: { item: RaceResult }) => {
        const isSelf = false; // TODO: Check if user_id matches me
        return (
            <View className={`p-4 mb-2 rounded-xl flex-row items-center ${isSelf ? 'bg-emerald-50 border border-emerald-200' : 'bg-white border border-gray-100'}`}>
                <View className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center mr-4">
                    <Text className="font-bold text-gray-500">#{item.position_general}</Text>
                </View>

                <View className="flex-1">
                    <Text className="font-bold text-gray-800 text-lg">{item.name}</Text>
                    <Text className="text-gray-500 text-xs">BIB: {item.bib_number}</Text>
                </View>

                <View className="items-end">
                    <Text className="font-mono font-bold text-emerald-600 text-lg">{item.net_time}</Text>
                    <Text className="text-gray-400 text-xs">Tempo Líquido</Text>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm z-10">
                <View className="flex-row items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <MaterialIcons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">Resultados</Text>
                </View>

                {/* Search & Filter Bar */}
                <View className="flex-row gap-2">
                    <View className="flex-1 bg-gray-100 rounded-lg flex-row items-center padding-horizontal-2 px-3">
                        <FontAwesome5 name="search" size={14} color="#999" />
                        <TextInput
                            placeholder="Buscar atleta ou número..."
                            className="flex-1 p-3 text-gray-700"
                            value={search}
                            onChangeText={setSearch}
                            returnKeyType="search"
                        />
                    </View>
                    <TouchableOpacity
                        onPress={() => setShowFilterModal(true)}
                        className={`p-3 rounded-lg items-center justify-center w-12 ${selectedCategory ? 'bg-emerald-600' : 'bg-gray-200'}`}
                    >
                        <FontAwesome5 name="filter" size={16} color={selectedCategory ? 'white' : '#666'} />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator className="mt-10" size="large" color="#059669" />
            ) : (
                <FlatList
                    data={results}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="items-center py-10">
                            <Text className="text-gray-500">Nenhum resultado encontrado.</Text>
                        </View>
                    }
                />
            )}

            {/* Filter Modal */}
            <Modal visible={showFilterModal} animationType="slide" transparent>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl p-6 h-1/2">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-800">Filtrar Categoria</Text>
                            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                                <MaterialIcons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <FlatList
                            data={categories}
                            keyExtractor={item => String(item.id)}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className={`p-4 border-b border-gray-100 flex-row justify-between ${selectedCategory === item.id ? 'bg-emerald-50' : ''}`}
                                    onPress={() => {
                                        setSelectedCategory(item.id);
                                        setShowFilterModal(false);
                                    }}
                                >
                                    <Text className={`text-lg ${selectedCategory === item.id ? 'font-bold text-emerald-700' : 'text-gray-700'}`}>{item.name}</Text>
                                    {selectedCategory === item.id && <FontAwesome5 name="check" size={16} color="#059669" />}
                                </TouchableOpacity>
                            )}
                            ListHeaderComponent={
                                <TouchableOpacity
                                    className="p-4 border-b border-gray-100"
                                    onPress={() => {
                                        setSelectedCategory(null);
                                        setShowFilterModal(false);
                                    }}
                                >
                                    <Text className="text-lg text-gray-700 font-bold">Todas as Categorias</Text>
                                </TouchableOpacity>
                            }
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

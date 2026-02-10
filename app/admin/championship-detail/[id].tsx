import { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import '../../global.css';

export default function ChampionshipDetailScreen() {
    const router = useRouter();
    const { id, category_id } = useLocalSearchParams();
    const [championship, setChampionship] = useState<any>(null);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Explicitly manage selected category state, defaulting to param if present
    const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(category_id as string || null);

    useEffect(() => {
        loadData();
    }, [id]);

    useEffect(() => {
        if (category_id) {
            setSelectedCategoryId(category_id as string);
        }
    }, [category_id]);

    async function loadData() {
        try {
            const [campRes, catRes] = await Promise.all([
                api.get(`/championships/${id}`),
                api.get(`/admin/championships/${id}/categories`).catch(() => ({ data: [] }))
            ]);
            setChampionship(campRes.data);
            setCategories(catRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return <View className="flex-1 justify-center items-center bg-gray-50"><ActivityIndicator color="#4F46E5" size="large" /></View>;
    if (!championship) return <View className="flex-1 justify-center items-center"><Text>Campeonato não encontrado</Text></View>;

    const selectedCategory = categories.find(c => c.id.toString() === selectedCategoryId);

    // 1. SELECT CATEGORY VIEW
    if (!selectedCategoryId) {
        return (
            <View className="flex-1 bg-gray-50 dark:bg-gray-900">
                <View className="bg-white dark:bg-gray-800 p-6 pt-12 border-b border-gray-100 dark:border-gray-700">
                    <TouchableOpacity onPress={() => router.push('/admin/championships')} className="flex-row items-center mb-4">
                        <MaterialIcons name="arrow-back" size={20} color="#6B7280" />
                        <Text className="text-gray-500 ml-1">Voltar</Text>
                    </TouchableOpacity>
                    <View className="flex-row items-center">
                        <View className="w-16 h-16 bg-indigo-50 rounded-xl mr-4 items-center justify-center border border-indigo-100">
                            {championship.logo_url ? (
                                <Image source={{ uri: championship.logo_url }} className="w-full h-full rounded-xl" />
                            ) : (
                                <FontAwesome5 name="trophy" size={24} color="#4F46E5" />
                            )}
                        </View>
                        <View className="flex-1">
                            <Text className="text-2xl font-bold text-gray-900 dark:text-white">{championship.name}</Text>
                            <Text className="text-gray-500">Selecione uma categoria</Text>
                        </View>
                    </View>
                </View>

                <ScrollView className="p-4">
                    {categories.length === 0 ? (
                        <View className="bg-white dark:bg-gray-800 p-8 rounded-xl items-center border border-gray-100 dark:border-gray-700">
                            <MaterialIcons name="error-outline" size={48} color="#F59E0B" />
                            <Text className="text-lg font-bold text-gray-800 dark:text-white mt-4">Nenhuma categoria</Text>
                            <TouchableOpacity
                                onPress={() => router.push({ pathname: '/admin/categories', params: { championshipId: id } })}
                                className="mt-6 bg-indigo-600 px-6 py-3 rounded-xl flex-row items-center"
                            >
                                <MaterialIcons name="add" size={24} color="white" />
                                <Text className="text-white font-bold ml-2">Criar Categoria</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        categories.map(cat => (
                            <TouchableOpacity
                                key={cat.id}
                                onPress={() => setSelectedCategoryId(cat.id.toString())}
                                className="bg-white dark:bg-gray-800 p-5 rounded-xl mb-3 border border-gray-100 dark:border-gray-700 flex-row justify-between items-center shadow-sm"
                            >
                                <View>
                                    <Text className="font-bold text-lg text-gray-800 dark:text-white">{cat.name}</Text>
                                    <Text className="text-gray-500 text-sm">{cat.gender === 'M' ? 'Masculino' : cat.gender === 'F' ? 'Feminino' : 'Misto'}</Text>
                                </View>
                                <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
                            </TouchableOpacity>
                        ))
                    )}
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/admin/categories', params: { championshipId: id } })}
                        className="bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 p-4 rounded-xl items-center mt-2"
                    >
                        <Text className="text-gray-500 dark:text-gray-400 font-bold">+ Gerenciar Categorias</Text>
                    </TouchableOpacity>
                </ScrollView>
            </View>
        );
    }

    // 2. DASHBOARD VIEW
    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 border-b border-gray-100 dark:border-gray-700 shadow-sm z-10">
                <TouchableOpacity onPress={() => setSelectedCategoryId(null)} className="flex-row items-center mb-4">
                    <MaterialIcons name="arrow-back" size={20} color="#6B7280" />
                    <Text className="text-gray-500 ml-1">Trocar Categoria</Text>
                </TouchableOpacity>

                <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center flex-1">
                        <View className="w-12 h-12 bg-indigo-50 rounded-xl mr-3 items-center justify-center border border-indigo-100 overflow-visible relative">
                            {championship.logo_url ? <Image source={{ uri: championship.logo_url }} className="w-full h-full rounded-xl" /> : <FontAwesome5 name="trophy" size={20} color="#4F46E5" />}
                            <View className="absolute -bottom-2 -right-2 bg-indigo-600 px-2 py-0.5 rounded-full border-2 border-white dark:border-gray-800">
                                <Text className="text-[8px] font-bold text-white">{selectedCategory?.name}</Text>
                            </View>
                        </View>
                        <View>
                            <Text className="text-lg font-black text-gray-900 dark:text-white leading-tight w-48" numberOfLines={1}>{championship.name}</Text>
                            <Text className="text-xs text-gray-500 font-bold">{selectedCategory?.name}</Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={() => router.push({ pathname: '/admin/championship-form', params: { id } })} className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                        <MaterialIcons name="settings" size={24} color="#4B5563" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="p-4">
                <View className="flex-row flex-wrap gap-4">
                    {/* Times */}
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/admin/championship-teams', params: { championshipId: id, categoryId: selectedCategoryId } })}
                        className="w-full bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                    >
                        <View className="flex-row justify-between items-start mb-2">
                            <View className="bg-emerald-100 dark:bg-emerald-900/30 w-10 h-10 rounded-full items-center justify-center">
                                <FontAwesome5 name="users" size={18} color="#10B981" />
                            </View>
                            <MaterialIcons name="arrow-forward" size={20} color="#D1D5DB" />
                        </View>
                        <Text className="font-bold text-lg text-gray-800 dark:text-white">Times / Inscrições</Text>
                        <Text className="text-gray-500 text-sm mt-1">Gerenciar elencos e aprovar equipes.</Text>
                    </TouchableOpacity>

                    {/* Jogos/Tabela */}
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/admin/matches', params: { championshipId: id, categoryId: selectedCategoryId } })}
                        className="w-[47%] bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                    >
                        <View className="bg-orange-100 dark:bg-orange-900/30 w-10 h-10 rounded-full items-center justify-center mb-3">
                            <MaterialIcons name="calendar-today" size={20} color="#F97316" />
                        </View>
                        <Text className="font-bold text-base text-gray-800 dark:text-white">Tabela</Text>
                    </TouchableOpacity>

                    {/* Classificação */}
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: `/championship/${id}/leaderboard`, params: { categoryId: selectedCategoryId } } as any)}
                        className="w-[47%] bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                    >
                        <View className="bg-yellow-100 dark:bg-yellow-900/30 w-10 h-10 rounded-full items-center justify-center mb-3">
                            <FontAwesome5 name="medal" size={18} color="#EAB308" />
                        </View>
                        <Text className="font-bold text-base text-gray-800 dark:text-white">Classificação</Text>
                    </TouchableOpacity>

                    {/* Bracket (Mata-mata) - New Feature */}
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/admin/bracket/[id]', params: { id, categoryId: selectedCategoryId } })}
                        className="w-full bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                    >
                        <View className="flex-row justify-between items-start mb-2">
                            <View className="bg-indigo-100 dark:bg-indigo-900/30 w-10 h-10 rounded-full items-center justify-center">
                                <MaterialCommunityIcons name="tournament" size={20} color="#4F46E5" />
                            </View>
                            <MaterialIcons name="arrow-forward" size={20} color="#D1D5DB" />
                        </View>
                        <Text className="font-bold text-lg text-gray-800 dark:text-white">Chaveamento (Mata-mata)</Text>
                        <Text className="text-gray-500 text-sm mt-1">Gerar chaves e acompanhar eliminatórias.</Text>
                    </TouchableOpacity>

                    {/* Premiação */}
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: '/admin/awards', params: { championshipId: id, categoryId: selectedCategoryId } })}
                        className="w-full bg-white dark:bg-gray-800 p-5 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm"
                    >
                        <View className="flex-row justify-between items-start mb-2">
                            <View className="bg-purple-100 dark:bg-purple-900/30 w-10 h-10 rounded-full items-center justify-center">
                                <FontAwesome5 name="trophy" size={18} color="#A855F7" />
                            </View>
                            <MaterialIcons name="arrow-forward" size={20} color="#D1D5DB" />
                        </View>
                        <Text className="font-bold text-lg text-gray-800 dark:text-white">Premiação & MVP</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

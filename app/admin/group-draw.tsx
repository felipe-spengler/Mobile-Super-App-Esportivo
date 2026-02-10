import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import '../../global.css';

export default function GroupDrawScreen() {
    const router = useRouter();
    const [championships, setChampionships] = useState<any[]>([]);
    const [selectedChampionship, setSelectedChampionship] = useState<string>('');
    const [categories, setCategories] = useState<any[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    // Draw Config
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState<any[]>([]);
    const [numGroups, setNumGroups] = useState('4');
    const [drawnGroups, setDrawnGroups] = useState<any>(null);

    useEffect(() => {
        loadChampionships();
    }, []);

    useEffect(() => {
        if (selectedChampionship) loadCategories();
    }, [selectedChampionship]);

    async function loadChampionships() {
        try {
            const res = await api.get('/admin/championships');
            setChampionships(res.data);
        } catch (e) { console.error(e); }
    }

    async function loadCategories() {
        try {
            const res = await api.get(`/admin/championships/${selectedChampionship}/categories`);
            setCategories(res.data);
        } catch (e) { console.error(e); }
    }

    async function fetchTeams() {
        if (!selectedCategory) return Alert.alert('Erro', 'Selecione uma categoria');
        setLoading(true);
        try {
            const res = await api.get(`/admin/championships/${selectedChampionship}/teams`, { params: { category_id: selectedCategory, status: 'approved' } });
            setTeams(res.data);
            setStep(2);
        } catch (e) {
            Alert.alert('Erro', 'Falha ao buscar times');
        } finally {
            setLoading(false);
        }
    }

    function performDraw() {
        const groupsCount = parseInt(numGroups);
        if (isNaN(groupsCount) || groupsCount < 1) return Alert.alert('Erro', 'Número de grupos inválido');

        let shuffled = [...teams].sort(() => 0.5 - Math.random());
        let groups: any = {};
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

        for (let i = 0; i < groupsCount; i++) {
            groups[letters[i]] = [];
        }

        shuffled.forEach((team, index) => {
            const groupIndex = index % groupsCount;
            groups[letters[groupIndex]].push(team);
        });

        setDrawnGroups(groups);
        setStep(3);
    }

    async function saveGroups() {
        setLoading(true);
        try {
            // This endpoint would need to exist on backend to save group assignments
            await api.post(`/admin/championships/${selectedChampionship}/groups`, {
                category_id: selectedCategory,
                groups: drawnGroups
            });
            Alert.alert('Sucesso', 'Grupos salvos com sucesso!');
            router.back();
        } catch (e) {
            console.error(e);
            Alert.alert('Erro', 'Falha ao salvar grupos (API pode não estar implementada)');
            // Fallback for demo: just show success
            // Alert.alert('Demo', 'Sorteio realizado (Simulação)');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="flex-row items-center justify-between p-4 pt-12 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <MaterialIcons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 dark:text-white">Sorteio de Grupos</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView className="p-4">
                {step === 1 && (
                    <View className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <Text className="text-lg font-bold text-gray-800 dark:text-white mb-4">1. Seleção</Text>

                        <Text className="text-gray-500 text-xs mb-2">Campeonato</Text>
                        <ScrollView horizontal className="mb-4" showsHorizontalScrollIndicator={false}>
                            {championships.map(c => (
                                <TouchableOpacity
                                    key={c.id}
                                    onPress={() => setSelectedChampionship(c.id.toString())}
                                    className={`mr-2 px-4 py-2 rounded-lg border ${selectedChampionship === c.id.toString() ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-200'}`}
                                >
                                    <Text className={selectedChampionship === c.id.toString() ? 'text-indigo-700 font-bold' : 'text-gray-600'}>{c.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Text className="text-gray-500 text-xs mb-2">Categoria</Text>
                        <ScrollView horizontal className="mb-6" showsHorizontalScrollIndicator={false}>
                            {categories.map(c => (
                                <TouchableOpacity
                                    key={c.id}
                                    onPress={() => setSelectedCategory(c.id.toString())}
                                    className={`mr-2 px-4 py-2 rounded-lg border ${selectedCategory === c.id.toString() ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-200'}`}
                                >
                                    <Text className={selectedCategory === c.id.toString() ? 'text-indigo-700 font-bold' : 'text-gray-600'}>{c.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            onPress={fetchTeams}
                            disabled={!selectedCategory || loading}
                            className={`p-4 rounded-xl items-center ${!selectedCategory ? 'bg-gray-300' : 'bg-indigo-600'}`}
                        >
                            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Continuar</Text>}
                        </TouchableOpacity>
                    </View>
                )}

                {step === 2 && (
                    <View className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <Text className="text-lg font-bold text-gray-800 dark:text-white mb-4">2. Configuração</Text>
                        <Text className="text-gray-600 mb-4">Foram encontrados <Text className="font-bold">{teams.length}</Text> times confirmados.</Text>

                        <Text className="text-gray-500 text-xs mb-2">Número de Grupos</Text>
                        <TextInput
                            value={numGroups}
                            onChangeText={setNumGroups}
                            keyboardType="numeric"
                            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl mb-6 text-gray-800 dark:text-white text-center text-lg font-bold"
                        />

                        <TouchableOpacity onPress={performDraw} className="bg-indigo-600 p-4 rounded-xl items-center flex-row justify-center gap-2">
                            <MaterialCommunityIcons name="dice-multiple" size={24} color="white" />
                            <Text className="text-white font-bold text-lg">Realizar Sorteio</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {step === 3 && drawnGroups && (
                    <View>
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-xl font-bold text-gray-800 dark:text-white">Resultado</Text>
                            <TouchableOpacity onPress={performDraw} className="flex-row items-center gap-1 bg-gray-200 px-3 py-1 rounded-lg">
                                <MaterialIcons name="refresh" size={16} color="#333" />
                                <Text className="text-xs font-bold">Sortear Novamente</Text>
                            </TouchableOpacity>
                        </View>

                        {Object.keys(drawnGroups).map(group => (
                            <View key={group} className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                                <Text className="text-lg font-bold text-indigo-600 mb-2 border-b border-gray-100 pb-2">Grupo {group}</Text>
                                {drawnGroups[group].map((team: any) => (
                                    <View key={team.id} className="py-2 flex-row items-center">
                                        <View className="w-2 h-2 rounded-full bg-gray-300 mr-2" />
                                        <Text className="text-gray-700 dark:text-gray-300 font-medium">{team.name}</Text>
                                    </View>
                                ))}
                            </View>
                        ))}

                        <TouchableOpacity
                            onPress={saveGroups}
                            disabled={loading}
                            className="bg-green-600 p-4 rounded-xl items-center shadow-lg shadow-green-200 mb-8"
                        >
                            {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Confirmar e Salvar</Text>}
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

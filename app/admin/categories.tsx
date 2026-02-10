import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import '../../global.css';

export default function CategoriesScreen() {
    const router = useRouter();
    const { championshipId } = useLocalSearchParams();
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [editingCat, setEditingCat] = useState<any>(null);
    const [catName, setCatName] = useState('');
    const [catGender, setCatGender] = useState('M'); // M, F, X
    const [catPrice, setCatPrice] = useState('0');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadCategories();
    }, [championshipId]);

    async function loadCategories() {
        try {
            const response = await api.get(`/admin/championships/${championshipId}/categories`);
            setCategories(response.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const openModal = (cat?: any) => {
        if (cat) {
            setEditingCat(cat);
            setCatName(cat.name);
            setCatGender(cat.gender);
            setCatPrice(cat.price?.toString() || '0');
        } else {
            setEditingCat(null);
            setCatName('');
            setCatGender('M');
            setCatPrice('0');
        }
        setModalVisible(true);
    };

    async function handleSave() {
        if (!catName) return Alert.alert('Erro', 'Nome é obrigatório');
        setSaving(true);
        try {
            const payload = {
                name: catName,
                gender: catGender,
                price: parseFloat(catPrice),
                championship_id: championshipId
            };

            if (editingCat) {
                await api.put(`/admin/categories/${editingCat.id}`, payload);
            } else {
                await api.post(`/admin/categories`, payload);
            }
            setModalVisible(false);
            loadCategories();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao salvar categoria.');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id: number) {
        Alert.alert('Confirmar', 'Deseja excluir esta categoria?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete(`/admin/categories/${id}`);
                        loadCategories();
                    } catch (e) {
                        Alert.alert('Erro', 'Não foi possível excluir.');
                    }
                }
            }
        ]);
    }

    if (loading) return <View className="flex-1 justify-center items-center"><ActivityIndicator color="#4F46E5" /></View>;

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 pt-12 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <MaterialIcons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 dark:text-white">Categorias</Text>
                <TouchableOpacity onPress={() => openModal()} className="bg-indigo-600 px-3 py-1.5 rounded-lg flex-row items-center">
                    <MaterialIcons name="add" size={18} color="white" />
                    <Text className="text-white font-bold ml-1">Nova</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="p-4">
                {categories.length === 0 ? (
                    <Text className="text-center text-gray-500 mt-10">Nenhuma categoria cadastrada.</Text>
                ) : (
                    categories.map(cat => (
                        <View key={cat.id} className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 border border-gray-100 dark:border-gray-700 shadow-sm flex-row justify-between items-center">
                            <View>
                                <Text className="font-bold text-lg text-gray-800 dark:text-white">{cat.name}</Text>
                                <View className="flex-row items-center mt-1">
                                    <View className={`px-2 py-0.5 rounded text-[10px] ${cat.gender === 'M' ? 'bg-blue-100 text-blue-700' : cat.gender === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-purple-100 text-purple-700'}`}>
                                        <Text className={`font-bold text-[10px] ${cat.gender === 'M' ? 'text-blue-700' : cat.gender === 'F' ? 'text-pink-700' : 'text-purple-700'}`}>
                                            {cat.gender === 'M' ? 'MASCULINO' : cat.gender === 'F' ? 'FEMININO' : 'MISTO'}
                                        </Text>
                                    </View>
                                    <Text className="text-gray-400 text-xs ml-2">R$ {parseFloat(cat.price || '0').toFixed(2)}</Text>
                                </View>
                            </View>
                            <View className="flex-row gap-2">
                                <TouchableOpacity onPress={() => openModal(cat)} className="p-2 bg-gray-100 rounded-lg">
                                    <MaterialIcons name="edit" size={20} color="#4B5563" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(cat.id)} className="p-2 bg-red-50 rounded-lg">
                                    <MaterialIcons name="delete" size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Modal */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900 dark:text-white">{editingCat ? 'Editar Categoria' : 'Nova Categoria'}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-xs text-gray-500 mb-1">Nome da Categoria</Text>
                        <TextInput
                            value={catName}
                            onChangeText={setCatName}
                            placeholder="Ex: Sub-20, Veterano, Elite"
                            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl mb-4 text-gray-800 dark:text-white"
                        />

                        <Text className="text-xs text-gray-500 mb-1">Gênero</Text>
                        <View className="flex-row gap-2 mb-4">
                            {['M', 'F', 'X'].map(g => (
                                <TouchableOpacity
                                    key={g}
                                    onPress={() => setCatGender(g)}
                                    className={`flex-1 p-3 rounded-xl border ${catGender === g ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-gray-200'} items-center`}
                                >
                                    <Text className={catGender === g ? 'font-bold text-indigo-700' : 'text-gray-600'}>
                                        {g === 'M' ? 'Masc' : g === 'F' ? 'Fem' : 'Misto'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text className="text-xs text-gray-500 mb-1">Preço da Inscrição (R$)</Text>
                        <TextInput
                            value={catPrice}
                            onChangeText={setCatPrice}
                            placeholder="0.00"
                            keyboardType="numeric"
                            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl mb-6 text-gray-800 dark:text-white"
                        />

                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={saving}
                            className="bg-indigo-600 p-4 rounded-xl items-center shadow-lg shadow-indigo-200"
                        >
                            {saving ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Salvar Categoria</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

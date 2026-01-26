import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { api } from '../../../src/services/api';
import '../../../global.css';

export default function ManageProductScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const isEditing = !!params.id;

    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        image_url: ''
    });

    useEffect(() => {
        if (isEditing) {
            loadProduct(params.id as string);
        }
    }, [isEditing]);

    async function loadProduct(id: string) {
        try {
            setLoading(true);
            const response = await api.get(`/products/${id}`);
            const prod = response.data;
            setForm({
                name: prod.name,
                description: prod.description || '',
                price: prod.price ? prod.price.toString() : '',
                stock_quantity: prod.stock_quantity ? prod.stock_quantity.toString() : '',
                image_url: prod.image_url || ''
            });
        } catch (error) {
            Alert.alert('Erro', 'Produto não encontrado');
            router.back();
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        if (!form.name || !form.price) {
            return Alert.alert('Erro', 'Nome e Preço são obrigatórios');
        }

        try {
            setLoading(true);
            const payload = {
                ...form,
                price: parseFloat(form.price.replace(',', '.')),
                stock_quantity: form.stock_quantity ? parseInt(form.stock_quantity) : null
            };

            if (isEditing) {
                // Assumindo endpoint PUT /admin/products/:id
                await api.put(`/admin/products/${params.id}`, payload);
                Alert.alert('Sucesso', 'Produto atualizado!');
            } else {
                // Assumindo endpoint POST /admin/products
                await api.post('/admin/products', payload);
                Alert.alert('Sucesso', 'Produto criado!');
            }
            router.back();
            // router.replace('/admin/shop/products'); // Opcional refresh
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao salvar produto');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                        <MaterialIcons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800 dark:text-white">
                        {isEditing ? 'Editar Produto' : 'Novo Produto'}
                    </Text>
                </View>
            </View>

            <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 50 }}>
                {form.image_url ? (
                    <Image source={{ uri: form.image_url }} className="w-full h-48 rounded-xl bg-gray-200 mb-4" resizeMode="cover" />
                ) : null}

                <Text className="label">Nome do Produto</Text>
                <TextInput
                    className="input"
                    value={form.name}
                    onChangeText={t => setForm({ ...form, name: t })}
                    placeholder="Ex: Camisa Oficial"
                />

                <Text className="label">Descrição</Text>
                <TextInput
                    className="input h-24"
                    value={form.description}
                    onChangeText={t => setForm({ ...form, description: t })}
                    placeholder="Detalhes do produto..."
                    multiline
                    textAlignVertical="top"
                />

                <View className="flex-row gap-4">
                    <View className="flex-1">
                        <Text className="label">Preço (R$)</Text>
                        <TextInput
                            className="input"
                            value={form.price}
                            onChangeText={t => setForm({ ...form, price: t })}
                            placeholder="0,00"
                            keyboardType="numeric"
                        />
                    </View>
                    <View className="flex-1">
                        <Text className="label">Estoque</Text>
                        <TextInput
                            className="input"
                            value={form.stock_quantity}
                            onChangeText={t => setForm({ ...form, stock_quantity: t })}
                            placeholder="Infinito"
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                <Text className="label">URL da Imagem</Text>
                <TextInput
                    className="input"
                    value={form.image_url}
                    onChangeText={t => setForm({ ...form, image_url: t })}
                    placeholder="https://..."
                />

                <TouchableOpacity
                    className={`bg-blue-600 p-4 rounded-xl mt-6 items-center ${loading ? 'opacity-50' : ''}`}
                    onPress={handleSave}
                    disabled={loading}
                >
                    <Text className="text-white font-bold text-lg">
                        {loading ? 'Salvando...' : 'Salvar Produto'}
                    </Text>
                </TouchableOpacity>

                {isEditing && (
                    <TouchableOpacity
                        className="bg-red-50 p-4 rounded-xl mt-4 items-center border border-red-100"
                        onPress={() => {
                            Alert.alert('Excluir', 'Tem certeza?', [
                                { text: 'Cancelar' },
                                {
                                    text: 'Sim, excluir', style: 'destructive', onPress: async () => {
                                        try {
                                            await api.delete(`/admin/products/${params.id}`);
                                            router.back();
                                        } catch (e) { Alert.alert('Erro ao excluir'); }
                                    }
                                }
                            ])
                        }}
                    >
                        <Text className="text-red-600 font-bold">Excluir Produto</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
}

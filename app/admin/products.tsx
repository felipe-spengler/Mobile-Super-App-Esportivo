import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
    ActivityIndicator,
    Modal,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../../services/api';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    image_url: string | null;
    variants?: Array<{
        name: string;
        options: string[];
    }>;
}

export default function AdminProducts() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
    });
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [variants, setVariants] = useState<Array<{ name: string; options: string[] }>>([]);

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            const response = await api.get('/admin/products-manage');
            setProducts(response.data);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
            Alert.alert('Erro', 'Não foi possível carregar os produtos');
        } finally {
            setLoading(false);
        }
    }

    async function pickImage() {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    }

    async function handleSubmit() {
        if (!formData.name || !formData.price || !formData.stock_quantity) {
            Alert.alert('Atenção', 'Preencha todos os campos obrigatórios');
            return;
        }

        try {
            let finalImageUrl = editingProduct?.image_url || null;

            // Upload de imagem se houver
            if (imageUri) {
                const formDataImg = new FormData();
                formDataImg.append('image', {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: 'product.jpg',
                } as any);

                const uploadRes = await api.post('/admin/products/upload-image', formDataImg, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                finalImageUrl = uploadRes.data.path;
            }

            const payload = {
                ...formData,
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock_quantity),
                image_url: finalImageUrl,
                variants: variants.length > 0 ? variants : null,
            };

            if (editingProduct) {
                await api.put(`/admin/products-manage/${editingProduct.id}`, payload);
            } else {
                await api.post('/admin/products-manage', payload);
            }

            Alert.alert('Sucesso', 'Produto salvo com sucesso!');
            setShowModal(false);
            resetForm();
            loadProducts();
        } catch (error) {
            console.error('Erro ao salvar produto:', error);
            Alert.alert('Erro', 'Não foi possível salvar o produto');
        }
    }

    async function handleDelete(id: number) {
        Alert.alert(
            'Confirmar',
            'Tem certeza que deseja remover este produto?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/admin/products-manage/${id}`);
                            loadProducts();
                        } catch (error) {
                            Alert.alert('Erro', 'Não foi possível remover o produto');
                        }
                    },
                },
            ]
        );
    }

    function handleEdit(product: Product) {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            description: product.description || '',
            price: product.price.toString(),
            stock_quantity: product.stock_quantity.toString(),
        });
        setImageUri(null);
        setVariants(product.variants || []);
        setShowModal(true);
    }

    function handleOpenCreate() {
        resetForm();
        setShowModal(true);
    }

    function resetForm() {
        setEditingProduct(null);
        setFormData({ name: '', description: '', price: '', stock_quantity: '' });
        setImageUri(null);
        setVariants([]);
    }

    function addVariant() {
        setVariants([...variants, { name: '', options: [] }]);
    }

    function updateVariant(index: number, field: 'name' | 'options', value: any) {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
    }

    function removeVariant(index: number) {
        setVariants(variants.filter((_, i) => i !== index));
    }

    if (loading) {
        return (
            <View className="flex-1 bg-gray-50 items-center justify-center">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            <Stack.Screen
                options={{
                    title: 'Gestão de Produtos',
                    headerStyle: { backgroundColor: '#4F46E5' },
                    headerTintColor: '#fff',
                    headerRight: () => (
                        <TouchableOpacity onPress={handleOpenCreate} className="mr-4">
                            <Ionicons name="add-circle" size={28} color="#fff" />
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView className="flex-1 p-4">
                {products.length === 0 ? (
                    <View className="bg-white rounded-xl p-8 items-center">
                        <Ionicons name="cube-outline" size={64} color="#9CA3AF" />
                        <Text className="text-lg font-bold text-gray-800 mt-4">Nenhum produto</Text>
                        <Text className="text-gray-500 text-center mt-2">
                            Adicione produtos para vender na loja do clube
                        </Text>
                    </View>
                ) : (
                    <View className="space-y-4">
                        {products.map((product) => (
                            <View key={product.id} className="bg-white rounded-xl overflow-hidden shadow-sm">
                                <View className="flex-row">
                                    {product.image_url ? (
                                        <Image
                                            source={{ uri: product.image_url }}
                                            className="w-24 h-24"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <View className="w-24 h-24 bg-gray-100 items-center justify-center">
                                            <Ionicons name="image-outline" size={32} color="#9CA3AF" />
                                        </View>
                                    )}

                                    <View className="flex-1 p-3">
                                        <Text className="font-bold text-gray-800 text-base">{product.name}</Text>
                                        <Text className="text-gray-500 text-sm mt-1" numberOfLines={2}>
                                            {product.description}
                                        </Text>
                                        <View className="flex-row items-center justify-between mt-2">
                                            <Text className="text-indigo-600 font-bold text-lg">
                                                R$ {product.price.toFixed(2)}
                                            </Text>
                                            <Text className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                Estoque: {product.stock_quantity}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View className="flex-row border-t border-gray-100">
                                    <TouchableOpacity
                                        onPress={() => handleEdit(product)}
                                        className="flex-1 py-3 items-center flex-row justify-center"
                                    >
                                        <Ionicons name="create-outline" size={20} color="#4F46E5" />
                                        <Text className="text-indigo-600 font-semibold ml-2">Editar</Text>
                                    </TouchableOpacity>
                                    <View className="w-px bg-gray-100" />
                                    <TouchableOpacity
                                        onPress={() => handleDelete(product.id)}
                                        className="flex-1 py-3 items-center flex-row justify-center"
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                        <Text className="text-red-500 font-semibold ml-2">Remover</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))}
                    </View>
                )}
            </ScrollView>

            {/* Modal de Criação/Edição */}
            <Modal visible={showModal} animationType="slide" transparent={false}>
                <View className="flex-1 bg-gray-50">
                    <View className="bg-indigo-600 pt-12 pb-4 px-4">
                        <View className="flex-row items-center justify-between">
                            <Text className="text-white text-xl font-bold">
                                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                            </Text>
                            <TouchableOpacity onPress={() => setShowModal(false)}>
                                <Ionicons name="close" size={28} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <ScrollView className="flex-1 p-4">
                        <View className="space-y-4">
                            {/* Imagem */}
                            <View>
                                <Text className="text-sm font-bold text-gray-700 mb-2">Imagem do Produto</Text>
                                <TouchableOpacity
                                    onPress={pickImage}
                                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 items-center bg-white"
                                >
                                    {imageUri || editingProduct?.image_url ? (
                                        <Image
                                            source={{ uri: imageUri || editingProduct?.image_url || '' }}
                                            className="w-32 h-32 rounded-lg"
                                            resizeMode="cover"
                                        />
                                    ) : (
                                        <>
                                            <Ionicons name="camera-outline" size={48} color="#9CA3AF" />
                                            <Text className="text-gray-500 mt-2">Toque para adicionar foto</Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Nome */}
                            <View>
                                <Text className="text-sm font-bold text-gray-700 mb-2">Nome *</Text>
                                <TextInput
                                    value={formData.name}
                                    onChangeText={(text) => setFormData({ ...formData, name: text })}
                                    placeholder="Ex: Camisa Oficial 2026"
                                    className="bg-white border border-gray-300 rounded-xl px-4 py-3"
                                />
                            </View>

                            {/* Descrição */}
                            <View>
                                <Text className="text-sm font-bold text-gray-700 mb-2">Descrição</Text>
                                <TextInput
                                    value={formData.description}
                                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                                    placeholder="Detalhes do produto..."
                                    multiline
                                    numberOfLines={4}
                                    className="bg-white border border-gray-300 rounded-xl px-4 py-3"
                                    textAlignVertical="top"
                                />
                            </View>

                            {/* Preço e Estoque */}
                            <View className="flex-row space-x-4">
                                <View className="flex-1">
                                    <Text className="text-sm font-bold text-gray-700 mb-2">Preço (R$) *</Text>
                                    <TextInput
                                        value={formData.price}
                                        onChangeText={(text) => setFormData({ ...formData, price: text })}
                                        placeholder="0.00"
                                        keyboardType="decimal-pad"
                                        className="bg-white border border-gray-300 rounded-xl px-4 py-3"
                                    />
                                </View>
                                <View className="flex-1">
                                    <Text className="text-sm font-bold text-gray-700 mb-2">Estoque *</Text>
                                    <TextInput
                                        value={formData.stock_quantity}
                                        onChangeText={(text) => setFormData({ ...formData, stock_quantity: text })}
                                        placeholder="0"
                                        keyboardType="number-pad"
                                        className="bg-white border border-gray-300 rounded-xl px-4 py-3"
                                    />
                                </View>
                            </View>

                            {/* Variantes */}
                            <View>
                                <View className="flex-row items-center justify-between mb-2">
                                    <Text className="text-sm font-bold text-gray-700">Variantes (Opcional)</Text>
                                    <TouchableOpacity onPress={addVariant} className="bg-indigo-100 px-3 py-1 rounded-lg">
                                        <Text className="text-indigo-600 font-semibold text-xs">+ Adicionar</Text>
                                    </TouchableOpacity>
                                </View>

                                {variants.map((variant, index) => (
                                    <View key={index} className="bg-gray-50 p-3 rounded-lg mb-2">
                                        <View className="flex-row items-center justify-between mb-2">
                                            <TextInput
                                                value={variant.name}
                                                onChangeText={(text) => updateVariant(index, 'name', text)}
                                                placeholder="Ex: Tamanho"
                                                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2 mr-2"
                                            />
                                            <TouchableOpacity onPress={() => removeVariant(index)}>
                                                <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                        <TextInput
                                            value={variant.options.join(', ')}
                                            onChangeText={(text) => updateVariant(index, 'options', text.split(',').map(s => s.trim()))}
                                            placeholder="Opções separadas por vírgula: P, M, G, GG"
                                            className="bg-white border border-gray-300 rounded-lg px-3 py-2"
                                        />
                                    </View>
                                ))}
                            </View>

                            {/* Botões */}
                            <View className="flex-row space-x-3 mt-6">
                                <TouchableOpacity
                                    onPress={() => setShowModal(false)}
                                    className="flex-1 bg-gray-200 py-4 rounded-xl items-center"
                                >
                                    <Text className="text-gray-700 font-bold">Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSubmit}
                                    className="flex-1 bg-indigo-600 py-4 rounded-xl items-center"
                                >
                                    <Text className="text-white font-bold">
                                        {editingProduct ? 'Salvar' : 'Criar'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

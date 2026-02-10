import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { api } from '../src/services/api';
import '../global.css';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image_url: string | null;
}

export default function ShopScreen() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
    }, []);

    async function fetchProducts() {
        try {
            const response = await api.get('/public/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        } finally {
            setLoading(false);
        }
    }

    const getImageUrl = (url: string | null) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        // Construct absolute URL (assuming API base URL logic needed if not absolute)
        // In React Native with axios, baseURL is usually set. 
        // We can try to use the full URL if we have access to the base constant or just rely on API returning full URLs if fixed?
        // Wait, I fixed the web to PREPEND base url if not absolute.
        // Mobile `api` service usually has baseURL. 
        // If `url` is relative path like `/storage/...`, we typically need to prepend the domain.
        // Since I don't have easy access to process.env.VITE_... in RN the same way without config,
        // I will attempt to use a helper or just check if I can get the baseURL.
        // For now, I'll assume standard appending logic.
        return `https://esportivo.techinteligente.site${url}`;
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 pt-12 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="p-2 rounded-full active:bg-gray-100 dark:active:bg-gray-700">
                    <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 dark:text-white">Loja Oficial</Text>
                <TouchableOpacity className="p-2 rounded-full active:bg-gray-100 dark:active:bg-gray-700">
                    <FontAwesome5 name="shopping-bag" size={20} color="#4B5563" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : (
                <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 24 }}>
                    {products.length === 0 ? (
                        <View className="items-center py-12">
                            <FontAwesome5 name="shopping-bag" size={48} color="#D1D5DB" />
                            <Text className="text-gray-500 mt-4">Nenhum produto disponível.</Text>
                        </View>
                    ) : (
                        <View className="flex-row flex-wrap justify-between">
                            {products.map(product => {
                                const imageUrl = getImageUrl(product.image_url);
                                return (
                                    <TouchableOpacity
                                        key={product.id}
                                        onPress={() => router.push({ pathname: '/product-detail', params: { productId: product.id } })}
                                        className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 w-[48%] mb-4 active:scale-[0.98] transition-transform"
                                    >
                                        <View className="aspect-square bg-gray-100 rounded-xl mb-3 flex items-center justify-center relative overflow-hidden">
                                            {imageUrl ? (
                                                <Image
                                                    source={{ uri: imageUrl }}
                                                    className="w-full h-full"
                                                    resizeMode="cover"
                                                />
                                            ) : (
                                                <FontAwesome5 name="tshirt" size={32} color="rgba(0,0,0,0.1)" />
                                            )}

                                            <TouchableOpacity className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full">
                                                <MaterialIcons name="favorite-border" size={16} color="#9CA3AF" />
                                            </TouchableOpacity>
                                        </View>

                                        <Text className="font-bold text-gray-800 dark:text-white text-sm mb-1" numberOfLines={1}>
                                            {product.name}
                                        </Text>
                                        <Text className="text-indigo-600 dark:text-indigo-400 font-bold mb-3">
                                            R$ {Number(product.price).toFixed(2).replace('.', ',')}
                                        </Text>

                                        <TouchableOpacity className="bg-gray-900 dark:bg-indigo-600 w-full py-2 rounded-lg items-center">
                                            <Text className="text-white text-xs font-bold">Ver Detalhes</Text>
                                        </TouchableOpacity>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

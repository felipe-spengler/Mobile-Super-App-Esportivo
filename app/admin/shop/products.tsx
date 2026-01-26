import { View, Text, TouchableOpacity, FlatList, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { api } from '../../../src/services/api';
import '../../../global.css';

export default function AdminProductsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState<any[]>([]);

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            setLoading(true);
            // Vamos usar o endpoint público primeiro, idealmente seria '/products?scope=admin'
            // Assumindo que o admin vê tudo
            const response = await api.get('/products');
            setProducts(response.data.data || response.data);
        } catch (error) {
            console.error('Erro ao carregar produtos', error);
        } finally {
            setLoading(false);
        }
    }

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            onPress={() => router.push({ pathname: '/admin/shop/manage-product', params: { id: item.id } })}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 shadow-sm border border-gray-100 dark:border-gray-700 flex-row items-center"
        >
            <Image
                source={{ uri: item.image_url || 'https://via.placeholder.com/150' }}
                className="w-16 h-16 rounded-lg bg-gray-200"
            />
            <View className="flex-1 ml-4">
                <Text className="text-gray-800 dark:text-gray-100 font-bold text-base">{item.name}</Text>
                <Text className="text-blue-600 dark:text-blue-400 font-bold mt-1">
                    R$ {parseFloat(item.price).toFixed(2).replace('.', ',')}
                </Text>
                <Text className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                    Estoque: {item.stock_quantity ?? '∞'}
                </Text>
            </View>
            <View>
                <View className={`px-2 py-1 rounded ${item.is_active ? 'bg-green-100' : 'bg-red-100'}`}>
                    <Text className={`text-[10px] font-bold ${item.is_active ? 'text-green-700' : 'text-red-700'}`}>
                        {item.is_active ? 'ATIVO' : 'INATIVO'}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                        <MaterialIcons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800 dark:text-white">Gerenciar Loja</Text>
                </View>
                <TouchableOpacity
                    className="bg-green-600 px-4 py-2 rounded-lg flex-row items-center"
                    onPress={() => router.push('/admin/shop/manage-product')}
                >
                    <FontAwesome5 name="plus" size={12} color="white" />
                    <Text className="text-white font-bold text-xs ml-2">NOVO</Text>
                </TouchableOpacity>
            </View>

            {/* Tabs (Produtos / Pedidos) - Simulação via botões por enquanto */}
            <View className="flex-row p-4 gap-4">
                <TouchableOpacity className="flex-1 bg-blue-600 p-3 rounded-lg items-center">
                    <Text className="text-white font-bold">Produtos</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg items-center"
                    onPress={() => router.push('/admin/shop/orders')}
                >
                    <Text className="text-gray-700 dark:text-gray-300 font-bold">Pedidos</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0d6efd" className="mt-10" />
            ) : (
                <FlatList
                    data={products}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <FontAwesome5 name="box-open" size={48} color="#ccc" />
                            <Text className="text-gray-400 mt-4">Nenhum produto cadastrado.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

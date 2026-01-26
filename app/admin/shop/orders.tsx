import { View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { api } from '../../../src/services/api';
import '../../../global.css';

export default function AdminOrdersScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState<any[]>([]);

    useEffect(() => {
        loadOrders();
    }, []);

    async function loadOrders() {
        try {
            setLoading(true);
            // Assumindo endpoint '/admin/orders' existe ou '/orders?scope=admin'
            // Por enquanto, tentando pegar os próprios pedidos para teste visual, 
            // mas o ideal é criar rota de admin no backend depois
            const response = await api.get('/orders');
            setOrders(response.data.data || response.data);
        } catch (error) {
            console.error('Erro ao carregar pedidos', error);
        } finally {
            setLoading(false);
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-700';
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'canceled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: any = { 'paid': 'Pago', 'pending': 'Pendente', 'canceled': 'Cancelado', 'delivered': 'Entregue' };
        return labels[status] || status;
    };

    const renderItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-3 shadow-sm border border-gray-100 dark:border-gray-700"
            onPress={() => router.push(`/admin/shop/order-detail/${item.id}`)}
        >
            <View className="flex-row justify-between items-start mb-2">
                <Text className="text-gray-800 dark:text-gray-100 font-bold text-base">Pedido #{item.id}</Text>
                <View className={`px-2 py-1 rounded ${getStatusColor(item.status).split(' ')[0]}`}>
                    <Text className={`text-xs font-bold ${getStatusColor(item.status).split(' ')[1]}`}>
                        {getStatusLabel(item.status).toUpperCase()}
                    </Text>
                </View>
            </View>

            <Text className="text-gray-500 dark:text-gray-400 text-sm mb-2">
                {new Date(item.created_at).toLocaleDateString()} às {new Date(item.created_at).toLocaleTimeString().slice(0, 5)}
            </Text>

            <View className="bg-gray-50 dark:bg-gray-9000 p-3 rounded-lg">
                <Text className="font-bold text-gray-800 dark:text-gray-200">Total: R$ {parseFloat(item.total_amount).toFixed(2).replace('.', ',')}</Text>
                <Text className="text-xs text-gray-500 mt-1">{item.items?.length || 0} itens</Text>
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
                    <Text className="text-xl font-bold text-gray-800 dark:text-white">Gerenciar Pedidos</Text>
                </View>
            </View>

            {/* Tabs */}
            <View className="flex-row p-4 gap-4">
                <TouchableOpacity
                    className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-3 rounded-lg items-center"
                    onPress={() => router.replace('/admin/shop/products')}
                >
                    <Text className="text-gray-700 dark:text-gray-300 font-bold">Produtos</Text>
                </TouchableOpacity>
                <TouchableOpacity className="flex-1 bg-blue-600 p-3 rounded-lg items-center">
                    <Text className="text-white font-bold">Pedidos</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0d6efd" className="mt-10" />
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <FontAwesome5 name="shopping-bag" size={48} color="#ccc" />
                            <Text className="text-gray-400 mt-4">Nenhum pedido encontrado.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import '../../global.css';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: string;
}

interface Order {
    id: number;
    created_at: string;
    total_amount: string;
    status: string;
    items: OrderItem[];
}

export default function MyOrdersScreen() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    async function fetchOrders() {
        try {
            const response = await api.get('/my-orders');
            setOrders(response.data);
        } catch (error) {
            console.error('Erro ao buscar pedidos:', error);
            // Mock for UI test
            // setOrders([
            //     { id: 1001, created_at: new Date().toISOString(), total_amount: '150.00', status: 'paid', items: [{ id: 1, product_name: 'Camisa Oficial', quantity: 1, unit_price: '150.00' }] }
            // ]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => {
        fetchOrders();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400';
            case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400';
            case 'pending_payment': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400';
            case 'cancelled': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400';
            default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid': return 'Pago';
            case 'pending': return 'Pendente';
            case 'pending_payment': return 'Aguardando Pagamento';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const renderItem = ({ item }: { item: Order }) => {
        const statusStyle = getStatusColor(item.status);

        return (
            <View className="bg-white dark:bg-gray-800 p-5 rounded-2xl mb-4 border border-gray-100 dark:border-gray-700 shadow-sm">
                <View className="flex-row justify-between items-start mb-3">
                    <View>
                        <Text className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Pedido #{item.id}</Text>
                        <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
                            {new Date(item.created_at).toLocaleDateString('pt-BR')} às {new Date(item.created_at).toLocaleTimeString('pt-BR')}
                        </Text>
                    </View>
                    <View className={`px-2 py-1 rounded-md ${statusStyle.split(' ').slice(0, 2).join(' ')}`}>
                        <Text className={`text-[10px] font-bold uppercase ${statusStyle.split(' ').slice(2).join(' ')}`}>
                            {getStatusLabel(item.status)}
                        </Text>
                    </View>
                </View>

                <View className="border-t border-b border-gray-100 dark:border-gray-700 my-2 py-3 space-y-2">
                    {item.items && item.items.map(orderItem => (
                        <View key={orderItem.id} className="flex-row justify-between">
                            <Text className="text-gray-700 dark:text-gray-300 text-sm flex-1 mr-2">
                                <Text className="font-bold">{orderItem.quantity}x</Text> {orderItem.product_name || 'Produto'}
                            </Text>
                            <Text className="text-gray-700 dark:text-gray-300 text-sm font-medium">
                                R$ {orderItem.unit_price}
                            </Text>
                        </View>
                    ))}
                </View>

                <View className="flex-row justify-between items-center mt-1">
                    <Text className="text-gray-500 dark:text-gray-400 font-bold text-sm">Total</Text>
                    <Text className="text-lg font-bold text-gray-900 dark:text-white">
                        R$ {Number(item.total_amount).toFixed(2).replace('.', ',')}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-white dark:bg-gray-800 pt-12 pb-4 px-4 shadow-sm z-10 flex-row items-center border-b border-gray-100 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="mr-3 p-1 -ml-1 rounded-full active:bg-gray-100 dark:active:bg-gray-700">
                    <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 dark:text-white">Meus Pedidos</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4F46E5']} tintColor="#4F46E5" />
                    }
                    ListEmptyComponent={
                        <View className="items-center py-20">
                            <View className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <FontAwesome5 name="shopping-bag" size={32} color="#9CA3AF" />
                            </View>
                            <Text className="text-gray-900 dark:text-white font-bold text-lg">Nenhum pedido encontrado</Text>
                            <Text className="text-gray-500 dark:text-gray-400 mt-2 text-center px-8">
                                Seus pedidos de produtos e inscrições aparecerão aqui.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

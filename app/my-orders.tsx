import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import api from '../src/services/api';
import '../global.css';

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
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'pending_payment': return 'bg-orange-100 text-orange-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
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

    const renderItem = ({ item }: { item: Order }) => (
        <View className="bg-white p-4 rounded-xl mb-4 border border-gray-100 shadow-sm">
            <View className="flex-row justify-between items-start mb-2">
                <View>
                    <Text className="text-xs text-gray-500 font-bold uppercase tracking-wider">Pedido #{item.id}</Text>
                    <Text className="text-gray-400 text-xs">{new Date(item.created_at).toLocaleDateString('pt-BR')} às {new Date(item.created_at).toLocaleTimeString('pt-BR')}</Text>
                </View>
                <View className={`px-2 py-1 rounded-md ${getStatusColor(item.status).split(' ')[0]}`}>
                    <Text className={`text-xs font-bold ${getStatusColor(item.status).split(' ')[1]}`}>
                        {getStatusLabel(item.status)}
                    </Text>
                </View>
            </View>

            <View className="border-t border-gray-100 my-2 pt-2">
                {item.items && item.items.map(orderItem => (
                    <View key={orderItem.id} className="flex-row justify-between mb-1">
                        <Text className="text-gray-600 text-sm flex-1">
                            {orderItem.quantity}x {orderItem.product_name || 'Produto'}
                        </Text>
                        <Text className="text-gray-600 text-sm">
                            R$ {orderItem.unit_price}
                        </Text>
                    </View>
                ))}
            </View>

            <View className="flex-row justify-between items-center mt-2">
                <Text className="text-gray-500 font-bold">Total</Text>
                <Text className="text-lg font-bold text-gray-800">
                    R$ {Number(item.total_amount).toFixed(2).replace('.', ',')}
                </Text>
            </View>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm z-10 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800">Meus Pedidos</Text>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#059669']} />
                    }
                    ListEmptyComponent={
                        <View className="items-center py-20">
                            <FontAwesome5 name="shopping-bag" size={64} color="#ddd" />
                            <Text className="text-gray-400 mt-4 text-center">Você ainda não tem pedidos.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

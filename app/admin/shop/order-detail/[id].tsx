import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, Image, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { api } from '../../../../src/services/api';
import '../../../../global.css';

export default function OrderDetailScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [order, setOrder] = useState<any>(null);

    useEffect(() => {
        loadOrder();
    }, [id]);

    async function loadOrder() {
        try {
            setLoading(true);
            const response = await api.get(`/orders/${id}`);
            setOrder(response.data);
        } catch (error) {
            Alert.alert('Erro', 'Pedido não encontrado');
            router.back();
        } finally {
            setLoading(false);
        }
    }

    async function updateStatus(newStatus: string) {
        try {
            setLoading(true);
            // PUT /admin/orders/:id/status
            await api.put(`/admin/orders/${id}/status`, { status: newStatus });
            setOrder({ ...order, status: newStatus });
            Alert.alert('Sucesso', 'Status atualizado!');
        } catch (error) {
            Alert.alert('Erro', 'Falha ao atualizar status');
        } finally {
            setLoading(false);
        }
    }

    if (loading || !order) {
        return (
            <View className="flex-1 bg-gray-50 dark:bg-gray-900 justify-center items-center">
                <ActivityIndicator size="large" color="#0d6efd" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                        <MaterialIcons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800 dark:text-white">Pedido #{order.id}</Text>
                </View>
            </View>

            <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Info Cliente & Status */}
                <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 shadow-sm">
                    <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">DATA</Text>
                    <Text className="text-gray-800 dark:text-gray-100 font-bold mb-3">
                        {new Date(order.created_at).toLocaleString()}
                    </Text>

                    <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">STATUS</Text>
                    <View className="flex-row gap-2 flex-wrap">
                        {['pending', 'paid', 'delivered', 'canceled'].map(status => (
                            <TouchableOpacity
                                key={status}
                                onPress={() => updateStatus(status)}
                                className={`px-3 py-2 rounded-lg border ${order.status === status
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                                    }`}
                            >
                                <Text className={`text-xs font-bold ${order.status === status ? 'text-white' : 'text-gray-600 dark:text-gray-300'
                                    }`}>
                                    {status.toUpperCase()}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Itens */}
                <Text className="text-gray-800 dark:text-white font-bold mb-2 ml-1">Itens do Pedido</Text>
                {order.items?.map((item: any) => (
                    <View key={item.id} className="bg-white dark:bg-gray-800 p-3 rounded-xl mb-2 flex-row items-center">
                        <View className="w-12 h-12 bg-gray-200 rounded-lg mr-3 items-center justify-center">
                            <FontAwesome5 name="box" size={16} color="#666" />
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-gray-800 dark:text-white">{item.product_name}</Text>
                            <Text className="text-gray-500 text-xs">Qty: {item.quantity}</Text>
                        </View>
                        <Text className="font-bold text-gray-800 dark:text-white">
                            R$ {parseFloat(item.price).toFixed(2).replace('.', ',')}
                        </Text>
                    </View>
                ))}

                {/* Total */}
                <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mt-4">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-600 dark:text-gray-400">Subtotal</Text>
                        <Text className="text-gray-800 dark:text-white font-bold">R$ {parseFloat(order.total_amount).toFixed(2).replace('.', ',')}</Text>
                    </View>
                    <View className="h-px bg-gray-100 dark:bg-gray-700 my-2" />
                    <View className="flex-row justify-between">
                        <Text className="text-lg font-bold text-gray-800 dark:text-white">Total</Text>
                        <Text className="text-lg font-bold text-blue-600">R$ {parseFloat(order.total_amount).toFixed(2).replace('.', ',')}</Text>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

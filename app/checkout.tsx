import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import api from '../src/services/api';
import '../global.css';

export default function CheckoutScreen() {
    const { productId } = useLocalSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(false);
    const [coupon, setCoupon] = useState('');
    const [total, setTotal] = useState(100.00); // Mock, deveria vir do produto

    async function handlePayment() {
        setLoading(true);
        try {
            await api.post('/checkout', {
                club_id: 1,
                items: [{ product_id: productId, quantity: 1 }],
                total_amount: total
            });

            Alert.alert('Sucesso!', 'Pedido realizado. Aguardando pagamento.', [
                { text: 'OK', onPress: () => router.replace('/(tabs)') }
            ]);
        } catch (error) {
            Alert.alert('Erro', 'Falha ao processar pedido.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-gray-50 p-4 pt-12">
            <Text className="text-2xl font-bold text-gray-800 mb-6">Resumo do Pedido</Text>

            <View className="bg-white p-4 rounded-xl shadow-sm mb-4">
                <Text className="font-bold text-gray-800 mb-2">Item</Text>
                <View className="flex-row justify-between">
                    <Text className="text-gray-600">Camisa Oficial 2026 (M)</Text>
                    <Text className="font-bold text-gray-800">R$ {total.toFixed(2)}</Text>
                </View>
            </View>

            <View className="bg-white p-4 rounded-xl shadow-sm mb-6">
                <Text className="font-bold text-gray-800 mb-2">Cupom de Desconto</Text>
                <View className="flex-row">
                    <TextInput
                        className="flex-1 bg-gray-100 p-3 rounded-l-lg border border-gray-200"
                        placeholder="DIGITE O CÓDIGO"
                        value={coupon}
                        onChangeText={setCoupon}
                        autoCapitalize="characters"
                    />
                    <TouchableOpacity className="bg-gray-800 px-4 justify-center rounded-r-lg">
                        <Text className="text-white font-bold text-xs">APLICAR</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View className="mt-auto">
                <View className="flex-row justify-between mb-4">
                    <Text className="text-gray-500">Total a pagar</Text>
                    <Text className="text-2xl font-bold text-green-600">R$ {total.toFixed(2)}</Text>
                </View>

                <TouchableOpacity
                    className="bg-green-600 p-4 rounded-xl items-center flex-row justify-center py-5 shadow-lg"
                    onPress={handlePayment}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <FontAwesome5 name="qrcode" size={20} color="white" />
                            <Text className="text-white font-bold text-lg ml-3">Pagar com PIX</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

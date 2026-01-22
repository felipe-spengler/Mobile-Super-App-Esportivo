import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import '../global.css';

export default function CartScreen() {
    const router = useRouter();

    // Mock Items para visualização
    const cartItems = [
        { id: 1, name: 'Camisa Oficial 2026', price: 129.90, size: 'G', quantity: 1, image: 'tshirt' },
        { id: 2, name: 'Caneca do Clube', price: 49.90, size: 'Único', quantity: 2, image: 'mug-hot' }
    ];

    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shipping = 15.00;
    const total = subtotal + shipping;

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white p-4 pt-12 shadow-sm flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-3">
                        <MaterialIcons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">Seu Carrinho</Text>
                </View>
                <Text className="text-gray-500 font-medium">{cartItems.length} itens</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                {cartItems.map(item => (
                    <View key={item.id} className="bg-white p-4 rounded-xl mb-4 shadow-sm flex-row items-center">
                        <View className="w-16 h-16 bg-gray-100 rounded-lg items-center justify-center mr-4">
                            <FontAwesome5 name={item.image as any} size={24} color="#ccc" />
                        </View>

                        <View className="flex-1">
                            <Text className="font-bold text-gray-800 text-base">{item.name}</Text>
                            <Text className="text-gray-500 text-xs mb-1">Tamanho: {item.size}</Text>
                            <Text className="font-bold text-green-600">R$ {item.price.toFixed(2).replace('.', ',')}</Text>
                        </View>

                        <View className="items-center">
                            <View className="flex-row items-center bg-gray-100 rounded-lg mb-2">
                                <TouchableOpacity className="px-2 py-1"><Text>-</Text></TouchableOpacity>
                                <Text className="px-1 font-bold">{item.quantity}</Text>
                                <TouchableOpacity className="px-2 py-1"><Text>+</Text></TouchableOpacity>
                            </View>
                            <TouchableOpacity>
                                <FontAwesome5 name="trash" size={12} color="#ff4444" />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                {/* Cupom */}
                <View className="bg-white p-4 rounded-xl shadow-sm mb-6 flex-row items-center justify-between">
                    <View className="flex-row items-center">
                        <FontAwesome5 name="ticket-alt" size={16} color="#0044cc" />
                        <Text className="ml-2 text-gray-600 font-medium">Cupom de Desconto</Text>
                    </View>
                    <Text className="text-blue-600 font-bold text-xs uppercase">Adicionar</Text>
                </View>

                {/* Resumo */}
                <View className="mt-4 mb-20">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500">Subtotal</Text>
                        <Text className="text-gray-800 font-medium">R$ {subtotal.toFixed(2).replace('.', ',')}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-gray-500">Frete</Text>
                        <Text className="text-gray-800 font-medium">R$ {shipping.toFixed(2).replace('.', ',')}</Text>
                    </View>
                    <View className="border-t border-gray-200 mt-2 pt-2 flex-row justify-between">
                        <Text className="text-lg font-bold text-gray-800">Total</Text>
                        <Text className="text-xl font-bold text-green-600">R$ {total.toFixed(2).replace('.', ',')}</Text>
                    </View>
                </View>
            </ScrollView>

            {/* Checkout Button */}
            <View className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-100 safe-area-bottom">
                <TouchableOpacity
                    className="w-full bg-blue-600 py-4 rounded-xl items-center shadow-lg"
                    onPress={() => router.push('/checkout')}
                >
                    <Text className="text-white font-bold text-lg">Finalizar Compra</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

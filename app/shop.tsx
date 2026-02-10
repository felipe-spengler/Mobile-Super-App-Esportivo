import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import '../../global.css';

export default function ShopScreen() {
    const router = useRouter();

    const products = [
        { id: 1, name: 'Camisa Oficial 2026', price: 'R$ 149,90', image: 'bg-indigo-100', color: '#E0E7FF' },
        { id: 2, name: 'Boné Clube', price: 'R$ 59,90', image: 'bg-gray-100', color: '#F3F4F6' },
        { id: 3, name: 'Squeeze Térmica', price: 'R$ 49,90', image: 'bg-blue-100', color: '#DBEAFE' },
        { id: 4, name: 'Toalha Esportiva', price: 'R$ 39,90', image: 'bg-green-100', color: '#DCFCE7' },
    ];

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

            <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 24 }}>
                <View className="flex-row flex-wrap justify-between">
                    {products.map(product => (
                        <TouchableOpacity
                            key={product.id}
                            className="bg-white dark:bg-gray-800 p-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 w-[48%] mb-4 active:scale-[0.98] transition-transform"
                        >
                            <View
                                className="aspect-square rounded-xl mb-3 flex items-center justify-center relative"
                                style={{ backgroundColor: product.color }}
                            >
                                <FontAwesome5 name="tshirt" size={32} color="rgba(0,0,0,0.1)" />
                                <TouchableOpacity className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full">
                                    <MaterialIcons name="favorite-border" size={16} color="#9CA3AF" />
                                </TouchableOpacity>
                            </View>

                            <Text className="font-bold text-gray-800 dark:text-white text-sm mb-1" numberOfLines={1}>
                                {product.name}
                            </Text>
                            <Text className="text-indigo-600 dark:text-indigo-400 font-bold mb-3">
                                {product.price}
                            </Text>

                            <TouchableOpacity className="bg-gray-900 dark:bg-indigo-600 w-full py-2 rounded-lg items-center">
                                <Text className="text-white text-xs font-bold">Adicionar</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

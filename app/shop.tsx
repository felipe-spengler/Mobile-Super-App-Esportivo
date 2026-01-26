import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { api } from '../src/services/api';
import '../global.css';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';

export default function ShopScreen() {
    const router = useRouter();
    const { selectedClub } = useAuth();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProducts() {
            if (!selectedClub) return;

            try {
                const response = await api.get(`/clubs/${selectedClub.id}/products`);
                setProducts(response.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        loadProducts();
    }, [selectedClub]);

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white p-4 pt-12 shadow-sm flex-row items-center justify-between">
                <Text className="text-xl font-bold text-gray-800">Loja Oficial</Text>
                <TouchableOpacity onPress={() => router.push('/cart')}>
                    <FontAwesome5 name="shopping-cart" size={20} color="#333" />
                    <View className="absolute -top-2 -right-2 bg-red-500 w-5 h-5 rounded-full items-center justify-center">
                        <Text className="text-white text-[10px] font-bold">0</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <FlatList
                data={products}
                keyExtractor={(item: any) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={{ padding: 8 }}
                ListEmptyComponent={
                    <Text className="text-center text-gray-500 mt-10">Ainda não há produtos cadastrados.</Text>
                }
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="flex-1 bg-white m-2 p-3 rounded-xl shadow-sm items-center"
                        onPress={() => router.push({ pathname: '/product-detail', params: { productId: item.id } })}
                    >
                        <View className="w-24 h-24 bg-gray-100 rounded-lg mb-2 items-center justify-center">
                            <FontAwesome5 name="tshirt" size={40} color="#ccc" />
                        </View>

                        <Text className="font-bold text-gray-800 text-center mb-1" numberOfLines={2}>{item.name}</Text>

                        <Text className="text-green-600 font-bold text-lg">
                            R$ {Number(item.price).toFixed(2).replace('.', ',')}
                        </Text>

                        <TouchableOpacity className="bg-green-100 w-full py-2 rounded-lg mt-2 items-center">
                            <Text className="text-green-700 font-bold text-xs uppercase">Comprar</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

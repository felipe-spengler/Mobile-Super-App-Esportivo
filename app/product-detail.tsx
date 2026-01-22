import { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import api from '../src/services/api';
import '../global.css';

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    type: 'good' | 'service' | 'donation' | 'kit';
    variants: any; // JSON
}

export default function ProductDetailScreen() {
    const router = useRouter();
    const { productId } = useLocalSearchParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        async function fetchProduct() {
            try {
                const response = await api.get(`/products/${productId}`);
                setProduct(response.data);

                // Pré-selecionar primeiro tamanho se houver variantes
                const p = response.data;
                if (p.variants && p.variants.length > 0 && p.variants[0].options.length > 0) {
                    setSelectedSize(p.variants[0].options[0]);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        if (productId) fetchProduct();
    }, [productId]);

    if (loading) {
        return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#00cc66" /></View>;
    }

    if (!product) {
        return <View className="flex-1 justify-center items-center"><Text>Produto não encontrado.</Text></View>;
    }

    const sizes = product.variants && product.variants.length > 0 ? product.variants[0].options : [];
    const isDonation = product.type === 'donation';

    return (
        <View className="flex-1 bg-white">
            {/* Header */}
            <View className="absolute top-0 w-full z-10 flex-row justify-between p-4 pt-12">
                <TouchableOpacity onPress={() => router.back()} className="bg-white p-2 rounded-full shadow">
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => router.push('/cart')} className="bg-white p-2 rounded-full shadow">
                    <FontAwesome5 name="shopping-bag" size={20} color="#333" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Imagem (Placeholder) */}
                <View className="w-full h-80 bg-gray-100 items-center justify-center mb-6">
                    <FontAwesome5 name={isDonation ? 'hand-holding-heart' : 'tshirt'} size={100} color={isDonation ? '#ff8888' : '#ddd'} />
                </View>

                <View className="px-6">
                    <Text className="text-2xl font-bold text-gray-800 mb-2">{product.name}</Text>
                    <Text className="text-3xl font-bold text-green-600 mb-4">
                        R$ {Number(product.price).toFixed(2).replace('.', ',')}
                    </Text>

                    <Text className="text-gray-500 leading-6 mb-6">
                        {product.description || 'Sem descrição disponível para este produto.'}
                    </Text>

                    {/* Tamanhos (Só exibe se tiver variants e não for doação) */}
                    {!isDonation && sizes.length > 0 && (
                        <>
                            <Text className="font-bold text-gray-800 mb-3">Selecione o Tamanho:</Text>
                            <View className="flex-row gap-3 mb-6">
                                {sizes.map((size: string) => (
                                    <TouchableOpacity
                                        key={size}
                                        onPress={() => setSelectedSize(size)}
                                        className={`w-12 h-12 rounded-full items-center justify-center border ${selectedSize === size ? 'bg-black border-black' : 'bg-white border-gray-300'}`}
                                    >
                                        <Text className={selectedSize === size ? 'text-white font-bold' : 'text-gray-600'}>{size}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    )}
                </View>
            </ScrollView>

            {/* Bottom Bar */}
            <View className="absolute bottom-0 w-full bg-white p-4 border-t border-gray-100 flex-row items-center justify-between safe-area-bottom">
                <View className="flex-row items-center border border-gray-200 rounded-lg">
                    <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} className="p-3">
                        <Text className="text-xl font-bold text-gray-600">-</Text>
                    </TouchableOpacity>
                    <Text className="px-4 font-bold text-lg">{quantity}</Text>
                    <TouchableOpacity onPress={() => setQuantity(quantity + 1)} className="p-3">
                        <Text className="text-xl font-bold text-gray-600">+</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    className="flex-1 ml-4 bg-green-600 py-4 rounded-xl items-center shadow-lg"
                    onPress={() => router.push({ pathname: '/checkout', params: { productId: product.id } })} // MVP: Vai direto pro checkout
                >
                    <Text className="text-white font-bold text-lg">Comprar Agora</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}


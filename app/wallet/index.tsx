import { View, Text, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import '../../global.css';

export default function WalletScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [cardData, setCardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadWallet() {
            try {
                const response = await api.get('/wallet/my-card');
                setCardData(response.data);
            } catch (error) {
                console.log(error);
                // Fallback / Mock
                setCardData({
                    club_name: 'Clube Exemplo',
                    status: 'Ativo',
                    user_name: user?.name || 'Usuário',
                    user_id: user?.id || 12345,
                    qr_code_content: 'VALID_ACCESS_TOKEN_123',
                    expires_at: '31/12/2026',
                    avatar: user?.photo_url
                });
            } finally {
                setLoading(false);
            }
        }
        loadWallet();
    }, []);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    if (!cardData) {
        return (
            <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-900 p-6">
                <FontAwesome5 name="frown" size={48} color="#9CA3AF" />
                <Text className="text-gray-500 mt-4 text-center">Erro ao carregar carteirinha.</Text>
                <TouchableOpacity onPress={() => router.back()} className="mt-6">
                    <Text className="text-indigo-600 font-bold">Voltar</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900 justify-center items-center p-6">
            {/* Simple Header */}
            <TouchableOpacity
                onPress={() => router.back()}
                className="absolute top-12 left-6 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm"
            >
                <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
            </TouchableOpacity>

            <View className="w-full max-w-sm space-y-6">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mt-4 text-center">Carteirinha Digital</Text>

                {/* Card */}
                <LinearGradient
                    colors={['#312E81', '#1E40AF']} // Indigo 900 to Blue 800
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="rounded-3xl p-6 shadow-2xl overflow-hidden min-h-[220px] justify-between"
                    style={{ elevation: 10 }}
                >
                    {/* Background decoration elements (circles) */}
                    <View className="absolute top-0 right-[-20] w-32 h-32 bg-white opacity-10 rounded-full blur-2xl" />
                    <View className="absolute bottom-[-20] left-[-20] w-32 h-32 bg-indigo-500 opacity-20 rounded-full blur-2xl" />

                    <View className="flex-row justify-between items-start z-10">
                        <View className="flex-row items-center gap-2">
                            <View className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                <FontAwesome5 name="shield-alt" size={14} color="white" />
                            </View>
                            <Text className="font-bold tracking-wide text-white text-sm">
                                {cardData.club_name}
                            </Text>
                        </View>
                        <View className="bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
                            <Text className="text-[10px] font-bold uppercase tracking-wider text-white">
                                {cardData.status}
                            </Text>
                        </View>
                    </View>

                    <View className="flex-row items-center gap-4 my-6 z-10">
                        <View className="w-16 h-16 rounded-full bg-gray-200 border-2 border-white/30 flex items-center justify-center overflow-hidden">
                            {cardData.avatar || user?.photo_url ? (
                                <Image source={{ uri: cardData.avatar || user?.photo_url }} className="w-full h-full" resizeMode="cover" />
                            ) : (
                                <FontAwesome5 name="user" size={24} color="#9CA3AF" />
                            )}
                        </View>
                        <View>
                            <Text className="text-lg font-bold leading-tight text-white">{cardData.user_name}</Text>
                            <Text className="text-xs text-indigo-200 mt-0.5">ID: {cardData.user_id}</Text>
                        </View>
                    </View>

                    <View className="flex-row justify-between items-end z-10">
                        <View>
                            <Text className="text-[10px] text-indigo-300 uppercase tracking-widest mb-0.5">Validade</Text>
                            <Text className="text-sm font-bold font-mono text-white">{cardData.expires_at}</Text>
                        </View>
                        <View className="p-1.5 bg-white rounded-lg">
                            <QRCode
                                value={cardData.qr_code_content || 'invalid'}
                                size={48}
                                color="black"
                                backgroundColor="white"
                            />
                        </View>
                    </View>
                </LinearGradient>

                <View className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm text-center border border-gray-100 dark:border-gray-700">
                    <Text className="text-gray-500 dark:text-gray-400 text-sm">
                        Esta carteirinha é pessoal e intransferível. Apresente este QR Code na portaria do clube para liberar seu acesso.
                    </Text>
                </View>
            </View>
        </View>
    );
}

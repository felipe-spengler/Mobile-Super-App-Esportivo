import { View, Text, ActivityIndicator, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import api from '../../src/services/api';
import '../../global.css';

export default function WalletScreen() {
    const [cardData, setCardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadWallet() {
            try {
                const response = await api.get('/wallet/my-card');
                setCardData(response.data);
            } catch (error) {
                console.log(error);
                // Fallback para teste sem backend rodando liso
                setCardData({
                    club_name: 'Clube Teste',
                    status: 'Ativo',
                    user_name: 'Usuário Offline',
                    user_id: 123456,
                    qr_code_content: '123456',
                    expires_at: '01/01/2030'
                });
            } finally {
                setLoading(false);
            }
        }
        loadWallet();
    }, []);

    if (loading) return <View className="flex-1 justify-center items-center bg-gray-900"><ActivityIndicator color="#00C851" /></View>;

    if (!cardData) return <View className="flex-1 justify-center items-center bg-gray-900"><Text className="text-white">Erro ao carregar carteirinha.</Text></View>;

    return (
        <View className="flex-1 bg-gray-900 justify-center items-center p-6">
            <View className="bg-white w-full rounded-2xl overflow-hidden shadow-2xl h-[500px]">
                {/* Header Carteirinha */}
                <View className="bg-green-600 p-6 items-center">
                    <Text className="text-white font-bold text-lg uppercase">{cardData.club_name}</Text>
                    <Text className="text-green-100 text-xs tracking-widest">{cardData.status?.toUpperCase() || 'SÓCIO'}</Text>
                </View>

                {/* Corpo */}
                <View className="flex-1 items-center justify-center p-6">
                    <View className="w-32 h-32 bg-gray-200 rounded-full mb-6 border-4 border-white shadow-sm" />

                    <Text className="text-2xl font-bold text-gray-800 text-center">{cardData.user_name}</Text>
                    <Text className="text-gray-500 mb-6">Matrícula: {cardData.user_id?.toString().padStart(6, '0')}</Text>

                    <Image
                        source={{ uri: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(cardData.qr_code_content)}` }}
                        className="w-32 h-32"
                    />
                </View>

                {/* Footer */}
                <View className="bg-gray-100 p-4 items-center">
                    <Text className="text-green-600 font-bold text-xs uppercase">Válido até {cardData.expires_at}</Text>
                </View>
            </View>
        </View>
    );
}

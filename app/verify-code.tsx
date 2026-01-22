import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import '../global.css';

export default function VerifyCode() {
    const router = useRouter();
    return (
        <View className="flex-1 bg-white p-6 justify-center">
            <Text className="text-2xl font-bold text-gray-900 mb-2">Verificar Código</Text>
            <Text className="text-gray-500 mb-8">Digite o código de 6 dígitos enviado.</Text>

            <View className="flex-row justify-between mb-8">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <TextInput
                        key={i}
                        className="bg-gray-100 w-12 h-14 rounded-lg text-center text-xl font-bold"
                        maxLength={1}
                        keyboardType="number-pad"
                    />
                ))}
            </View>

            <TouchableOpacity
                className="bg-green-600 w-full p-4 rounded-xl items-center"
                onPress={() => router.push('/login')}
            >
                <Text className="text-white font-bold">Validar e Trocar Senha</Text>
            </TouchableOpacity>
        </View>
    );
}

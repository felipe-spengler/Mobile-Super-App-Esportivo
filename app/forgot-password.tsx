import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import '../global.css';

export default function ForgotPassword() {
    const router = useRouter();
    return (
        <View className="flex-1 bg-white p-6 justify-center">
            <Text className="text-2xl font-bold text-gray-900 mb-2">Recuperar Senha</Text>
            <Text className="text-gray-500 mb-8">Digite seu e-mail para receber o código.</Text>

            <TextInput
                className="bg-gray-100 p-4 rounded-xl mb-4 text-gray-800"
                placeholder="E-mail cadastrado"
            />

            <TouchableOpacity
                className="bg-green-600 w-full p-4 rounded-xl items-center"
                onPress={() => router.push('/verify-code')}
            >
                <Text className="text-white font-bold">Enviar Código</Text>
            </TouchableOpacity>
        </View>
    );
}

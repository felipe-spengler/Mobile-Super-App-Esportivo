import { View, Text, ScrollView, Image } from 'react-native';
import React from 'react';
import '../../global.css';

export default function AboutScreen() {
    return (
        <ScrollView className="flex-1 bg-white p-6 pt-12">
            <View className="items-center mb-8">
                <View className="w-24 h-24 bg-gray-100 rounded-full mb-4 items-center justify-center border border-gray-200">
                    <Text className="font-bold text-gray-400">LOGO</Text>
                </View>
                <Text className="text-2xl font-bold text-gray-900">Aplicativo Esportivo</Text>
                <Text className="text-gray-500">Versão 1.0.0</Text>
            </View>

            <Text className="text-gray-700 leading-6 mb-6">
                O App Oficial para gestão esportiva do seu clube. Acompanhe campeonatos,
                faça inscrições, compre produtos e muito mais.
            </Text>

            <Text className="font-bold text-gray-900 mb-2 mt-4">Desenvolvido por</Text>
            <Text className="text-gray-600">SoftHouse Tecnologia Esportiva</Text>

            <Text className="font-bold text-gray-900 mb-2 mt-6">Suporte</Text>
            <Text className="text-gray-600">contato@softhouse.com.br</Text>
        </ScrollView>
    );
}

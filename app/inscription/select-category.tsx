import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import '../../global.css';

const CATEGORIES = [
    { id: 1, name: 'Masculino Livre', price: 'R$ 200,00' },
    { id: 2, name: 'Veterano (+40)', price: 'R$ 150,00' },
    { id: 3, name: 'Feminino', price: 'R$ 100,00' }
];

export default function SelectCategory() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-gray-50 p-4 pt-12">
            <Text className="text-2xl font-bold text-gray-900 mb-2">Inscrição</Text>
            <Text className="text-gray-500 mb-6">Selecione a categoria para continuar.</Text>

            <FlatList
                data={CATEGORIES}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="bg-white p-4 rounded-xl mb-3 shadow-sm flex-row justify-between items-center border border-gray-100"
                        onPress={() => router.push('/inscription/team-roster')}
                    >
                        <View>
                            <Text className="font-bold text-gray-800 text-lg">{item.name}</Text>
                            <View className="flex-row items-center mt-1">
                                <FontAwesome5 name="users" size={12} color="#666" />
                                <Text className="text-gray-500 text-xs ml-2">Equipe</Text>
                            </View>
                        </View>
                        <Text className="font-bold text-green-600">{item.price}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

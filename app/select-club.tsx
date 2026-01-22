import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import '../global.css';

const MOCK_CLUBS = [
    { id: 1, name: 'Clube Toledão', city: 'Toledo - PR' },
    { id: 2, name: 'Yara Country Clube', city: 'Toledo - PR' },
];

export default function SelectClub() {
    const router = useRouter();
    return (
        <View className="flex-1 bg-white p-6 pt-12">
            <Text className="text-2xl font-bold text-gray-900 mb-6">Escolha o Clube</Text>

            <FlatList
                data={MOCK_CLUBS}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="bg-gray-50 p-4 rounded-xl mb-4 border border-gray-100 flex-row items-center"
                        onPress={() => router.push('/login')}
                    >
                        <View className="w-12 h-12 bg-blue-100 rounded-full mr-4" />
                        <View>
                            <Text className="font-bold text-gray-800">{item.name}</Text>
                            <Text className="text-gray-500 text-sm">{item.city}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
}

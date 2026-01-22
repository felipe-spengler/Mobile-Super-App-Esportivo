import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import React, { useState } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import '../../global.css';

const PLAYERS_MOCK = [
    { id: 1, name: 'João Silva', team: 'Real Madruga', photo: 'https://via.placeholder.com/150' },
    { id: 2, name: 'Pedro Santos', team: 'Barcelona FC', photo: 'https://via.placeholder.com/150' },
];

export default function CraqueDaGalera() {
    const [selectedId, setSelectedId] = useState<number | null>(null);

    return (
        <View className="flex-1 bg-gray-900 absolute bottom-0 w-full rounded-t-3xl h-[80%] pt-6">
            <View className="items-center mb-6 px-6">
                <View className="w-16 h-1 bg-gray-700 rounded-full mb-4" />
                <Text className="text-white text-xl font-bold">Quem foi o Craque?</Text>
                <Text className="text-gray-400 text-sm">Real Madruga vs Barcelona FC</Text>
            </View>

            <FlatList
                data={PLAYERS_MOCK}
                keyExtractor={item => item.id.toString()}
                numColumns={2}
                contentContainerStyle={{ padding: 16 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className={`flex-1 m-2 p-4 rounded-xl items-center border-2 ${selectedId === item.id ? 'border-green-500 bg-gray-800' : 'border-transparent bg-gray-800'}`}
                        onPress={() => setSelectedId(item.id)}
                    >
                        <View className="w-16 h-16 bg-gray-600 rounded-full mb-2" />
                        <Text className="text-white font-bold">{item.name}</Text>
                        <Text className="text-gray-400 text-xs">{item.team}</Text>
                    </TouchableOpacity>
                )}
            />

            <View className="p-6 bg-gray-900 border-t border-gray-800">
                <TouchableOpacity
                    className={`p-4 rounded-xl items-center ${selectedId ? 'bg-green-600' : 'bg-gray-700'}`}
                    disabled={!selectedId}
                >
                    <Text className="text-white font-bold text-lg">CONFIRMAR VOTO</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

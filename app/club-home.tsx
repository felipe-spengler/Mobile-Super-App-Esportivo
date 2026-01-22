import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import '../global.css';

const MOCK_MENU = [
    { id: 1, name: 'Futebol', icon: 'futbol', color: 'bg-green-600' },
    { id: 2, name: 'Vôlei', icon: 'volleyball-ball', color: 'bg-yellow-500' },
    { id: 3, name: 'Corrida', icon: 'running', color: 'bg-blue-500' },
    { id: 4, name: 'Tênis', icon: 'table-tennis', color: 'bg-orange-500' },
    { id: 5, name: 'Lutas', icon: 'fist-raised', color: 'bg-red-600' },
    { id: 6, name: 'Natação', icon: 'swimmer', color: 'bg-cyan-500' },
];

export default function ClubHomeScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const clubName = params.name || 'Clube Toledão';

    return (
        <View className="flex-1 bg-gray-100">
            <View className="bg-white p-6 pt-12 pb-4 shadow-sm border-b border-gray-200">
                <View className="flex-row justify-between items-center">
                    <View>
                        <Text className="text-2xl font-bold text-gray-800">
                            {clubName}
                        </Text>
                        <Text className="text-gray-500">Bem-vindo ao seu clube!</Text>
                    </View>
                    <TouchableOpacity onPress={() => router.back()} className="p-2 bg-gray-100 rounded-full">
                        <MaterialIcons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 20 }}>

                {/* Destaque / Banner */}
                <View className="bg-blue-900 rounded-2xl p-6 mb-6 overflow-hidden relative h-40 justify-center shadow-lg">
                    {/* Background Pattern */}
                    <View className="absolute right-0 top-0 opacity-20">
                        <FontAwesome5 name="medal" size={150} color="white" />
                    </View>

                    <Text className="text-white text-xl font-bold mb-1">Copa Verão 2026</Text>
                    <Text className="text-blue-200 text-sm mb-4">Inscrições abertas até 30/01</Text>

                    <TouchableOpacity className="bg-white px-4 py-2 rounded-full self-start" onPress={() => router.push('/championships')}>
                        <Text className="text-blue-900 font-bold text-xs">VER CAMPEONATOS</Text>
                    </TouchableOpacity>
                </View>

                {/* Atalhos Rápidos */}
                <Text className="text-lg font-bold text-gray-800 mb-4">Acesso Rápido</Text>

                <View className="bg-white rounded-xl p-4 flex-row justify-around shadow-sm mb-6">
                    <TouchableOpacity className="items-center" onPress={() => router.push('/wallet')}>
                        <View className="bg-blue-50 p-4 rounded-full mb-2">
                            <MaterialIcons name="qr-code-scanner" size={24} color="#0044cc" />
                        </View>
                        <Text className="text-xs text-gray-600 font-medium">Carteirinha</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="items-center" onPress={() => router.push('/shop')}>
                        <View className="bg-green-50 p-4 rounded-full mb-2">
                            <MaterialIcons name="shopping-bag" size={24} color="#00cc66" />
                        </View>
                        <Text className="text-xs text-gray-600 font-medium">Loja</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="items-center">
                        <View className="bg-orange-50 p-4 rounded-full mb-2">
                            <MaterialIcons name="calendar-today" size={24} color="#ff8800" />
                        </View>
                        <Text className="text-xs text-gray-600 font-medium">Agenda</Text>
                    </TouchableOpacity>
                </View>

                {/* Grid de Esportes */}
                <Text className="text-lg font-bold text-gray-800 mb-4">Modalidades</Text>

                <View className="flex-row flex-wrap justify-between">
                    {MOCK_MENU.map((sport) => (
                        <TouchableOpacity
                            key={sport.id}
                            className="w-[31%] aspect-square bg-white rounded-xl items-center justify-center mb-4 shadow-sm border border-gray-100"
                            onPress={() => router.push({
                                pathname: '/championships',
                                params: {
                                    sportId: sport.id,
                                    sportName: sport.name
                                }
                            })}
                        >
                            <View className={`w-12 h-12 ${sport.color} rounded-full items-center justify-center mb-2`}>
                                <FontAwesome5 name={sport.icon as any} size={20} color="white" />
                            </View>
                            <Text className="text-gray-700 font-medium text-xs">{sport.name}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </View>
    );
}

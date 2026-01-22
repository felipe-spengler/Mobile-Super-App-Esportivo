import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import '../../global.css';

export default function AdminHomeScreen() {
    const router = useRouter();

    // Mock Games assigned to this referee
    const games = [
        { id: 101, time: '19:00', home: 'Tigers FC', away: 'Lions United', status: 'scheduled' },
        { id: 102, time: '20:00', home: 'Águias', away: 'Falcões', status: 'scheduled' },
    ];

    return (
        <View className="flex-1 bg-gray-100">
            {/* Header */}
            <View className="bg-blue-900 pt-12 pb-6 px-6 rounded-b-[40px] mb-6 shadow-lg">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-blue-200 text-sm font-uppercase tracking-wider">Painel do Árbitro</Text>
                        <Text className="text-white text-2xl font-bold">Olá, Juiz Carlos</Text>
                    </View>
                    <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center border-2 border-white/30">
                        <FontAwesome5 name="whistle" size={20} color="white" />
                    </View>
                </View>

                {/* Status Card */}
                <View className="flex-row gap-3">
                    <View className="flex-1 bg-white/10 p-3 rounded-xl border border-white/20">
                        <Text className="text-3xl font-bold text-white">2</Text>
                        <Text className="text-blue-200 text-xs">Jogos Hoje</Text>
                    </View>
                    <View className="flex-1 bg-white/10 p-3 rounded-xl border border-white/20">
                        <Text className="text-3xl font-bold text-emerald-400">R$ 150</Text>
                        <Text className="text-blue-200 text-xs">A Receber</Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1 px-4">
                {/* Actions */}
                <Text className="text-gray-800 font-bold mb-3 uppercase text-xs tracking-wider">Ações Rápidas</Text>
                <View className="flex-row gap-3 mb-6">
                    <TouchableOpacity
                        onPress={() => router.push('/admin/scan')}
                        className="flex-1 bg-white p-4 rounded-xl items-center shadow-sm border border-gray-100"
                    >
                        <View className="w-12 h-12 bg-purple-100 rounded-full items-center justify-center mb-2">
                            <MaterialIcons name="qr-code-scanner" size={24} color="#9333ea" />
                        </View>
                        <Text className="font-bold text-gray-700">Validar Atleta</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="flex-1 bg-white p-4 rounded-xl items-center shadow-sm border border-gray-100">
                        <View className="w-12 h-12 bg-orange-100 rounded-full items-center justify-center mb-2">
                            <FontAwesome5 name="file-contract" size={20} color="#ea580c" />
                        </View>
                        <Text className="font-bold text-gray-700">Relatório</Text>
                    </TouchableOpacity>
                </View>

                {/* Today's Games */}
                <Text className="text-gray-800 font-bold mb-3 uppercase text-xs tracking-wider">Jogos de Hoje</Text>

                {games.map(game => (
                    <TouchableOpacity
                        key={game.id}
                        onPress={() => router.push({ pathname: '/admin/sumula', params: { gameId: game.id } })}
                        className="bg-white p-4 rounded-xl mb-3 shadow-md border-l-4 border-blue-600 flex-row items-center"
                    >
                        <View className="pr-4 border-r border-gray-100">
                            <Text className="text-xl font-bold text-gray-800">{game.time}</Text>
                        </View>
                        <View className="bg-gray-100 px-2 py-1 rounded text-xs mx-3">
                            <Text className="text-gray-500 font-bold text-[10px] uppercase">Futebol 7</Text>
                        </View>
                        <View className="flex-1">
                            <Text className="font-bold text-gray-800 text-lg">{game.home}</Text>
                            <Text className="text-gray-500 text-xs my-1">vs</Text>
                            <Text className="font-bold text-gray-800 text-lg">{game.away}</Text>
                        </View>
                        <FontAwesome5 name="chevron-right" size={16} color="#ccc" />
                    </TouchableOpacity>
                ))}

            </ScrollView>
        </View>
    );
}

import { useRef } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import '../global.css';

export default function MatchDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // Mock de dados para MVP (Em breve via API /championships/match/{id})
    const match = {
        home_team: 'Real Madruga',
        away_team: 'Barcelona FC',
        home_score: 2,
        away_score: 1,
        status: 'live',
        time: "35' 2T",
        events: [
            { type: 'goal', team: 'home', player: 'João', time: "12' 1T" },
            { type: 'card', team: 'away', player: 'Pedro', time: "40' 1T", card: 'yellow' },
            { type: 'goal', team: 'home', player: 'Marcos', time: "5' 2T" },
            { type: 'goal', team: 'away', player: 'Lucas', time: "20' 2T" },
        ]
    };

    return (
        <View className="flex-1 bg-gray-900">

            {/* Placar Principal */}
            <View className="pt-16 pb-10 px-6 bg-green-900 rounded-b-3xl shadow-lg relative overflow-hidden">
                {/* Pattern de Campo opcional */}

                <View className="flex-row justify-between items-center z-10">
                    <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-black/20 rounded-full items-center justify-center">
                        <FontAwesome5 name="arrow-left" size={16} color="white" />
                    </TouchableOpacity>
                    <View className="bg-red-600 px-3 py-1 rounded-full flex-row items-center">
                        <View className="w-2 h-2 rounded-full bg-white mr-2 animate-pulse" />
                        <Text className="text-white font-bold text-xs uppercase">Ao Vivo • {match.time}</Text>
                    </View>
                    <TouchableOpacity className="w-10 h-10 bg-black/20 rounded-full items-center justify-center">
                        <FontAwesome5 name="share-alt" size={16} color="white" />
                    </TouchableOpacity>
                </View>

                <View className="flex-row justify-between items-center mt-8 px-4 z-10">
                    <View className="items-center">
                        <View className="w-16 h-16 bg-white rounded-full items-center justify-center mb-2">
                            <Text className="text-xl font-bold text-gray-800">R</Text>
                        </View>
                        <Text className="text-white font-bold text-sm text-center w-24">{match.home_team}</Text>
                    </View>

                    <Text className="text-5xl font-black text-white px-4">
                        {match.home_score} : {match.away_score}
                    </Text>

                    <View className="items-center">
                        <View className="w-16 h-16 bg-white rounded-full items-center justify-center mb-2">
                            <Text className="text-xl font-bold text-gray-800">B</Text>
                        </View>
                        <Text className="text-white font-bold text-sm text-center w-24">{match.away_team}</Text>
                    </View>
                </View>
            </View>

            {/* Timeline de Lances */}
            <View className="flex-1 bg-gray-50 -mt-6 pt-10 rounded-t-3xl px-6">
                <Text className="text-gray-800 font-bold text-lg mb-6">Lances da Partida</Text>

                {match.events.map((event, index) => (
                    <View key={index} className="flex-row items-center mb-6 relative">
                        {/* Linha do tempo */}
                        <View className="absolute left-[54px] top-8 bottom-[-24px] w-[2px] bg-gray-200" />

                        <View className="bg-gray-200 px-2 py-1 rounded-md mr-4 w-12 items-center">
                            <Text className="font-bold text-xs text-gray-600">{event.time.split("'")[0]}'</Text>
                        </View>

                        <View className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${event.type === 'goal' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                            {event.type === 'goal' && <FontAwesome5 name="futbol" size={14} color="green" />}
                            {event.type === 'card' && <View className="w-3 h-4 bg-yellow-400 rounded-[2px]" />}
                        </View>

                        <View>
                            <Text className="text-gray-800 font-bold text-sm">
                                {event.type === 'goal' ? 'GOOOL!' : 'Cartão Amarelo'}
                            </Text>
                            <Text className="text-gray-500 text-xs">
                                {event.player} ({event.team === 'home' ? match.home_team : match.away_team})
                            </Text>
                        </View>
                    </View>
                ))}

                <TouchableOpacity className="mt-4 bg-blue-600 p-4 rounded-xl items-center flex-row justify-center">
                    <MaterialIcons name="how-to-vote" size={24} color="white" />
                    <Text className="text-white font-bold ml-2">Votar no Craque do Jogo</Text>
                </TouchableOpacity>

            </View>

        </View>
    );
}

import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import '../../global.css';

export default function SumulaDigitalScreen() {
    const router = useRouter();
    const { gameId } = useLocalSearchParams();

    // Game State
    const [scoreHome, setScoreHome] = useState(0);
    const [scoreAway, setScoreAway] = useState(0);
    const [period, setPeriod] = useState(1); // 1, 2
    const [time, setTime] = useState(0); // seconds
    const [isRunning, setIsRunning] = useState(false);
    const [events, setEvents] = useState<any[]>([]);

    useEffect(() => {
        let interval: any = null;
        if (isRunning) {
            interval = setInterval(() => {
                setTime(t => t + 1);
            }, 1000);
        } else if (!isRunning && time !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isRunning, time]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const addEvent = (type: 'goal' | 'yellow' | 'red', team: 'home' | 'away') => {
        const newEvent = {
            id: Date.now(),
            type,
            team,
            time: formatTime(time),
            period
        };
        setEvents([newEvent, ...events]);

        if (type === 'goal') {
            if (team === 'home') setScoreHome(s => s + 1);
            else setScoreAway(s => s + 1);
        }
    };

    const handleFinish = () => {
        Alert.alert('Encerrar Jogo', 'Confirmar resultado final?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Confirmar',
                onPress: () => {
                    router.back();
                    Alert.alert('Sucesso', 'Súmula enviada!');
                }
            }
        ]);
    };

    return (
        <View className="flex-1 bg-gray-900">
            {/* Placar Header */}
            <View className="pt-12 pb-6 px-4 bg-gray-900 border-b border-gray-800">
                <View className="flex-row justify-between items-center mb-6">
                    <TouchableOpacity onPress={() => router.back()}>
                        <FontAwesome5 name="arrow-left" size={20} color="white" />
                    </TouchableOpacity>
                    <Text className="text-gray-400 font-bold tracking-widest text-xs">SUMULA DIGITAL</Text>
                    <TouchableOpacity onPress={() => Alert.alert('Menu', 'Opções')}>
                        <FontAwesome5 name="ellipsis-v" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Score Board */}
                <View className="flex-row items-center justify-between px-2">
                    <View className="items-center w-1/3">
                        <Text className="text-white font-bold text-lg mb-2 text-center" numberOfLines={1}>Tigers FC</Text>
                        <Text className="text-6xl font-black text-white">{scoreHome}</Text>
                    </View>

                    <View className="items-center w-1/3">
                        <Text className={`text-4xl font-mono mb-2 ${isRunning ? 'text-green-400' : 'text-gray-500'}`}>
                            {formatTime(time)}
                        </Text>
                        <Text className="text-gray-400 text-xs font-bold uppercase mb-4">{period}º Tempo</Text>

                        <TouchableOpacity
                            onPress={() => setIsRunning(!isRunning)}
                            className={`w-14 h-14 rounded-full items-center justify-center ${isRunning ? 'bg-yellow-500' : 'bg-green-600'}`}
                        >
                            <FontAwesome5 name={isRunning ? "pause" : "play"} size={20} color="white" />
                        </TouchableOpacity>
                    </View>

                    <View className="items-center w-1/3">
                        <Text className="text-white font-bold text-lg mb-2 text-center" numberOfLines={1}>Lions Utd</Text>
                        <Text className="text-6xl font-black text-white">{scoreAway}</Text>
                    </View>
                </View>
            </View>

            {/* Controls */}
            <View className="flex-1 bg-gray-100 rounded-t-[30px] p-6">
                <View className="flex-row justify-between mb-8">
                    {/* Home Controls */}
                    <View className="flex-1 mr-2 gap-3">
                        <TouchableOpacity
                            onPress={() => addEvent('goal', 'home')}
                            className="bg-white p-4 rounded-xl items-center shadow-sm border-l-4 border-blue-600 flex-row justify-center gap-2"
                        >
                            <FontAwesome5 name="futbol" size={20} color="#2563eb" />
                            <Text className="font-bold text-gray-800">GOL</Text>
                        </TouchableOpacity>
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => addEvent('yellow', 'home')}
                                className="flex-1 bg-yellow-100 p-3 rounded-xl items-center border border-yellow-200"
                            >
                                <View className="w-4 h-6 bg-yellow-400 rounded-sm mb-1" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => addEvent('red', 'home')}
                                className="flex-1 bg-red-100 p-3 rounded-xl items-center border border-red-200"
                            >
                                <View className="w-4 h-6 bg-red-500 rounded-sm mb-1" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Away Controls */}
                    <View className="flex-1 ml-2 gap-3">
                        <TouchableOpacity
                            onPress={() => addEvent('goal', 'away')}
                            className="bg-white p-4 rounded-xl items-center shadow-sm border-r-4 border-red-600 flex-row justify-center gap-2"
                        >
                            <Text className="font-bold text-gray-800">GOL</Text>
                            <FontAwesome5 name="futbol" size={20} color="#dc2626" />
                        </TouchableOpacity>
                        <View className="flex-row gap-2">
                            <TouchableOpacity
                                onPress={() => addEvent('yellow', 'away')}
                                className="flex-1 bg-yellow-100 p-3 rounded-xl items-center border border-yellow-200"
                            >
                                <View className="w-4 h-6 bg-yellow-400 rounded-sm mb-1" />
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => addEvent('red', 'away')}
                                className="flex-1 bg-red-100 p-3 rounded-xl items-center border border-red-200"
                            >
                                <View className="w-4 h-6 bg-red-500 rounded-sm mb-1" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Timeline Feed */}
                <Text className="text-gray-500 font-bold mb-3 uppercase text-xs tracking-wider">Linha do Tempo</Text>
                <ScrollView className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                    {events.length === 0 && <Text className="text-center text-gray-400 mt-4">Jogo iniciado. Aguardando eventos...</Text>}

                    {events.map(ev => (
                        <View key={ev.id} className="flex-row items-center mb-3 border-b border-gray-50 pb-2 last:border-0">
                            <Text className="text-gray-400 font-mono text-xs w-12">{ev.time}</Text>
                            <View className="flex-1 flex-row items-center">
                                {ev.type === 'goal' && <FontAwesome5 name="futbol" size={14} color="#333" className="mr-2" />}
                                {ev.type === 'yellow' && <View className="w-3 h-4 bg-yellow-400 rounded-sm mr-2" />}
                                {ev.type === 'red' && <View className="w-3 h-4 bg-red-500 rounded-sm mr-2" />}

                                <Text className="font-bold text-gray-800 text-sm">
                                    {ev.type === 'goal' ? 'GOL!' : 'Cartão'} ({ev.team === 'home' ? 'Casa' : 'Visitante'})
                                </Text>
                            </View>
                        </View>
                    ))}
                </ScrollView>

                {/* Footer Action */}
                <TouchableOpacity onPress={handleFinish} className="bg-gray-900 mt-4 p-4 rounded-xl items-center">
                    <Text className="text-white font-bold uppercase tracking-widest">Encerrar Partida</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

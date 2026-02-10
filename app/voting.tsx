import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome5, Feather } from '@expo/vector-icons';
import '../../global.css';

export default function VotingScreen() {
    const router = useRouter();

    const polls = [
        { id: 1, question: 'Quem foi o melhor jogador da final?', options: ['João Silva (Tigres)', 'Pedro Santos (Leões)', 'Marcos (Goleiro)'] },
        { id: 2, question: 'Qual o melhor horário para os jogos de 2026?', options: ['Sábado de manhã', 'Domingo de manhã', 'Domingo a tarde'] },
    ];

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center p-4 pt-12 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2 rounded-full active:bg-gray-100 dark:active:bg-gray-700">
                    <MaterialIcons name="arrow-back" size={24} color="#4B5563" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 dark:text-white">Votação & Enquetes</Text>
            </View>

            <ScrollView className="p-4">
                {polls.map((poll) => (
                    <View key={poll.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-6">
                        <View className="p-4 bg-indigo-50 dark:bg-indigo-900/40 border-b border-indigo-100 dark:border-indigo-800">
                            <Text className="font-bold text-indigo-900 dark:text-indigo-200 flex-row items-center text-lg">
                                <Feather name="bar-chart-2" size={20} color="#4F46E5" />
                                <Text className="ml-2">{poll.question}</Text>
                            </Text>
                        </View>
                        <View className="p-4 space-y-3">
                            {poll.options.map((opt, idx) => (
                                <TouchableOpacity
                                    key={idx}
                                    className="w-full bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-600 flex-row justify-between items-center active:bg-indigo-50 dark:active:bg-indigo-900/20 active:border-indigo-500 mb-3"
                                >
                                    <Text className="text-gray-700 dark:text-gray-300 font-medium text-base">{opt}</Text>
                                    <FontAwesome5 name="thumbs-up" size={16} color="#D1D5DB" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
}

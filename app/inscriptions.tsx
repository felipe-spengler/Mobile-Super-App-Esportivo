
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import '../global.css';

export default function InscriptionsScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 shadow-sm flex-row items-center border-b border-gray-100 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <FontAwesome5 name="arrow-left" size={20} color={isDark ? "#FFF" : "#333"} />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4 text-gray-800 dark:text-white">Minhas Inscrições</Text>
            </View>

            <View className="flex-1 justify-center items-center p-6">
                <View className="bg-white dark:bg-gray-800 p-8 rounded-full mb-6 shadow-sm">
                    <FontAwesome5 name="clipboard-list" size={60} color={isDark ? "#374151" : "#E5E7EB"} />
                </View>
                <Text className="text-xl font-bold text-gray-800 dark:text-white mb-2">Nenhuma inscrição encontrada</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center leading-6">
                    Você ainda não se inscreveu em nenhum campeonato. Explore os eventos disponíveis e participe!
                </Text>

                <TouchableOpacity
                    className="mt-8 bg-green-600 px-8 py-3 rounded-full"
                    onPress={() => router.push('/(tabs)')}
                >
                    <Text className="text-white font-bold">Explorar Eventos</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

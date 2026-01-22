
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import '../global.css';

export default function CertificatesScreen() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white p-4 pt-12 shadow-sm flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <FontAwesome5 name="arrow-left" size={20} color="#333" />
                </TouchableOpacity>
                <Text className="text-xl font-bold ml-4 text-gray-800">Meus Certificados</Text>
            </View>

            <View className="flex-1 justify-center items-center p-6">
                <View className="bg-white p-8 rounded-full mb-6 shadow-sm">
                    <FontAwesome5 name="certificate" size={60} color="#E5E7EB" />
                </View>
                <Text className="text-xl font-bold text-gray-800 mb-2">Nenhum certificado</Text>
                <Text className="text-gray-500 text-center">
                    Complete eventos e campeonatos para conquistar seus certificados digitais.
                </Text>
            </View>
        </View>
    );
}

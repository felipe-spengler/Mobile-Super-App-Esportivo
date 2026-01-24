import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import api from '../../../src/services/api';
import '../../../global.css';

export default function TeamsListScreen() {
    const { id, category_id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState<any[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const response = await api.get(`/championships/${id}/teams`, {
                    params: { category_id }
                });
                setTeams(response.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id, category_id]);

    const renderItem = ({ item }: any) => (
        <View className="w-[48%] bg-white p-4 mb-4 rounded-xl shadow-sm border border-gray-100 items-center">
            <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-3 p-2 overflow-hidden border border-gray-100">
                {item.logo_url ? (
                    <Image source={{ uri: item.logo_url }} className="w-full h-full" resizeMode="contain" />
                ) : (
                    <FontAwesome5 name="shield-alt" size={30} color="#ccc" />
                )}
            </View>
            <Text className="font-bold text-gray-800 text-center text-sm mb-1" numberOfLines={2}>{item.name}</Text>
        </View>
    );

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white p-4 pt-12 border-b border-gray-200 flex-row items-center shadow-sm">
                <IconBtn name="arrow-back" onPress={() => router.back()} />
                <Text className="text-xl font-bold text-gray-800 ml-4">Equipes Participantes</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#00C851" className="mt-10" />
            ) : (
                <FlatList
                    data={teams}
                    keyExtractor={(item) => String(item.id)}
                    renderItem={renderItem}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'space-between' }}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <FontAwesome5 name="users" size={48} color="#ccc" />
                            <Text className="text-gray-400 mt-4 text-center">Nenhuma equipe encontrada.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

function IconBtn({ name, onPress }: any) {
    return (
        <View onTouchEnd={onPress} className="p-2">
            <MaterialIcons name={name} size={24} color="#333" />
        </View>
    );
}

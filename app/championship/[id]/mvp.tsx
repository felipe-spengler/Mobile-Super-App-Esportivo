import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import api from '../../../src/services/api';
import '../../../global.css';

export default function MVPLeaderboardScreen() {
    const { id, category_id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [mvps, setMvps] = useState<any[]>([]);

    useEffect(() => {
        async function loadData() {
            try {
                const response = await api.get(`/championships/${id}/mvp`, {
                    params: { category_id }
                });
                setMvps(response.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [id, category_id]);

    const renderItem = ({ item, index }: any) => {
        const isTop3 = index < 3;
        let badgeColor = 'text-gray-500';
        if (index === 0) badgeColor = 'text-yellow-500';
        if (index === 1) badgeColor = 'text-gray-400';
        if (index === 2) badgeColor = 'text-orange-500';

        return (
            <View className="flex-row items-center bg-white p-4 mb-2 rounded-xl shadow-sm border border-gray-100">
                <Text className={`font-bold text-lg w-8 text-center ${badgeColor} mr-2`}>{index + 1}º</Text>

                <View className="w-10 h-10 bg-gray-200 rounded-full items-center justify-center mr-3 overflow-hidden">
                    {item.player.profile_photo_url ? (
                        <Image source={{ uri: item.player.profile_photo_url }} className="w-full h-full" />
                    ) : (
                        <FontAwesome5 name="user" size={16} color="#999" solid />
                    )}
                </View>

                <View className="flex-1">
                    <Text className="font-bold text-gray-800 text-base">{item.player.name}</Text>
                    {item.player.team_name && (
                        <Text className="text-gray-500 text-xs uppercase">{item.player.team_name}</Text>
                    )}
                </View>

                <View className="items-center bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-100">
                    <Text className="font-extrabold text-yellow-600 text-lg">{item.count}</Text>
                    <Text className="text-[10px] text-yellow-600 font-bold uppercase">MVPs</Text>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white p-4 pt-12 border-b border-gray-200 flex-row items-center shadow-sm">
                <IconBtn name="arrow-back" onPress={() => router.back()} />
                <Text className="text-xl font-bold text-gray-800 ml-4">Melhores em Campo/Quadra</Text>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#00C851" className="mt-10" />
            ) : (
                <FlatList
                    data={mvps}
                    keyExtractor={(item) => String(item.player.id)}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="items-center justify-center mt-20">
                            <FontAwesome5 name="crown" size={48} color="#ccc" />
                            <Text className="text-gray-400 mt-4 text-center">Nenhum destaque registrado ainda.</Text>
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

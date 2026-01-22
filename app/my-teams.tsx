import { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import api from '../src/services/api';
import '../global.css';

interface Team {
    id: number;
    name: string;
    logo_url: string;
    primary_color: string;
    club?: {
        name: string;
    }
}

export default function MyTeamsScreen() {
    const router = useRouter();
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchTeams() {
            try {
                const response = await api.get('/my-teams');
                setTeams(response.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchTeams();
    }, []);

    const renderItem = ({ item }: { item: Team }) => (
        <TouchableOpacity
            onPress={() => router.push({ pathname: '/manage-roster', params: { teamId: item.id } })}
            className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-100 flex-row items-center"
        >
            <View
                className="w-16 h-16 rounded-full items-center justify-center mr-4"
                style={{ backgroundColor: item.primary_color || '#ccc' }}
            >
                {item.logo_url ? (
                    <Image source={{ uri: item.logo_url }} className="w-14 h-14 rounded-full" />
                ) : (
                    <FontAwesome5 name="users" size={24} color="white" />
                )}
            </View>

            <View className="flex-1">
                <Text className="font-bold text-lg text-gray-800">{item.name}</Text>
                <Text className="text-gray-500 text-xs uppercase tracking-wider">{item.club?.name || 'Clube'}</Text>
            </View>

            <FontAwesome5 name="chevron-right" size={16} color="#ccc" />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white pt-12 pb-4 px-4 shadow-sm flex-row items-center justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4">
                        <MaterialIcons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800">Meus Times</Text>
                </View>

                <TouchableOpacity className="bg-emerald-600 p-2 rounded-lg">
                    <FontAwesome5 name="plus" size={16} color="white" />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#059669" />
                </View>
            ) : (
                <FlatList
                    data={teams}
                    keyExtractor={item => String(item.id)}
                    renderItem={renderItem}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View className="items-center py-20">
                            <FontAwesome5 name="users-slash" size={64} color="#ddd" />
                            <Text className="text-gray-400 mt-4 text-center">Você não possui times cadastrados.</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

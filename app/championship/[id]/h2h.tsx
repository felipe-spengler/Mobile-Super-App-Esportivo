import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import api from '../../../src/services/api';
import '../../../global.css';

export default function HeadToHeadScreen() {
    const { id, category_id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [matches, setMatches] = useState<any[]>([]);

    // Selectors
    const [teams, setTeams] = useState<any[]>([]);
    const [team1, setTeam1] = useState<any>(null);
    const [team2, setTeam2] = useState<any>(null);
    const [selectingFor, setSelectingFor] = useState<'team1' | 'team2' | null>(null);

    // Stats
    const [stats, setStats] = useState({
        played: 0,
        wins1: 0,
        wins2: 0,
        draws: 0,
        goals1: 0,
        goals2: 0
    });

    useEffect(() => {
        // Load teams list for selection
        api.get(`/championships/${id}/teams`, { params: { category_id } })
            .then(res => setTeams(res.data))
            .catch(console.log);
    }, [id, category_id]);

    useEffect(() => {
        if (team1 && team2) {
            loadHistory();
        }
    }, [team1, team2]);

    async function loadHistory() {
        setLoading(true);
        try {
            const response = await api.get(`/championships/${id}/h2h`, {
                params: { team1: team1.id, team2: team2.id, category_id }
            });
            const data = response.data;
            setMatches(data);
            calculateStats(data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    function calculateStats(history: any[]) {
        let s = { played: history.length, wins1: 0, wins2: 0, draws: 0, goals1: 0, goals2: 0 };

        history.forEach(m => {
            const isHome1 = m.home_team_id === team1.id;
            const score1 = isHome1 ? m.home_score : m.away_score;
            const score2 = isHome1 ? m.away_score : m.home_score;

            s.goals1 += score1;
            s.goals2 += score2;

            if (score1 > score2) s.wins1++;
            else if (score2 > score1) s.wins2++;
            else s.draws++;
        });
        setStats(s);
    }

    const renderMatch = ({ item }: any) => {
        const date = new Date(item.start_time);
        return (
            <View className="bg-white p-3 mb-2 rounded-lg border border-gray-100 flex-row items-center justify-between">
                <Text className="text-gray-400 text-xs w-16 text-center">
                    {date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                </Text>

                <View className="flex-1 flex-row items-center justify-center gap-2">
                    <Text className={`font-bold ${item.home_team_id === team1?.id ? 'text-blue-600' : 'text-gray-700'}`}>
                        {item.home_score}
                    </Text>
                    <Text className="text-gray-400 text-xs">x</Text>
                    <Text className={`font-bold ${item.away_team_id === team1?.id ? 'text-blue-600' : 'text-gray-700'}`}>
                        {item.away_score}
                    </Text>
                </View>

                <View className="w-20 items-end">
                    <Text className="text-[10px] text-gray-500 uppercase font-bold" numberOfLines={1}>
                        {item.round_name}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white p-4 pt-12 border-b border-gray-200 flex-row items-center shadow-sm z-10">
                <IconBtn name="arrow-back" onPress={() => router.back()} />
                <Text className="text-xl font-bold text-gray-800 ml-4">Confronto Direto</Text>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* Selectors */}
                <View className="flex-row justify-between items-center mb-6">
                    <TeamSelector
                        team={team1}
                        placeholder="Time A"
                        onPress={() => setSelectingFor('team1')}
                        color="bg-blue-50 border-blue-200"
                    />
                    <View className="items-center justify-center">
                        <View className="w-8 h-8 rounded-full bg-gray-200 items-center justify-center">
                            <Text className="font-bold text-gray-500 text-xs">VS</Text>
                        </View>
                    </View>
                    <TeamSelector
                        team={team2}
                        placeholder="Time B"
                        onPress={() => setSelectingFor('team2')}
                        color="bg-red-50 border-red-200"
                    />
                </View>

                {team1 && team2 ? (
                    <>
                        {/* Stats Summary */}
                        <View className="bg-white rounded-xl p-4 shadow-sm mb-6 border-l-4 border-l-indigo-500">
                            <Text className="text-center font-bold text-gray-800 mb-4 uppercase text-xs tracking-widest">Histórico de Confrontos</Text>

                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="font-bold text-blue-600 text-xl">{stats.wins1}</Text>
                                <Text className="text-gray-400 text-xs uppercase">Vitórias</Text>
                                <Text className="font-bold text-red-600 text-xl">{stats.wins2}</Text>
                            </View>
                            <View className="h-2 bg-gray-100 rounded-full flex-row overflow-hidden mb-4">
                                <View style={{ flex: stats.wins1 || 1 }} className="bg-blue-500" />
                                <View style={{ flex: stats.draws }} className="bg-gray-300" />
                                <View style={{ flex: stats.wins2 || 1 }} className="bg-red-500" />
                            </View>

                            <View className="flex-row justify-around">
                                <StatBox label="Jogos" value={stats.played} />
                                <StatBox label="Empates" value={stats.draws} />
                                <StatBox label="Gols Time A" value={stats.goals1} />
                                <StatBox label="Gols Time B" value={stats.goals2} />
                            </View>
                        </View>

                        {/* Match History */}
                        <Text className="font-bold text-gray-700 mb-2 ml-1">Últimos Jogos</Text>
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            matches.map((m) => (
                                <View key={m.id}>
                                    {renderMatch({ item: m })}
                                </View>
                            ))
                        )}
                        {matches.length === 0 && !loading && (
                            <Text className="text-center text-gray-400 py-4">Nenhum confronto encontrado.</Text>
                        )}
                    </>
                ) : (
                    <View className="items-center justify-center py-20 opacity-50">
                        <FontAwesome5 name="handshake" size={60} color="#ccc" />
                        <Text className="mt-4 text-gray-400 font-medium">Selecione duas equipes para comparar</Text>
                    </View>
                )}
            </ScrollView>

            {/* Selection Modal */}
            <Modal visible={!!selectingFor} animationType="slide" transparent>
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white rounded-t-3xl h-[70%]">
                        <View className="p-4 border-b border-gray-100 flex-row justify-between items-center">
                            <Text className="font-bold text-lg text-gray-800">Selecionar Equipe</Text>
                            <TouchableOpacity onPress={() => setSelectingFor(null)} className="p-2">
                                <MaterialIcons name="close" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={teams}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    className="p-4 border-b border-gray-50 flex-row items-center"
                                    onPress={() => {
                                        if (selectingFor === 'team1') setTeam1(item);
                                        else setTeam2(item);
                                        setSelectingFor(null);
                                    }}
                                >
                                    <View className="w-10 h-10 bg-gray-100 rounded-full mr-3 items-center justify-center p-1">
                                        {item.logo_url ? (
                                            <Image source={{ uri: item.logo_url }} className="w-full h-full" resizeMode="contain" />
                                        ) : (
                                            <FontAwesome5 name="shield-alt" size={16} color="#ccc" />
                                        )}
                                    </View>
                                    <Text className="font-medium text-gray-800">{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </View>
    );
}

function TeamSelector({ team, placeholder, onPress, color }: any) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className={`w-[40%] aspect-square rounded-2xl items-center justify-center border-2 ${color} ${team ? 'bg-white' : ''} p-2`}
        >
            {team ? (
                <>
                    <View className="w-12 h-12 mb-2">
                        {team.logo_url ? (
                            <Image source={{ uri: team.logo_url }} className="w-full h-full" resizeMode="contain" />
                        ) : (
                            <FontAwesome5 name="shield-alt" size={40} color="#ccc" />
                        )}
                    </View>
                    <Text className="font-bold text-center text-xs text-gray-800 leading-tight" numberOfLines={2}>
                        {team.name}
                    </Text>
                </>
            ) : (
                <>
                    <FontAwesome5 name="plus" size={24} color="#999" />
                    <Text className="text-gray-400 text-xs font-bold mt-2 uppercase">{placeholder}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}

function StatBox({ label, value }: any) {
    return (
        <View className="items-center">
            <Text className="font-bold text-lg text-gray-800">{value}</Text>
            <Text className="text-[10px] text-gray-400 uppercase">{label}</Text>
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

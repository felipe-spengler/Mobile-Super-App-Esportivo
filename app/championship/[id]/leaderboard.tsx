import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import api from '../../../src/services/api';
import '../../../global.css';

interface Standing {
    id: number;
    team_name: string;
    team_logo?: string;
    position: number;
    points: number;
    played: number;
    won: number;
    drawn: number;
    lost: number;
    goal_difference: number;
    group_name?: string;
    stats?: any;
}

interface Match {
    id: number;
    team1_name: string;
    team2_name: string;
    team1_logo?: string;
    team2_logo?: string;
    team1_score?: number;
    team2_score?: number;
    round: string;
    match_date?: string;
    winner_team_id?: number;
}

export default function LeaderboardScreen() {
    const { id, category_id } = useLocalSearchParams();
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [table, setTable] = useState<Standing[]>([]);
    const [knockoutMatches, setKnockoutMatches] = useState<Match[]>([]);
    const [championshipFormat, setChampionshipFormat] = useState('league');
    const [sportSlug, setSportSlug] = useState('futebol');
    const [champName, setChampName] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const champRes = await api.get(`/championships/${id}`);
                setSportSlug(champRes.data.sport?.slug || 'futebol');
                setChampName(champRes.data.name || '');
                setChampionshipFormat(champRes.data.format || 'league');

                if (champRes.data.format === 'knockout') {
                    const matchesRes = await api.get(`/championships/${id}/knockout-bracket`, { params: { category_id } });
                    setKnockoutMatches(matchesRes.data);
                } else {
                    const tableRes = await api.get(`/championships/${id}/leaderboard`, { params: { category_id } });
                    setTable(tableRes.data);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const isVolei = sportSlug === 'volei';

    const getMedalColor = (position: number) => {
        if (position === 1) return 'bg-yellow-400';
        if (position === 2) return 'bg-gray-400';
        if (position === 3) return 'bg-orange-400';
        return 'bg-gray-200';
    };

    // League table renderer
    const renderLeagueItem = ({ item, index }: { item: Standing; index: number }) => (
        <View className={`flex-row p-3 items-center border-b border-gray-100 ${index < 3 ? 'bg-indigo-50' : index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
            <View className={`w-6 h-6 rounded-full ${getMedalColor(item.position)} items-center justify-center mr-2`}>
                <Text className="text-xs font-bold text-gray-800">{item.position}</Text>
            </View>
            <Text className="flex-1 font-semibold text-gray-800 ml-1" numberOfLines={1}>{item.team_name}</Text>
            <Text className="w-10 text-center font-black text-indigo-900">{item.points}</Text>
            <Text className="w-8 text-center text-gray-600">{item.played}</Text>
            <Text className="w-8 text-center text-green-600 font-bold">{item.won}</Text>
            {!isVolei && <Text className="w-8 text-center text-gray-500">{item.drawn}</Text>}
            <Text className="w-8 text-center text-red-500">{item.lost}</Text>
        </View>
    );

    // Group stage renderer
    const renderGroupStage = () => {
        const groups: { [key: string]: Standing[] } = {};
        table.forEach((team) => {
            const groupName = team.group_name || 'Grupo A';
            if (!groups[groupName]) groups[groupName] = [];
            groups[groupName].push(team);
        });

        return (
            <ScrollView className="p-4" showsVerticalScrollIndicator={false}>
                {Object.entries(groups).map(([groupName, teams]) => (
                    <View key={groupName} className="mb-4 bg-white rounded-xl overflow-hidden shadow-sm">
                        <View className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3">
                            <Text className="font-bold text-white text-sm uppercase tracking-wide">{groupName}</Text>
                        </View>
                        <View>
                            <View className="bg-blue-50 flex-row p-2 border-b border-blue-200">
                                <Text className="w-8 text-center font-bold text-blue-800 text-xs">#</Text>
                                <Text className="flex-1 font-bold text-blue-800 text-xs ml-1">Time</Text>
                                <Text className="w-8 text-center font-bold text-blue-800 text-xs">P</Text>
                                <Text className="w-8 text-center font-bold text-blue-800 text-xs">J</Text>
                                <Text className="w-8 text-center font-bold text-blue-800 text-xs">V</Text>
                                <Text className="w-8 text-center font-bold text-blue-800 text-xs">D</Text>
                            </View>
                            {teams.map((team, idx) => (
                                <View key={team.id} className="flex-row p-2 border-b border-gray-100">
                                    <Text className="w-8 text-center font-bold text-gray-600 text-xs">{idx + 1}</Text>
                                    <Text className="flex-1 font-semibold text-gray-800 text-xs ml-1" numberOfLines={1}>{team.team_name}</Text>
                                    <Text className="w-8 text-center font-bold text-indigo-900 text-xs">{team.points}</Text>
                                    <Text className="w-8 text-center text-gray-600 text-xs">{team.played}</Text>
                                    <Text className="w-8 text-center text-green-600 font-bold text-xs">{team.won}</Text>
                                    <Text className="w-8 text-center text-red-500 text-xs">{team.lost}</Text>
                                </View>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>
        );
    };

    // Knockout bracket renderer
    const renderKnockoutBracket = () => {
        const rounds: { [key: string]: Match[] } = {
            final: [],
            semi: [],
            quarter: [],
            round_of_16: []
        };

        knockoutMatches.forEach((match) => {
            if (rounds[match.round]) {
                rounds[match.round].push(match);
            }
        });

        const roundLabels: { [key: string]: string } = {
            round_of_16: 'Oitavas',
            quarter: 'Quartas',
            semi: 'Semifinais',
            final: 'Final'
        };

        return (
            <ScrollView horizontal showsHorizontalScrollIndicator={true} className="p-4">
                <View className="flex-row gap-3">
                    {['round_of_16', 'quarter', 'semi', 'final'].map((roundKey) => {
                        const matchesInRound = rounds[roundKey];
                        if (!matchesInRound || matchesInRound.length === 0) return null;

                        return (
                            <View key={roundKey} className="gap-2">
                                <Text className="text-xs font-bold text-center text-indigo-600 uppercase tracking-wide mb-1">
                                    {roundLabels[roundKey]}
                                </Text>
                                {matchesInRound.map((match) => {
                                    const team1Won = match.team1_score !== null && match.team2_score !== null && match.team1_score > match.team2_score;
                                    const team2Won = match.team1_score !== null && match.team2_score !== null && match.team2_score > match.team1_score;

                                    return (
                                        <View key={match.id} className=" bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden" style={{ width: 180 }}>
                                            <View className={`flex-row items-center justify-between px-3 py-2 ${team1Won ? 'bg-green-50 border-l-4 border-green-500' : ''}`}>
                                                <View className="flex-row items-center gap-2 flex-1">
                                                    {match.team1_logo && <Image source={{ uri: match.team1_logo }} className="w-5 h-5 rounded-full" />}
                                                    <Text className="font-semibold text-gray-800 text-xs flex-1" numberOfLines={1}>{match.team1_name}</Text>
                                                </View>
                                                <Text className="font-bold text-gray-900 text-sm ml-2">{match.team1_score ?? '-'}</Text>
                                            </View>
                                            <View className="h-px bg-gray-200" />
                                            <View className={`flex-row items-center justify-between px-3 py-2 ${team2Won ? 'bg-green-50 border-l-4 border-green-500' : ''}`}>
                                                <View className="flex-row items-center gap-2 flex-1">
                                                    {match.team2_logo && <Image source={{ uri: match.team2_logo }} className="w-5 h-5 rounded-full" />}
                                                    <Text className="font-semibold text-gray-800 text-xs flex-1" numberOfLines={1}>{match.team2_name}</Text>
                                                </View>
                                                <Text className="font-bold text-gray-900 text-sm ml-2">{match.team2_score ?? '-'}</Text>
                                            </View>
                                            {match.match_date && (
                                                <View className="bg-gray-50 px-3 py-1">
                                                    <Text className="text-[10px] text-gray-500 text-center">
                                                        {new Date(match.match_date).toLocaleDateString('pt-BR')}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        );
    };

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white p-4 pt-12 shadow-sm flex-row items-center border-b border-gray-200">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <FontAwesome5 name="arrow-left" size={20} color="#3B82F6" />
                </TouchableOpacity>
                <View className="ml-4">
                    <Text className="text-xl font-bold text-gray-800">Classificação</Text>
                    <Text className="text-xs text-gray-500 mt-1">{champName}</Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" className="mt-10" color="#3B82F6" />
            ) : (
                <>
                    {championshipFormat === 'knockout' && knockoutMatches.length === 0 && (
                        <Text className="text-center mt-10 text-gray-500">Chaveamento não disponível.</Text>
                    )}
                    {championshipFormat === 'knockout' && knockoutMatches.length > 0 && renderKnockoutBracket()}

                    {(championshipFormat === 'league' || championshipFormat === 'racing') && (
                        <>
                            <View className="bg-indigo-100 flex-row p-3 border-b border-indigo-200">
                                <Text className="w-8 text-center font-bold text-indigo-800">#</Text>
                                <Text className="flex-1 font-bold text-indigo-800 ml-2">Time</Text>
                                <Text className="w-10 text-center font-bold text-indigo-800">P</Text>
                                <Text className="w-8 text-center font-bold text-indigo-800">J</Text>
                                <Text className="w-8 text-center font-bold text-indigo-800">V</Text>
                                {!isVolei && <Text className="w-8 text-center font-bold text-indigo-800">E</Text>}
                                <Text className="w-8 text-center font-bold text-indigo-800">D</Text>
                            </View>
                            {table.length === 0 ? (
                                <Text className="text-center mt-10 text-gray-500">Classificação não disponível.</Text>
                            ) : (
                                <FlatList
                                    data={table}
                                    keyExtractor={(item) => (item.id || Math.random()).toString()}
                                    renderItem={renderLeagueItem}
                                />
                            )}
                        </>
                    )}

                    {championshipFormat === 'group_knockout' && table.length === 0 && (
                        <Text className="text-center mt-10 text-gray-500">Classificação dos grupos não disponível.</Text>
                    )}
                    {championshipFormat === 'group_knockout' && table.length > 0 && renderGroupStage()}
                </>
            )}
        </View>
    );
}

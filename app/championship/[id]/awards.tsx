import { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import api from '../../../src/services/api';
import '../../../global.css';

interface CategoryConfig {
    key: string;
    title: string;
    icon: string;
    color: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
    isGroup?: boolean;
}

// Configurado para Dark Mode e Layout Compacto
const CATEGORIES_CONFIG: CategoryConfig[] = [
    { key: 'craque_rodada', title: 'Craque da Rodada', icon: 'star', color: '#0d6efd', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-blue-600 dark:text-blue-400', borderClass: 'border-l-4 border-l-blue-600 dark:border-l-blue-500', isGroup: true },
    { key: 'goleiro', title: 'Melhor Goleiro', icon: 'hand-paper', color: '#198754', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-green-600 dark:text-green-400', borderClass: 'border-l-4 border-l-green-600 dark:border-l-green-500' },
    { key: 'lateral', title: 'Melhor Lateral', icon: 'running', color: '#0dcaf0', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-cyan-600 dark:text-cyan-400', borderClass: 'border-l-4 border-l-cyan-600 dark:border-l-cyan-500' },
    { key: 'meia', title: 'Melhor Meia', icon: 'futbol', color: '#ffc107', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-yellow-600 dark:text-yellow-400', borderClass: 'border-l-4 border-l-yellow-400 dark:border-l-yellow-400' },
    { key: 'atacante', title: 'Melhor Atacante', icon: 'bullseye', color: '#dc3545', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-red-600 dark:text-red-400', borderClass: 'border-l-4 border-l-red-600 dark:border-l-red-500' },
    { key: 'artilheiro', title: 'Artilheiro', icon: 'trophy', color: '#212529', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-gray-800 dark:text-gray-200', borderClass: 'border-l-4 border-l-gray-800 dark:border-l-gray-200' },
    { key: 'assistencia', title: 'Assistências', icon: 'hands-helping', color: '#6c757d', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-gray-600 dark:text-gray-400', borderClass: 'border-l-4 border-l-gray-600 dark:border-l-gray-400' },
    { key: 'volante', title: 'Melhor Volante', icon: 'shield-alt', color: '#0d6efd', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-blue-600 dark:text-blue-400', borderClass: 'border-l-4 border-l-blue-600 dark:border-l-blue-500' },
    { key: 'estreante', title: 'Melhor Estreante', icon: 'user-plus', color: '#198754', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-green-600 dark:text-green-400', borderClass: 'border-l-4 border-l-green-600 dark:border-l-green-500' },
    { key: 'zagueiro', title: 'Melhor Zagueiro', icon: 'shield-alt', color: '#0dcaf0', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-cyan-600 dark:text-cyan-400', borderClass: 'border-l-4 border-l-cyan-600 dark:border-l-cyan-500' },
    { key: 'melhor_jogador', title: 'Melhor do Camp.', icon: 'medal', color: '#6c757d', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-gray-600 dark:text-gray-400', borderClass: 'border-l-4 border-l-gray-600 dark:border-l-gray-400' },

    // Vôlei
    { key: 'levantadora', title: 'Melhor Levantadora', icon: 'hand-sparkles', color: '#0d6efd', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-blue-600 dark:text-blue-400', borderClass: 'border-l-4 border-l-blue-600 dark:border-l-blue-500' },
    { key: 'libero', title: 'Melhor Líbero', icon: 'shield-alt', color: '#dc3545', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-red-600 dark:text-red-400', borderClass: 'border-l-4 border-l-red-600 dark:border-l-red-500' },
    { key: 'oposta', title: 'Melhor Oposta', icon: 'bullseye', color: '#fd7e14', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-orange-600 dark:text-orange-400', borderClass: 'border-l-4 border-l-orange-500 dark:border-l-orange-400' },
    { key: 'ponteira', title: 'Melhor Ponteira', icon: 'running', color: '#198754', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-green-600 dark:text-green-400', borderClass: 'border-l-4 border-l-green-600 dark:border-l-green-500' },
    { key: 'central', title: 'Melhor Central', icon: 'signal', color: '#0dcaf0', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-cyan-600 dark:text-cyan-400', borderClass: 'border-l-4 border-l-cyan-600 dark:border-l-cyan-500' },
    { key: 'pontuador', title: 'Maior Pontuador', icon: 'trophy', color: '#212529', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-gray-800 dark:text-gray-200', borderClass: 'border-l-4 border-l-gray-800 dark:border-l-gray-200' },
    { key: 'saque', title: 'Melhor Saque', icon: 'volleyball-ball', color: '#212529', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-gray-800 dark:text-gray-200', borderClass: 'border-l-4 border-l-gray-800 dark:border-l-gray-200' },
    { key: 'bloqueio', title: 'Melhor Bloqueio', icon: 'hand-paper', color: '#0d6efd', bgClass: 'bg-white dark:bg-gray-800', textClass: 'text-blue-600 dark:text-blue-400', borderClass: 'border-l-4 border-l-blue-600 dark:border-l-blue-500' },
];

export default function AwardsScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [championship, setChampionship] = useState<any>(null);
    const [matches, setMatches] = useState<any[]>([]);
    const [viewMode, setViewMode] = useState<'dashboard' | 'match_list'>('dashboard');

    useEffect(() => {
        loadData();
    }, [id]);

    async function loadData() {
        try {
            setLoading(true);
            const [champRes, matchesRes] = await Promise.all([
                api.get(`/championships/${id}`),
                api.get(`/championships/${id}/matches`)
            ]);
            setChampionship(champRes.data);
            setMatches(matchesRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const getVisibleCategories = () => {
        if (!championship) return [];
        const activeKeys = new Set<string>();
        activeKeys.add('craque_rodada');
        if (championship.awards) {
            Object.keys(championship.awards).forEach(k => activeKeys.add(k));
        }

        let filtered = CATEGORIES_CONFIG.filter(c => {
            if (c.isGroup) return true;
            if (championship.awards && championship.awards[c.key]) return true;
            return false;
        });

        if (filtered.length <= 1) {
            const deepAwardsCheck = championship.awards ? JSON.stringify(championship.awards) : '';
            if (!deepAwardsCheck.includes('levantadora')) {
                const defaults = ['goleiro', 'artilheiro', 'lateral', 'meia', 'atacante', 'zagueiro', 'volante', 'melhor_jogador'];
                const defaultItems = CATEGORIES_CONFIG.filter(c => defaults.includes(c.key));
                filtered = [...filtered, ...defaultItems];
            }
        }
        return Array.from(new Set(filtered));
    };

    const handleCategoryPress = (category: CategoryConfig) => {
        if (category.key === 'craque_rodada') {
            setViewMode('match_list');
        } else {
            const awardData = championship.awards?.[category.key];
            if (awardData && awardData.player_id) {
                router.push({
                    pathname: `/championship/[id]/generated-award`,
                    params: {
                        id: id as string,
                        awardId: `champ-${category.key}`,
                        category: category.key,
                        playerId: awardData.player_id,
                        photoId: awardData.photo_id,
                        type: 'championship',
                        context: 'Premiação do Campeonato',
                        championshipName: championship.name
                    }
                });
            }
        }
    };

    const renderDashboardItem = ({ item }: { item: CategoryConfig }) => {
        const isConfigured = item.isGroup
            ? matches.some(m => m.mvp_player_id || (m.awards && m.awards.craque?.player_id))
            : (championship.awards?.[item.key]?.player_id);

        return (
            <TouchableOpacity
                className={`rounded-xl mb-4 shadow-sm w-[48%] ${item.bgClass} ${item.borderClass} flex-row justify-between items-center p-4 border border-gray-100 dark:border-gray-700 min-h-[80px]`}
                onPress={() => handleCategoryPress(item)}
                activeOpacity={0.7}
            >
                <View className="flex-1 mr-2">
                    <Text className={`font-bold text-[10px] uppercase mb-1 ${item.textClass} tracking-tight leading-3`} numberOfLines={2}>
                        {item.title}
                    </Text>
                    <Text className="text-[9px] text-gray-400 dark:text-gray-500 font-medium">
                        {isConfigured ? (item.isGroup ? 'Ver lista' : 'Pronto') : '(Vazio)'}
                    </Text>
                </View>

                <View>
                    <FontAwesome5 name={item.icon} size={20} color={item.color} style={{ opacity: isConfigured ? 1 : 0.4 }} />
                </View>

                {!isConfigured && !item.isGroup && (
                    <View className="absolute inset-0 bg-white/60 dark:bg-black/60 z-10 rounded-xl" />
                )}
            </TouchableOpacity>
        );
    };

    const renderMatchItem = ({ item }: { item: any }) => {
        let playerId = item.mvp_player_id;
        let photoId = null;
        if (item.awards && item.awards.craque) {
            playerId = item.awards.craque.player_id || playerId;
            photoId = item.awards.craque.photo_id;
        }

        if (!playerId) return null;

        return (
            <View className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-3 border-l-4 border-blue-600 overflow-hidden">
                <View className="p-3 flex-row justify-between items-center">
                    <View className="flex-1">
                        <Text className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase mb-1">
                            {item.round_name || 'Rodada'}
                        </Text>
                        <Text className="text-gray-800 dark:text-gray-200 font-bold text-xs">
                            {item.home_team?.name} {item.home_score}x{item.away_score} {item.away_team?.name}
                        </Text>
                        <View className="flex-row items-center mt-1">
                            <FontAwesome5 name="star" size={10} color="#0d6efd" solid />
                            <Text className="text-blue-600 dark:text-blue-400 font-bold text-[10px] ml-1">MVP: Atleta #{playerId}</Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        className="bg-blue-600 px-3 py-2 rounded shadow-sm flex-row items-center"
                        onPress={() => router.push({
                            pathname: `/championship/[id]/generated-award`,
                            params: {
                                id: id as string,
                                awardId: `match-${item.id}`,
                                category: 'craque',
                                playerId: playerId,
                                photoId: photoId,
                                type: 'match',
                                context: `${item.round_name || 'Rodada'}`,
                                matchTitle: `${item.home_team?.name} x ${item.away_team?.name}`,
                                score: `${item.home_score} x ${item.away_score}`,
                                championshipName: championship.name,
                                round: item.round_name
                            }
                        })}
                    >
                        <FontAwesome5 name="image" size={12} color="white" className="mr-2" />
                        <Text className="text-white text-[10px] font-bold">VER ARTE</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900">
                <ActivityIndicator size="large" color="#00C851" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-100 dark:bg-gray-900">
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 border-b border-gray-200 dark:border-gray-700 flex-row items-center shadow-sm z-10">
                <TouchableOpacity onPress={() => viewMode === 'match_list' ? setViewMode('dashboard') : router.back()} className="p-2">
                    <MaterialIcons name="arrow-back" size={24} color="#333" className="dark:text-white" />
                </TouchableOpacity>
                <View className="ml-4 flex-1">
                    <Text className="text-lg font-bold text-gray-800 dark:text-white" numberOfLines={1}>
                        {viewMode === 'match_list' ? 'Destaques da Rodada' : 'Galeria de Artes'}
                    </Text>
                    <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
                        {championship?.name}
                    </Text>
                </View>
            </View>

            {viewMode === 'dashboard' ? (
                <FlatList
                    key="dashboard-grid"
                    data={getVisibleCategories()}
                    renderItem={renderDashboardItem}
                    keyExtractor={item => item.key}
                    numColumns={2}
                    columnWrapperStyle={{ justifyContent: 'flex-start' }}
                    contentContainerStyle={{ padding: 12 }}
                    ListHeaderComponent={
                        <View className="mb-3">
                            <Text className="text-gray-500 dark:text-gray-400 text-[10px] text-center">
                                Selecione uma categoria para visualizar.
                            </Text>
                        </View>
                    }
                />
            ) : (
                <FlatList
                    key="match-list"
                    data={matches}
                    renderItem={renderMatchItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={{ padding: 12 }}
                    ListEmptyComponent={
                        <Text className="text-center text-gray-500 dark:text-gray-400 mt-10 text-xs">Nenhuma partida registrada.</Text>
                    }
                />
            )}
        </View>
    );
}

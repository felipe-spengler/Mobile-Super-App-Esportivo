import { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import PlayerPicker from '../../components/PlayerPicker';
import '../../global.css';

interface AwardCategory {
    key: string;
    title: string;
    icon: string;
    color: string;
}

const AWARD_CATEGORIES: AwardCategory[] = [
    { key: 'craque', title: 'Craque do Jogo', icon: 'star', color: '#0d6efd' },
    { key: 'goleiro', title: 'Melhor Goleiro', icon: 'hand-paper', color: '#198754' },
    { key: 'artilheiro', title: 'Artilheiro', icon: 'trophy', color: '#ffc107' },
    { key: 'lateral', title: 'Melhor Lateral', icon: 'running', color: '#0dcaf0' },
    { key: 'meia', title: 'Melhor Meia', icon: 'futbol', color: '#fd7e14' },
    { key: 'atacante', title: 'Melhor Atacante', icon: 'bullseye', color: '#dc3545' },
    { key: 'zagueiro', title: 'Melhor Zagueiro', icon: 'shield-alt', color: '#6c757d' },
    { key: 'volante', title: 'Melhor Volante', icon: 'shield-alt', color: '#0d6efd' },
    { key: 'estreante', title: 'Revelação', icon: 'user-plus', color: '#198754' },
    // Vôlei
    { key: 'levantadora', title: 'Melhor Levantadora', icon: 'hand-sparkles', color: '#0d6efd' },
    { key: 'libero', title: 'Melhor Líbero', icon: 'shield-alt', color: '#dc3545' },
    { key: 'oposta', title: 'Melhor Oposta', icon: 'bullseye', color: '#fd7e14' },
    { key: 'ponteira', title: 'Melhor Ponteira', icon: 'running', color: '#198754' },
    { key: 'central', title: 'Melhor Central', icon: 'signal', color: '#0dcaf0' },
];

export default function AdminAwardsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [championships, setChampionships] = useState<any[]>([]);
    const [matches, setMatches] = useState<any[]>([]);
    const [selectedChampionship, setSelectedChampionship] = useState<any>(null);
    const [selectedMatch, setSelectedMatch] = useState<any>(null);
    const [showChampionshipModal, setShowChampionshipModal] = useState(false);
    const [showMatchModal, setShowMatchModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<AwardCategory | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            const [champsRes, matchesRes] = await Promise.all([
                api.get('/admin/championships'),
                api.get('/admin/matches?status=finished')
            ]);
            setChampionships(champsRes.data);
            setMatches(matchesRes.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível carregar os dados');
        } finally {
            setLoading(false);
        }
    }

    function openChampionshipAwards(championship: any) {
        setSelectedChampionship(championship);
        setShowChampionshipModal(true);
    }

    function openMatchAwards(match: any) {
        setSelectedMatch(match);
        setShowMatchModal(true);
    }

    function selectCategory(category: AwardCategory) {
        setSelectedCategory(category);
        setShowCategoryModal(true);
    }

    async function saveAward(playerId: number) {
        if (!selectedCategory) return;

        try {
            if (selectedChampionship) {
                // Save championship award
                const awards = selectedChampionship.awards || {};
                awards[selectedCategory.key] = {
                    player_id: playerId,
                    photo_id: null
                };
                await api.put(`/admin/championships/${selectedChampionship.id}/awards`, { awards });
                Alert.alert('Sucesso', 'Premiação do campeonato atualizada!');
            } else if (selectedMatch) {
                // Save match award
                await api.post(`/admin/matches/${selectedMatch.id}/mvp`, {
                    player_id: playerId,
                    photo_id: null
                });
                Alert.alert('Sucesso', 'MVP da partida definido!');
            }
            setShowCategoryModal(false);
            loadData();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível salvar a premiação');
        }
    }

    const renderChampionship = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="bg-white dark:bg-gray-800 rounded-xl mb-3 shadow-sm border-l-4 border-l-yellow-500 overflow-hidden"
            onPress={() => openChampionshipAwards(item)}
        >
            <View className="p-4">
                <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                        <Text className="text-gray-800 dark:text-gray-100 font-bold text-base mb-1">
                            {item.name}
                        </Text>
                        <Text className="text-gray-500 dark:text-gray-400 text-xs">
                            {item.sport?.name} • Premiação do Campeonato
                        </Text>
                    </View>
                    <View className="bg-yellow-100 dark:bg-yellow-900 w-12 h-12 rounded-full items-center justify-center">
                        <FontAwesome5 name="trophy" size={20} color="#ffc107" />
                    </View>
                </View>
                <View className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <Text className="text-gray-600 dark:text-gray-400 text-xs">
                        {Object.keys(item.awards || {}).length} premiações configuradas
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    const renderMatch = ({ item }: { item: any }) => (
        <TouchableOpacity
            className="bg-white dark:bg-gray-800 rounded-xl mb-3 shadow-sm border-l-4 border-l-blue-600 overflow-hidden"
            onPress={() => openMatchAwards(item)}
        >
            <View className="p-4">
                <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                        <Text className="text-gray-500 dark:text-gray-400 text-xs mb-1">
                            {item.round_name || 'Rodada'}
                        </Text>
                        <Text className="text-gray-800 dark:text-gray-100 font-bold text-sm">
                            {item.home_team?.name} {item.home_score} x {item.away_score} {item.away_team?.name}
                        </Text>
                    </View>
                    <View className="bg-blue-100 dark:bg-blue-900 w-10 h-10 rounded-full items-center justify-center">
                        <FontAwesome5 name="star" size={16} color="#0d6efd" />
                    </View>
                </View>
                {item.mvp_player_id && (
                    <View className="mt-2 bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                        <Text className="text-blue-600 dark:text-blue-400 text-xs font-bold">
                            MVP: Atleta #{item.mvp_player_id}
                        </Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                        <MaterialIcons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800 dark:text-white">Premiações</Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#ffc107" className="mt-10" />
            ) : (
                <ScrollView contentContainerStyle={{ padding: 16 }}>
                    <Text className="text-gray-800 dark:text-gray-100 font-bold text-lg mb-3">Campeonatos</Text>
                    {championships.map(champ => (
                        <View key={champ.id}>
                            {renderChampionship({ item: champ })}
                        </View>
                    ))}

                    <Text className="text-gray-800 dark:text-gray-100 font-bold text-lg mb-3 mt-6">Partidas Finalizadas</Text>
                    {matches.map(match => (
                        <View key={match.id}>
                            {renderMatch({ item: match })}
                        </View>
                    ))}
                </ScrollView>
            )}

            {/* Championship Awards Modal */}
            <Modal visible={showChampionshipModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 pt-8 max-h-[80%]">
                        <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                            Premiações - {selectedChampionship?.name}
                        </Text>
                        <ScrollView>
                            {AWARD_CATEGORIES.map(category => (
                                <TouchableOpacity
                                    key={category.key}
                                    className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-3 flex-row items-center"
                                    onPress={() => selectCategory(category)}
                                >
                                    <View
                                        className="w-10 h-10 rounded-full items-center justify-center mr-3"
                                        style={{ backgroundColor: `${category.color}20` }}
                                    >
                                        <FontAwesome5 name={category.icon as any} size={16} color={category.color} />
                                    </View>
                                    <Text className="flex-1 text-gray-800 dark:text-gray-100 font-medium">
                                        {category.title}
                                    </Text>
                                    <FontAwesome5 name="chevron-right" size={14} color="#999" />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity
                            className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg mt-4"
                            onPress={() => setShowChampionshipModal(false)}
                        >
                            <Text className="text-gray-700 dark:text-gray-300 font-bold text-center">Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Match Awards Modal */}
            <Modal visible={showMatchModal} transparent animationType="slide">
                <View className="flex-1 bg-black/50 justify-end">
                    <View className="bg-white dark:bg-gray-800 rounded-t-3xl p-6 pt-8">
                        <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                            Definir MVP
                        </Text>
                        <Text className="text-gray-600 dark:text-gray-400 mb-4">
                            {selectedMatch?.home_team?.name} x {selectedMatch?.away_team?.name}
                        </Text>
                        <TouchableOpacity
                            className="bg-blue-600 p-4 rounded-lg mb-3"
                            onPress={() => {
                                setSelectedCategory({ key: 'craque', title: 'MVP', icon: 'star', color: '#0d6efd' });
                                setShowCategoryModal(true);
                            }}
                        >
                            <Text className="text-white font-bold text-center">Selecionar Jogador</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg"
                            onPress={() => setShowMatchModal(false)}
                        >
                            <Text className="text-gray-700 dark:text-gray-300 font-bold text-center">Fechar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Category/Player Selection Modal */}
            <Modal visible={showCategoryModal} transparent animationType="fade">
                <View className="flex-1 bg-black/50 justify-center items-center p-6">
                    <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
                        <Text className="text-xl font-bold text-gray-800 dark:text-white mb-4 text-center">
                            {selectedCategory?.title}
                        </Text>
                        <Text className="text-gray-600 dark:text-gray-400 text-sm mb-4 text-center">
                            Selecione o jogador para esta premiação
                        </Text>

                        <PlayerPicker
                            onSelect={(player) => saveAward(player.id)}
                            placeholder="Buscar jogador..."
                        />

                        <TouchableOpacity
                            className="bg-gray-200 dark:bg-gray-700 p-4 rounded-lg mt-4"
                            onPress={() => setShowCategoryModal(false)}
                        >
                            <Text className="text-gray-700 dark:text-gray-300 font-bold text-center">Cancelar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

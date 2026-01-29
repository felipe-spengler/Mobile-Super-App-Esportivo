import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../src/services/api';

interface Championship {
    id: number;
    name: string;
    format: 'league' | 'knockout' | 'groups' | 'league_playoffs' | 'double_elimination';
}

interface Team {
    id: number;
    name: string;
    logo?: string;
}

interface Match {
    id: number;
    home_team_id: number;
    away_team_id: number;
    home_team_name: string;
    away_team_name: string;
    match_date: string;
    round: number;
    group_name?: string;
}

export default function BracketGenerator() {
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [championship, setChampionship] = useState<Championship | null>(null);
    const [teams, setTeams] = useState<Team[]>([]);
    const [matches, setMatches] = useState<Match[]>([]);

    const [format, setFormat] = useState<'league' | 'knockout' | 'groups' | 'league_playoffs' | 'double_elimination'>('league');
    const [startDate, setStartDate] = useState('');
    const [intervalDays, setIntervalDays] = useState('7');

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [champResponse, teamsResponse, matchesResponse] = await Promise.all([
                api.get(`/championships/${id}`),
                api.get(`/championships/${id}/teams`),
                api.get(`/championships/${id}/matches`),
            ]);

            setChampionship(champResponse.data);
            setTeams(teamsResponse.data);
            setMatches(matchesResponse.data);
            setFormat(champResponse.data.format || 'league');
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados.');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateBracket = async () => {
        if (!startDate) {
            Alert.alert('Atenção', 'Informe a data de início.');
            return;
        }

        if (teams.length < 2) {
            Alert.alert('Atenção', 'É necessário pelo menos 2 equipes para gerar o chaveamento.');
            return;
        }

        Alert.alert(
            'Confirmar Geração',
            `Isso criará ${format === 'league'
                ? 'todas as partidas do campeonato'
                : format === 'knockout'
                    ? 'a primeira fase do mata-mata'
                    : 'as partidas da fase de grupos'
            }. Deseja continuar?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Gerar',
                    onPress: async () => {
                        try {
                            setGenerating(true);
                            const response = await api.post(`/admin/championships/${id}/bracket/generate`, {
                                format,
                                start_date: startDate,
                                match_interval_days: parseInt(intervalDays),
                            });

                            Alert.alert('Sucesso', `${response.data.matches_created} partidas criadas!`);
                            loadData();
                        } catch (error: any) {
                            Alert.alert('Erro', error.response?.data?.message || 'Não foi possível gerar o chaveamento.');
                        } finally {
                            setGenerating(false);
                        }
                    },
                },
            ]
        );
    };

    const handleShuffleTeams = async () => {
        try {
            const response = await api.post(`/admin/championships/${id}/bracket/shuffle`);
            setTeams(response.data.teams);
            Alert.alert('Sucesso', 'Equipes sorteadas!');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível sortear as equipes.');
        }
    };

    const handleAdvancePhase = async () => {
        if (format !== 'knockout') {
            Alert.alert('Atenção', 'Esta função é apenas para campeonatos mata-mata.');
            return;
        }

        Alert.alert(
            'Avançar Fase',
            'Isso criará a próxima rodada com base nos vencedores da rodada atual. Continuar?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Avançar',
                    onPress: async () => {
                        try {
                            const currentRound = Math.max(...matches.map((m) => m.round));
                            const response = await api.post(`/admin/championships/${id}/bracket/advance`, {
                                current_round: currentRound,
                            });

                            Alert.alert('Sucesso', `Rodada ${response.data.next_round} criada!`);
                            loadData();
                        } catch (error: any) {
                            Alert.alert('Erro', error.response?.data?.message || 'Não foi possível avançar a fase.');
                        }
                    },
                },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chaveamento</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Championship Info */}
                <View style={styles.infoCard}>
                    <Text style={styles.championshipName}>{championship?.name}</Text>
                    <Text style={styles.teamsCount}>{teams.length} equipes inscritas</Text>
                </View>

                {/* Format Selector */}
                {/* Format Selector */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Formato do Chaveamento</Text>
                    {(['league', 'knockout', 'groups', 'league_playoffs', 'double_elimination'] as const).map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.formatCard, format === f && styles.formatCardActive]}
                            onPress={() => setFormat(f)}
                        >
                            <Ionicons
                                name={
                                    f === 'league' ? 'list' :
                                        f === 'knockout' ? 'git-network' :
                                            f === 'groups' ? 'grid' :
                                                f === 'league_playoffs' ? 'trophy' : 'git-merge'
                                }
                                size={24}
                                color={format === f ? '#3b82f6' : '#6b7280'}
                            />
                            <View style={styles.formatInfo}>
                                <Text style={[styles.formatName, format === f && styles.formatNameActive]}>
                                    {f === 'league' ? 'Pontos Corridos' :
                                        f === 'knockout' ? 'Mata-Mata' :
                                            f === 'groups' ? 'Grupos' :
                                                f === 'league_playoffs' ? 'Liga + Playoffs' : 'Dupla Eliminação'}
                                </Text>
                                <Text style={styles.formatDescription}>
                                    {f === 'league' ? 'Todos contra todos' :
                                        f === 'knockout' ? 'Eliminação direta' :
                                            f === 'groups' ? 'Fase de grupos' :
                                                f === 'league_playoffs' ? 'Regular + Finais' : 'Winners/Losers'}
                                </Text>
                            </View>
                            {format === f && <Ionicons name="checkmark-circle" size={24} color="#10b981" />}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Configuration */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Configurações</Text>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Data de Início *</Text>
                        <TextInput
                            style={styles.input}
                            value={startDate}
                            onChangeText={setStartDate}
                            placeholder="YYYY-MM-DD"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Intervalo entre Partidas (dias)</Text>
                        <TextInput
                            style={styles.input}
                            value={intervalDays}
                            onChangeText={setIntervalDays}
                            placeholder="7"
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Teams List */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Equipes ({teams.length})</Text>
                        <TouchableOpacity onPress={handleShuffleTeams}>
                            <Ionicons name="shuffle" size={24} color="#3b82f6" />
                        </TouchableOpacity>
                    </View>

                    {teams.map((team, index) => (
                        <View key={team.id} style={styles.teamCard}>
                            <View style={styles.teamNumber}>
                                <Text style={styles.teamNumberText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.teamName}>{team.name}</Text>
                        </View>
                    ))}

                    {teams.length === 0 && (
                        <View style={styles.emptyState}>
                            <Ionicons name="people-outline" size={48} color="#d1d5db" />
                            <Text style={styles.emptyStateText}>Nenhuma equipe inscrita</Text>
                        </View>
                    )}
                </View>

                {/* Generated Matches */}
                {matches.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Partidas Geradas ({matches.length})</Text>
                        {matches.slice(0, 5).map((match) => (
                            <View key={match.id} style={styles.matchCard}>
                                <Text style={styles.matchRound}>Rodada {match.round}</Text>
                                <View style={styles.matchTeams}>
                                    <Text style={styles.matchTeam}>{match.home_team_name}</Text>
                                    <Text style={styles.matchVs}>vs</Text>
                                    <Text style={styles.matchTeam}>{match.away_team_name}</Text>
                                </View>
                                <Text style={styles.matchDate}>
                                    {new Date(match.match_date).toLocaleDateString('pt-BR')}
                                </Text>
                            </View>
                        ))}
                        {matches.length > 5 && (
                            <Text style={styles.moreMatches}>+ {matches.length - 5} partidas</Text>
                        )}
                    </View>
                )}

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.primaryButton]}
                        onPress={handleGenerateBracket}
                        disabled={generating}
                    >
                        {generating ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <>
                                <Ionicons name="create" size={24} color="#fff" />
                                <Text style={styles.primaryButtonText}>Gerar Chaveamento</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    {format === 'knockout' && matches.length > 0 && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.secondaryButton]}
                            onPress={handleAdvancePhase}
                        >
                            <Ionicons name="arrow-forward" size={24} color="#3b82f6" />
                            <Text style={styles.secondaryButtonText}>Avançar Fase</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6b7280',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
    },
    content: {
        flex: 1,
    },
    infoCard: {
        padding: 20,
        backgroundColor: '#eff6ff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    championshipName: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    teamsCount: {
        fontSize: 14,
        color: '#6b7280',
    },
    section: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 12,
    },
    formatCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        marginBottom: 8,
    },
    formatCardActive: {
        backgroundColor: '#eff6ff',
        borderColor: '#3b82f6',
    },
    formatInfo: {
        flex: 1,
        marginLeft: 12,
    },
    formatName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    formatNameActive: {
        color: '#3b82f6',
    },
    formatDescription: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 2,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#374151',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1f2937',
    },
    teamCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        marginBottom: 8,
    },
    teamNumber: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    teamNumberText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
    teamName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    matchCard: {
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        marginBottom: 8,
    },
    matchRound: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 8,
    },
    matchTeams: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    matchTeam: {
        flex: 1,
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    matchVs: {
        fontSize: 12,
        fontWeight: '700',
        color: '#9ca3af',
        marginHorizontal: 8,
    },
    matchDate: {
        fontSize: 12,
        color: '#9ca3af',
    },
    moreMatches: {
        textAlign: 'center',
        fontSize: 14,
        color: '#6b7280',
        marginTop: 8,
    },
    emptyState: {
        paddingVertical: 48,
        alignItems: 'center',
    },
    emptyStateText: {
        marginTop: 12,
        fontSize: 14,
        color: '#9ca3af',
    },
    actions: {
        padding: 16,
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        borderRadius: 12,
        gap: 8,
    },
    primaryButton: {
        backgroundColor: '#3b82f6',
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
    },
    secondaryButton: {
        backgroundColor: '#fff',
        borderWidth: 2,
        borderColor: '#3b82f6',
    },
    secondaryButtonText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#3b82f6',
    },
});

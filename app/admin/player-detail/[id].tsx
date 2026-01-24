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
import api from '../../../services/api';
import ImageUpload from '../../../components/ImageUpload';

interface Player {
    id: number;
    name: string;
    email: string;
    cpf?: string;
    phone?: string;
    birth_date?: string;
    jersey_number?: number;
    position?: string;
    photo?: string;
    club_id: number;
}

interface Match {
    id: number;
    championship_name: string;
    match_date: string;
    home_team_name: string;
    away_team_name: string;
    home_score?: number;
    away_score?: number;
}

interface Stats {
    total_matches: number;
    goals: number;
    assists: number;
    yellow_cards: number;
    red_cards: number;
    mvp_count: number;
}

export default function PlayerDetail() {
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [player, setPlayer] = useState<Player | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [activeTab, setActiveTab] = useState<'info' | 'history' | 'stats'>('info');

    // Form states
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [cpf, setCpf] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [jerseyNumber, setJerseyNumber] = useState('');
    const [position, setPosition] = useState('');
    const [photo, setPhoto] = useState('');

    useEffect(() => {
        loadPlayer();
        loadPlayerHistory();
        loadPlayerStats();
    }, [id]);

    const loadPlayer = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/players/${id}`);
            const data = response.data;
            setPlayer(data);

            setName(data.name);
            setEmail(data.email);
            setCpf(data.cpf || '');
            setPhone(data.phone || '');
            setBirthDate(data.birth_date || '');
            setJerseyNumber(data.jersey_number?.toString() || '');
            setPosition(data.position || '');
            setPhoto(data.photo || '');
        } catch (error) {
            console.error('Erro ao carregar jogador:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados do jogador.');
        } finally {
            setLoading(false);
        }
    };

    const loadPlayerHistory = async () => {
        try {
            // Endpoint fictício - ajustar conforme backend
            const response = await api.get(`/admin/players/${id}/matches`);
            setMatches(response.data);
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            setMatches([]);
        }
    };

    const loadPlayerStats = async () => {
        try {
            // Endpoint fictício - ajustar conforme backend
            const response = await api.get(`/admin/players/${id}/stats`);
            setStats(response.data);
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            setStats({
                total_matches: 0,
                goals: 0,
                assists: 0,
                yellow_cards: 0,
                red_cards: 0,
                mvp_count: 0,
            });
        }
    };

    const handleSave = async () => {
        if (!name.trim() || !email.trim()) {
            Alert.alert('Atenção', 'Nome e email são obrigatórios.');
            return;
        }

        try {
            setSaving(true);
            await api.put(`/admin/players/${id}`, {
                name,
                email,
                cpf,
                phone,
                birth_date: birthDate,
                jersey_number: jerseyNumber ? parseInt(jerseyNumber) : null,
                position,
            });

            Alert.alert('Sucesso', 'Jogador atualizado com sucesso!');
            loadPlayer();
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            Alert.alert('Erro', error.response?.data?.message || 'Não foi possível salvar as alterações.');
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = (url: string, path: string) => {
        setPhoto(url);
        Alert.alert('Sucesso', 'Foto atualizada!');
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
                <Text style={styles.headerTitle}>Detalhes do Jogador</Text>
                <TouchableOpacity onPress={handleSave} disabled={saving}>
                    {saving ? (
                        <ActivityIndicator size="small" color="#3b82f6" />
                    ) : (
                        <Ionicons name="checkmark" size={24} color="#10b981" />
                    )}
                </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'info' && styles.tabActive]}
                    onPress={() => setActiveTab('info')}
                >
                    <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>
                        Informações
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'stats' && styles.tabActive]}
                    onPress={() => setActiveTab('stats')}
                >
                    <Text style={[styles.tabText, activeTab === 'stats' && styles.tabTextActive]}>
                        Estatísticas
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'history' && styles.tabActive]}
                    onPress={() => setActiveTab('history')}
                >
                    <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
                        Histórico
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Tab: Informações */}
                {activeTab === 'info' && (
                    <View style={styles.tabContent}>
                        <ImageUpload
                            uploadType="player-photo"
                            entityId={Number(id)}
                            currentImage={photo}
                            onUploadComplete={handlePhotoUpload}
                            label="Foto do Jogador"
                            aspectRatio={[3, 4]}
                        />

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nome Completo *</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Ex: João Silva"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email *</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="jogador@email.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>CPF</Text>
                                <TextInput
                                    style={styles.input}
                                    value={cpf}
                                    onChangeText={setCpf}
                                    placeholder="000.000.000-00"
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Telefone</Text>
                                <TextInput
                                    style={styles.input}
                                    value={phone}
                                    onChangeText={setPhone}
                                    placeholder="(00) 00000-0000"
                                    keyboardType="phone-pad"
                                />
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Data de Nascimento</Text>
                            <TextInput
                                style={styles.input}
                                value={birthDate}
                                onChangeText={setBirthDate}
                                placeholder="YYYY-MM-DD"
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Número da Camisa</Text>
                                <TextInput
                                    style={styles.input}
                                    value={jerseyNumber}
                                    onChangeText={setJerseyNumber}
                                    placeholder="Ex: 10"
                                    keyboardType="numeric"
                                />
                            </View>

                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Posição</Text>
                                <TextInput
                                    style={styles.input}
                                    value={position}
                                    onChangeText={setPosition}
                                    placeholder="Ex: Atacante"
                                />
                            </View>
                        </View>
                    </View>
                )}

                {/* Tab: Estatísticas */}
                {activeTab === 'stats' && stats && (
                    <View style={styles.tabContent}>
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <Ionicons name="football" size={32} color="#3b82f6" />
                                <Text style={styles.statValue}>{stats.total_matches}</Text>
                                <Text style={styles.statLabel}>Partidas</Text>
                            </View>

                            <View style={styles.statCard}>
                                <Ionicons name="trophy" size={32} color="#f59e0b" />
                                <Text style={styles.statValue}>{stats.goals}</Text>
                                <Text style={styles.statLabel}>Gols</Text>
                            </View>

                            <View style={styles.statCard}>
                                <Ionicons name="hand-right" size={32} color="#10b981" />
                                <Text style={styles.statValue}>{stats.assists}</Text>
                                <Text style={styles.statLabel}>Assistências</Text>
                            </View>

                            <View style={styles.statCard}>
                                <Ionicons name="star" size={32} color="#8b5cf6" />
                                <Text style={styles.statValue}>{stats.mvp_count}</Text>
                                <Text style={styles.statLabel}>MVP</Text>
                            </View>

                            <View style={styles.statCard}>
                                <Ionicons name="warning" size={32} color="#eab308" />
                                <Text style={styles.statValue}>{stats.yellow_cards}</Text>
                                <Text style={styles.statLabel}>Cartões Amarelos</Text>
                            </View>

                            <View style={styles.statCard}>
                                <Ionicons name="close-circle" size={32} color="#ef4444" />
                                <Text style={styles.statValue}>{stats.red_cards}</Text>
                                <Text style={styles.statLabel}>Cartões Vermelhos</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Tab: Histórico */}
                {activeTab === 'history' && (
                    <View style={styles.tabContent}>
                        {matches.length > 0 ? (
                            matches.map((match) => (
                                <View key={match.id} style={styles.matchCard}>
                                    <Text style={styles.matchChampionship}>{match.championship_name}</Text>
                                    <View style={styles.matchInfo}>
                                        <Text style={styles.matchTeam}>{match.home_team_name}</Text>
                                        <Text style={styles.matchScore}>
                                            {match.home_score ?? '-'} x {match.away_score ?? '-'}
                                        </Text>
                                        <Text style={styles.matchTeam}>{match.away_team_name}</Text>
                                    </View>
                                    <Text style={styles.matchDate}>
                                        {new Date(match.match_date).toLocaleDateString('pt-BR')}
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Ionicons name="calendar-outline" size={64} color="#d1d5db" />
                                <Text style={styles.emptyStateText}>Nenhuma partida registrada</Text>
                            </View>
                        )}
                    </View>
                )}
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
    tabs: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
    },
    tabActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#3b82f6',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    tabTextActive: {
        color: '#3b82f6',
    },
    content: {
        flex: 1,
    },
    tabContent: {
        padding: 16,
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
    row: {
        flexDirection: 'row',
        gap: 12,
    },
    halfWidth: {
        flex: 1,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#f9fafb',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 32,
        fontWeight: '700',
        color: '#1f2937',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    matchCard: {
        backgroundColor: '#f9fafb',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    matchChampionship: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 8,
    },
    matchInfo: {
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
    matchScore: {
        fontSize: 18,
        fontWeight: '700',
        color: '#3b82f6',
        marginHorizontal: 12,
    },
    matchDate: {
        fontSize: 12,
        color: '#9ca3af',
    },
    emptyState: {
        paddingVertical: 64,
        alignItems: 'center',
    },
    emptyStateText: {
        marginTop: 16,
        fontSize: 16,
        color: '#9ca3af',
    },
});

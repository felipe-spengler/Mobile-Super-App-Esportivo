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
    FlatList,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../../src/services/api';
import ImageUpload from '../../../components/ImageUpload';

interface Player {
    id: number;
    name: string;
    email: string;
    jersey_number?: number;
    position?: string;
    photo?: string;
}

interface Team {
    id: number;
    name: string;
    short_name?: string;
    primary_color?: string;
    secondary_color?: string;
    logo?: string;
    club_id: number;
}

export default function TeamDetail() {
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [team, setTeam] = useState<Team | null>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [activeTab, setActiveTab] = useState<'info' | 'players'>('info');

    // Form states
    const [name, setName] = useState('');
    const [shortName, setShortName] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#3b82f6');
    const [secondaryColor, setSecondaryColor] = useState('#1f2937');
    const [logo, setLogo] = useState('');

    // Add player
    const [showAddPlayer, setShowAddPlayer] = useState(false);
    const [searchPlayer, setSearchPlayer] = useState('');
    const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);

    useEffect(() => {
        loadTeam();
        loadPlayers();
    }, [id]);

    const loadTeam = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/teams/${id}`);
            const data = response.data;
            setTeam(data);

            setName(data.name);
            setShortName(data.short_name || '');
            setPrimaryColor(data.primary_color || '#3b82f6');
            setSecondaryColor(data.secondary_color || '#1f2937');
            setLogo(data.logo || '');
        } catch (error) {
            console.error('Erro ao carregar equipe:', error);
            Alert.alert('Erro', 'Não foi possível carregar os dados da equipe.');
        } finally {
            setLoading(false);
        }
    };

    const loadPlayers = async () => {
        try {
            const response = await api.get(`/admin/players`, {
                params: { team_id: id }
            });
            setPlayers(response.data);
        } catch (error) {
            console.error('Erro ao carregar jogadores:', error);
        }
    };

    const loadAvailablePlayers = async () => {
        try {
            const response = await api.get('/admin/players/search', {
                params: { q: searchPlayer }
            });
            setAvailablePlayers(response.data);
        } catch (error) {
            console.error('Erro ao buscar jogadores:', error);
        }
    };

    useEffect(() => {
        if (searchPlayer.length > 2) {
            loadAvailablePlayers();
        } else {
            setAvailablePlayers([]);
        }
    }, [searchPlayer]);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Atenção', 'O nome da equipe é obrigatório.');
            return;
        }

        try {
            setSaving(true);
            await api.put(`/admin/teams/${id}`, {
                name,
                short_name: shortName,
                primary_color: primaryColor,
                secondary_color: secondaryColor,
            });

            Alert.alert('Sucesso', 'Equipe atualizada com sucesso!');
            loadTeam();
        } catch (error: any) {
            console.error('Erro ao salvar:', error);
            Alert.alert('Erro', error.response?.data?.message || 'Não foi possível salvar as alterações.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = (url: string, path: string) => {
        setLogo(url);
        Alert.alert('Sucesso', 'Logo atualizado!');
    };

    const handleAddPlayer = async (playerId: number) => {
        try {
            await api.post(`/teams/${id}/players`, { player_id: playerId });
            Alert.alert('Sucesso', 'Jogador adicionado à equipe!');
            setShowAddPlayer(false);
            setSearchPlayer('');
            loadPlayers();
        } catch (error: any) {
            Alert.alert('Erro', error.response?.data?.message || 'Não foi possível adicionar o jogador.');
        }
    };

    const handleRemovePlayer = async (playerId: number) => {
        Alert.alert(
            'Confirmar Remoção',
            'Tem certeza que deseja remover este jogador da equipe?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await api.delete(`/teams/${id}/players/${playerId}`);
                            Alert.alert('Sucesso', 'Jogador removido da equipe!');
                            loadPlayers();
                        } catch (error: any) {
                            Alert.alert('Erro', error.response?.data?.message || 'Não foi possível remover o jogador.');
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
                <Text style={styles.headerTitle}>Detalhes da Equipe</Text>
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
                    style={[styles.tab, activeTab === 'players' && styles.tabActive]}
                    onPress={() => setActiveTab('players')}
                >
                    <Text style={[styles.tabText, activeTab === 'players' && styles.tabTextActive]}>
                        Jogadores ({players.length})
                    </Text>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Tab: Informações */}
                {activeTab === 'info' && (
                    <View style={styles.tabContent}>
                        <ImageUpload
                            uploadType="team-logo"
                            entityId={Number(id)}
                            currentImage={logo}
                            onUploadComplete={handleLogoUpload}
                            label="Logo da Equipe"
                            aspectRatio={[1, 1]}
                        />

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nome da Equipe *</Text>
                            <TextInput
                                style={styles.input}
                                value={name}
                                onChangeText={setName}
                                placeholder="Ex: Tigres FC"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Nome Abreviado</Text>
                            <TextInput
                                style={styles.input}
                                value={shortName}
                                onChangeText={setShortName}
                                placeholder="Ex: TIG"
                                maxLength={3}
                            />
                        </View>

                        <View style={styles.row}>
                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Cor Primária</Text>
                                <View style={styles.colorPickerContainer}>
                                    <View style={[styles.colorPreview, { backgroundColor: primaryColor }]} />
                                    <TextInput
                                        style={[styles.input, styles.colorInput]}
                                        value={primaryColor}
                                        onChangeText={setPrimaryColor}
                                        placeholder="#3b82f6"
                                    />
                                </View>
                            </View>

                            <View style={[styles.inputGroup, styles.halfWidth]}>
                                <Text style={styles.label}>Cor Secundária</Text>
                                <View style={styles.colorPickerContainer}>
                                    <View style={[styles.colorPreview, { backgroundColor: secondaryColor }]} />
                                    <TextInput
                                        style={[styles.input, styles.colorInput]}
                                        value={secondaryColor}
                                        onChangeText={setSecondaryColor}
                                        placeholder="#1f2937"
                                    />
                                </View>
                            </View>
                        </View>

                        <View style={styles.previewCard}>
                            <Text style={styles.previewTitle}>Preview</Text>
                            <View style={[styles.teamBadge, { backgroundColor: primaryColor }]}>
                                <Text style={[styles.teamBadgeText, { color: secondaryColor }]}>
                                    {shortName || 'ABC'}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Tab: Jogadores */}
                {activeTab === 'players' && (
                    <View style={styles.tabContent}>
                        <TouchableOpacity
                            style={styles.addButton}
                            onPress={() => setShowAddPlayer(!showAddPlayer)}
                        >
                            <Ionicons name="person-add" size={24} color="#3b82f6" />
                            <Text style={styles.addButtonText}>Adicionar Jogador</Text>
                        </TouchableOpacity>

                        {showAddPlayer && (
                            <View style={styles.searchContainer}>
                                <View style={styles.searchInputContainer}>
                                    <Ionicons name="search" size={20} color="#9ca3af" />
                                    <TextInput
                                        style={styles.searchInput}
                                        value={searchPlayer}
                                        onChangeText={setSearchPlayer}
                                        placeholder="Buscar jogador por nome..."
                                    />
                                </View>

                                {availablePlayers.length > 0 && (
                                    <View style={styles.searchResults}>
                                        {availablePlayers.map((player) => (
                                            <TouchableOpacity
                                                key={player.id}
                                                style={styles.searchResultItem}
                                                onPress={() => handleAddPlayer(player.id)}
                                            >
                                                <View style={styles.playerAvatar}>
                                                    <Text style={styles.playerAvatarText}>
                                                        {player.name.charAt(0).toUpperCase()}
                                                    </Text>
                                                </View>
                                                <View style={styles.playerInfo}>
                                                    <Text style={styles.playerName}>{player.name}</Text>
                                                    <Text style={styles.playerEmail}>{player.email}</Text>
                                                </View>
                                                <Ionicons name="add-circle" size={24} color="#10b981" />
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Lista de Jogadores */}
                        {players.map((player) => (
                            <View key={player.id} style={styles.playerCard}>
                                <View style={styles.playerAvatar}>
                                    <Text style={styles.playerAvatarText}>
                                        {player.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.playerDetails}>
                                    <Text style={styles.playerName}>{player.name}</Text>
                                    <Text style={styles.playerMeta}>
                                        {player.jersey_number ? `#${player.jersey_number}` : 'Sem número'}
                                        {player.position ? ` • ${player.position}` : ''}
                                    </Text>
                                </View>
                                <TouchableOpacity onPress={() => handleRemovePlayer(player.id)}>
                                    <Ionicons name="close-circle" size={24} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {players.length === 0 && (
                            <View style={styles.emptyState}>
                                <Ionicons name="people-outline" size={64} color="#d1d5db" />
                                <Text style={styles.emptyStateText}>Nenhum jogador na equipe</Text>
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
    colorPickerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    colorPreview: {
        width: 40,
        height: 40,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    colorInput: {
        flex: 1,
    },
    previewCard: {
        backgroundColor: '#f9fafb',
        padding: 24,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
    },
    previewTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 16,
    },
    teamBadge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    teamBadgeText: {
        fontSize: 24,
        fontWeight: '700',
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#eff6ff',
        borderRadius: 12,
        marginBottom: 16,
    },
    addButtonText: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#3b82f6',
    },
    searchContainer: {
        marginBottom: 16,
    },
    searchInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        paddingHorizontal: 12,
        gap: 8,
    },
    searchInput: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#1f2937',
    },
    searchResults: {
        marginTop: 8,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
    },
    searchResultItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    playerCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        marginBottom: 12,
    },
    playerAvatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    playerAvatarText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
    },
    playerInfo: {
        flex: 1,
    },
    playerDetails: {
        flex: 1,
    },
    playerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    playerEmail: {
        fontSize: 14,
        color: '#6b7280',
    },
    playerMeta: {
        fontSize: 14,
        color: '#6b7280',
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

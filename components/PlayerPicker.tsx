import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

interface Player {
    id: number;
    name: string;
    email: string;
    jersey_number?: number;
    position?: string;
    photo?: string;
}

interface PlayerPickerProps {
    onSelect: (player: Player) => void;
    teamId?: number;
    selectedPlayerId?: number;
    placeholder?: string;
}

export default function PlayerPicker({ onSelect, teamId, selectedPlayerId, placeholder = 'Buscar jogador...' }: PlayerPickerProps) {
    const [search, setSearch] = useState('');
    const [players, setPlayers] = useState<Player[]>([]);
    const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

    useEffect(() => {
        loadPlayers();
    }, [teamId]);

    useEffect(() => {
        filterPlayers();
    }, [search, players]);

    const loadPlayers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/players', {
                params: teamId ? { team_id: teamId } : {}
            });
            setPlayers(response.data);
        } catch (error) {
            console.error('Erro ao carregar jogadores:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterPlayers = () => {
        if (!search.trim()) {
            setFilteredPlayers(players);
            return;
        }

        const searchLower = search.toLowerCase();
        const filtered = players.filter(player =>
            player.name.toLowerCase().includes(searchLower) ||
            player.email.toLowerCase().includes(searchLower) ||
            (player.jersey_number && player.jersey_number.toString().includes(searchLower))
        );
        setFilteredPlayers(filtered);
    };

    const handleSelectPlayer = (player: Player) => {
        setSelectedPlayer(player);
        setSearch(player.name);
        setShowDropdown(false);
        onSelect(player);
    };

    const renderPlayerItem = ({ item }: { item: Player }) => {
        const isSelected = selectedPlayerId === item.id;

        return (
            <TouchableOpacity
                style={[styles.playerItem, isSelected && styles.playerItemSelected]}
                onPress={() => handleSelectPlayer(item)}
            >
                <View style={styles.playerInfo}>
                    <View style={styles.playerAvatar}>
                        <Text style={styles.playerAvatarText}>
                            {item.name.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.playerDetails}>
                        <Text style={styles.playerName}>{item.name}</Text>
                        <Text style={styles.playerMeta}>
                            {item.jersey_number ? `#${item.jersey_number}` : ''}
                            {item.position ? ` • ${item.position}` : ''}
                        </Text>
                    </View>
                </View>
                {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                )}
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    value={search}
                    onChangeText={setSearch}
                    onFocus={() => setShowDropdown(true)}
                />
                {search.length > 0 && (
                    <TouchableOpacity onPress={() => {
                        setSearch('');
                        setSelectedPlayer(null);
                    }}>
                        <Ionicons name="close-circle" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                )}
            </View>

            {showDropdown && (
                <View style={styles.dropdown}>
                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="#3b82f6" />
                            <Text style={styles.loadingText}>Carregando...</Text>
                        </View>
                    ) : filteredPlayers.length > 0 ? (
                        <FlatList
                            data={filteredPlayers}
                            keyExtractor={(item) => item.id.toString()}
                            renderItem={renderPlayerItem}
                            style={styles.playerList}
                            nestedScrollEnabled
                            maxToRenderPerBatch={10}
                        />
                    ) : (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="people-outline" size={48} color="#d1d5db" />
                            <Text style={styles.emptyText}>Nenhum jogador encontrado</Text>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
        zIndex: 1000,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: '#1f2937',
    },
    dropdown: {
        position: 'absolute',
        top: 52,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        maxHeight: 300,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
        zIndex: 1001,
    },
    playerList: {
        maxHeight: 300,
    },
    playerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    playerItemSelected: {
        backgroundColor: '#f0fdf4',
    },
    playerInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    playerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    playerAvatarText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    playerDetails: {
        flex: 1,
    },
    playerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 2,
    },
    playerMeta: {
        fontSize: 14,
        color: '#6b7280',
    },
    loadingContainer: {
        padding: 24,
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 8,
        color: '#6b7280',
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        marginTop: 12,
        fontSize: 16,
        color: '#9ca3af',
    },
});

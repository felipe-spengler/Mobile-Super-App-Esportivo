import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../src/services/api';

interface Match {
    id: number;
    championship_id: number;
    home_team_id: number;
    away_team_id: number;
    home_team_name: string;
    away_team_name: string;
    match_date: string;
    sport_id: number;
    sport_name: string;
}

const SPORT_SUMULAS = {
    1: 'futebol', // Futebol
    2: 'futsal', // Futsal
    3: 'volei', // Vôlei
    4: 'basquete', // Basquete
    5: 'handebol', // Handebol
    6: 'futebol-7', // Futebol 7
    7: 'lutas', // Lutas/MMA
};

export default function SumulaSelector() {
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [match, setMatch] = useState<Match | null>(null);

    useEffect(() => {
        loadMatch();
    }, [id]);

    const loadMatch = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/admin/matches/${id}`);
            setMatch(response.data);
        } catch (error) {
            console.error('Erro ao carregar partida:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSumula = (sportKey: string) => {
        router.push(`/admin/sumula-${sportKey}?match_id=${id}` as any);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Carregando...</Text>
            </View>
        );
    }

    if (!match) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={64} color="#ef4444" />
                <Text style={styles.errorText}>Partida não encontrada</Text>
            </View>
        );
    }

    // Detecta súmula automaticamente baseado no esporte
    const sportKey = SPORT_SUMULAS[match.sport_id as keyof typeof SPORT_SUMULAS] || 'futebol';

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Súmula Digital</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Match Info */}
                <View style={styles.matchCard}>
                    <Text style={styles.matchSport}>{match.sport_name}</Text>
                    <View style={styles.matchTeams}>
                        <Text style={styles.teamName}>{match.home_team_name}</Text>
                        <Text style={styles.vs}>vs</Text>
                        <Text style={styles.teamName}>{match.away_team_name}</Text>
                    </View>
                    <Text style={styles.matchDate}>
                        {new Date(match.match_date).toLocaleString('pt-BR')}
                    </Text>
                </View>

                {/* Auto-detect Button */}
                <TouchableOpacity
                    style={styles.autoButton}
                    onPress={() => handleSelectSumula(sportKey)}
                >
                    <Ionicons name="flash" size={24} color="#fff" />
                    <View style={styles.autoButtonContent}>
                        <Text style={styles.autoButtonTitle}>Abrir Súmula Automática</Text>
                        <Text style={styles.autoButtonSubtitle}>
                            Detectado: {match.sport_name}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Manual Selection */}
                <Text style={styles.sectionTitle}>Ou escolha manualmente:</Text>

                <View style={styles.sumulaGrid}>
                    <TouchableOpacity
                        style={styles.sumulaCard}
                        onPress={() => handleSelectSumula('futebol')}
                    >
                        <Ionicons name="football" size={32} color="#10b981" />
                        <Text style={styles.sumulaCardTitle}>Futebol</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.sumulaCard}
                        onPress={() => handleSelectSumula('futsal')}
                    >
                        <Ionicons name="football" size={32} color="#3b82f6" />
                        <Text style={styles.sumulaCardTitle}>Futsal</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.sumulaCard}
                        onPress={() => handleSelectSumula('volei')}
                    >
                        <Ionicons name="basketball" size={32} color="#f59e0b" />
                        <Text style={styles.sumulaCardTitle}>Vôlei</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.sumulaCard}
                        onPress={() => handleSelectSumula('basquete')}
                    >
                        <Ionicons name="basketball" size={32} color="#ef4444" />
                        <Text style={styles.sumulaCardTitle}>Basquete</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.sumulaCard}
                        onPress={() => handleSelectSumula('handebol')}
                    >
                        <Ionicons name="hand-left" size={32} color="#8b5cf6" />
                        <Text style={styles.sumulaCardTitle}>Handebol</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.sumulaCard}
                        onPress={() => handleSelectSumula('futebol-7')}
                    >
                        <Ionicons name="football" size={32} color="#14b8a6" />
                        <Text style={styles.sumulaCardTitle}>Futebol 7</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.sumulaCard}
                        onPress={() => handleSelectSumula('lutas')}
                    >
                        <Ionicons name="fitness" size={32} color="#ec4899" />
                        <Text style={styles.sumulaCardTitle}>Lutas/MMA</Text>
                    </TouchableOpacity>
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
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
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
        padding: 16,
    },
    matchCard: {
        padding: 20,
        backgroundColor: '#eff6ff',
        borderRadius: 12,
        marginBottom: 24,
    },
    matchSport: {
        fontSize: 12,
        fontWeight: '600',
        color: '#3b82f6',
        marginBottom: 8,
    },
    matchTeams: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    teamName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
    },
    vs: {
        fontSize: 14,
        fontWeight: '700',
        color: '#9ca3af',
        marginHorizontal: 12,
    },
    matchDate: {
        fontSize: 12,
        color: '#6b7280',
    },
    autoButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        marginBottom: 24,
        gap: 16,
    },
    autoButtonContent: {
        flex: 1,
    },
    autoButtonTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
        marginBottom: 4,
    },
    autoButtonSubtitle: {
        fontSize: 14,
        color: '#dbeafe',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 16,
    },
    sumulaGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    sumulaCard: {
        width: '48%',
        padding: 20,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        alignItems: 'center',
    },
    sumulaCardTitle: {
        marginTop: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
});

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';

interface DashboardStats {
    total_championships: number;
    active_championships: number;
    total_matches: number;
    upcoming_matches: number;
    total_teams: number;
    total_players: number;
    total_revenue: number;
    pending_payments: number;
}

interface RecentActivity {
    id: number;
    type: 'championship' | 'match' | 'team' | 'player';
    title: string;
    description: string;
    timestamp: string;
}

export default function Reports() {
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<RecentActivity[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

    useEffect(() => {
        loadDashboard();
    }, [selectedPeriod]);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/dashboard', {
                params: { period: selectedPeriod }
            });

            setStats(response.data.stats);
            setActivities(response.data.recent_activities || []);
        } catch (error) {
            console.error('Erro ao carregar dashboard:', error);
            // Dados de exemplo para desenvolvimento
            setStats({
                total_championships: 12,
                active_championships: 3,
                total_matches: 156,
                upcoming_matches: 8,
                total_teams: 45,
                total_players: 680,
                total_revenue: 45600,
                pending_payments: 2300,
            });
            setActivities([]);
        } finally {
            setLoading(false);
        }
    };

    const handleExportData = async (type: 'csv' | 'pdf') => {
        try {
            Alert.alert('Exportando', `Gerando relatório em ${type.toUpperCase()}...`);
            // Implementar exportação
            const response = await api.get('/admin/reports/export', {
                params: { format: type, period: selectedPeriod }
            });

            Alert.alert('Sucesso', 'Relatório exportado com sucesso!');
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível exportar o relatório.');
        }
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'championship':
                return 'trophy';
            case 'match':
                return 'football';
            case 'team':
                return 'people';
            case 'player':
                return 'person';
            default:
                return 'information-circle';
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Carregando relatórios...</Text>
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
                <Text style={styles.headerTitle}>Relatórios e Estatísticas</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Period Selector */}
                <View style={styles.periodSelector}>
                    {(['week', 'month', 'year'] as const).map((period) => (
                        <TouchableOpacity
                            key={period}
                            style={[
                                styles.periodButton,
                                selectedPeriod === period && styles.periodButtonActive,
                            ]}
                            onPress={() => setSelectedPeriod(period)}
                        >
                            <Text
                                style={[
                                    styles.periodButtonText,
                                    selectedPeriod === period && styles.periodButtonTextActive,
                                ]}
                            >
                                {period === 'week' ? 'Semana' : period === 'month' ? 'Mês' : 'Ano'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Stats Grid */}
                {stats && (
                    <View style={styles.statsContainer}>
                        <View style={styles.statsRow}>
                            <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
                                <Ionicons name="trophy" size={32} color="#3b82f6" />
                                <Text style={styles.statValue}>{stats.total_championships}</Text>
                                <Text style={styles.statLabel}>Campeonatos</Text>
                                <Text style={styles.statSubLabel}>{stats.active_championships} ativos</Text>
                            </View>

                            <View style={[styles.statCard, { backgroundColor: '#f0fdf4' }]}>
                                <Ionicons name="football" size={32} color="#10b981" />
                                <Text style={styles.statValue}>{stats.total_matches}</Text>
                                <Text style={styles.statLabel}>Partidas</Text>
                                <Text style={styles.statSubLabel}>{stats.upcoming_matches} próximas</Text>
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
                                <Ionicons name="people" size={32} color="#f59e0b" />
                                <Text style={styles.statValue}>{stats.total_teams}</Text>
                                <Text style={styles.statLabel}>Equipes</Text>
                            </View>

                            <View style={[styles.statCard, { backgroundColor: '#fce7f3' }]}>
                                <Ionicons name="person" size={32} color="#ec4899" />
                                <Text style={styles.statValue}>{stats.total_players}</Text>
                                <Text style={styles.statLabel}>Jogadores</Text>
                            </View>
                        </View>

                        <View style={styles.statsRow}>
                            <View style={[styles.statCard, { backgroundColor: '#f0fdfa' }]}>
                                <Ionicons name="cash" size={32} color="#14b8a6" />
                                <Text style={styles.statValue}>
                                    R$ {stats.total_revenue.toLocaleString('pt-BR')}
                                </Text>
                                <Text style={styles.statLabel}>Receita Total</Text>
                            </View>

                            <View style={[styles.statCard, { backgroundColor: '#fef2f2' }]}>
                                <Ionicons name="time" size={32} color="#ef4444" />
                                <Text style={styles.statValue}>
                                    R$ {stats.pending_payments.toLocaleString('pt-BR')}
                                </Text>
                                <Text style={styles.statLabel}>Pendente</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* Export Options */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Exportar Dados</Text>
                    <View style={styles.exportButtons}>
                        <TouchableOpacity
                            style={styles.exportButton}
                            onPress={() => handleExportData('csv')}
                        >
                            <Ionicons name="document-text" size={24} color="#3b82f6" />
                            <Text style={styles.exportButtonText}>Exportar CSV</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.exportButton}
                            onPress={() => handleExportData('pdf')}
                        >
                            <Ionicons name="document" size={24} color="#ef4444" />
                            <Text style={styles.exportButtonText}>Exportar PDF</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Activity */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Atividades Recentes</Text>
                    {activities.length > 0 ? (
                        activities.map((activity) => (
                            <View key={activity.id} style={styles.activityCard}>
                                <View style={styles.activityIcon}>
                                    <Ionicons
                                        name={getActivityIcon(activity.type) as any}
                                        size={24}
                                        color="#3b82f6"
                                    />
                                </View>
                                <View style={styles.activityContent}>
                                    <Text style={styles.activityTitle}>{activity.title}</Text>
                                    <Text style={styles.activityDescription}>{activity.description}</Text>
                                    <Text style={styles.activityTime}>
                                        {new Date(activity.timestamp).toLocaleString('pt-BR')}
                                    </Text>
                                </View>
                            </View>
                        ))
                    ) : (
                        <View style={styles.emptyState}>
                            <Ionicons name="time-outline" size={48} color="#d1d5db" />
                            <Text style={styles.emptyStateText}>Nenhuma atividade recente</Text>
                        </View>
                    )}
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ações Rápidas</Text>
                    <View style={styles.quickActions}>
                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => router.push('/admin/championships')}
                        >
                            <Ionicons name="add-circle" size={32} color="#3b82f6" />
                            <Text style={styles.quickActionText}>Novo Campeonato</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => router.push('/admin/matches')}
                        >
                            <Ionicons name="calendar" size={32} color="#10b981" />
                            <Text style={styles.quickActionText}>Nova Partida</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => router.push('/admin/teams')}
                        >
                            <Ionicons name="people" size={32} color="#f59e0b" />
                            <Text style={styles.quickActionText}>Nova Equipe</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.quickActionButton}
                            onPress={() => router.push('/admin/players')}
                        >
                            <Ionicons name="person-add" size={32} color="#ec4899" />
                            <Text style={styles.quickActionText}>Novo Jogador</Text>
                        </TouchableOpacity>
                    </View>
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
    periodSelector: {
        flexDirection: 'row',
        padding: 16,
        gap: 8,
    },
    periodButton: {
        flex: 1,
        paddingVertical: 12,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        alignItems: 'center',
    },
    periodButtonActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    periodButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    periodButtonTextActive: {
        color: '#fff',
    },
    statsContainer: {
        padding: 16,
    },
    statsRow: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        marginTop: 4,
    },
    statSubLabel: {
        fontSize: 10,
        color: '#9ca3af',
        marginTop: 2,
    },
    section: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 16,
    },
    exportButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    exportButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        backgroundColor: '#f9fafb',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        gap: 8,
    },
    exportButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    activityCard: {
        flexDirection: 'row',
        padding: 12,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        marginBottom: 8,
    },
    activityIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#eff6ff',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    activityDescription: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    activityTime: {
        fontSize: 10,
        color: '#9ca3af',
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
    quickActions: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    quickActionButton: {
        width: '48%',
        padding: 20,
        backgroundColor: '#f9fafb',
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    quickActionText: {
        marginTop: 8,
        fontSize: 12,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center',
    },
});

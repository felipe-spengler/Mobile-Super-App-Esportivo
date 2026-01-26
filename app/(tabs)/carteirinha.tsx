import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';

interface WalletData {
    user_name: string;
    user_id: number;
    qr_code_content: string;
    club_name: string;
    status: string;
    expires_at: string;
}

export default function DigitalCard() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [walletData, setWalletData] = useState<WalletData | null>(null);

    useEffect(() => {
        loadWallet();
    }, []);

    const loadWallet = async () => {
        try {
            setLoading(true);
            const response = await api.get('/wallet/my-card');
            setWalletData(response.data);
        } catch (error) {
            console.error('Erro ao carregar carteirinha:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Carregando carteirinha...</Text>
            </View>
        );
    }

    if (!walletData) {
        return (
            <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={64} color="#ef4444" />
                <Text style={styles.errorText}>Erro ao carregar carteirinha</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadWallet}>
                    <Text style={styles.retryButtonText}>Tentar Novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Card da Carteirinha */}
            <View style={styles.card}>
                {/* Header do Card */}
                <View style={styles.cardHeader}>
                    <Ionicons name="shield-checkmark" size={32} color="#fff" />
                    <Text style={styles.cardTitle}>Carteirinha Digital</Text>
                </View>

                {/* Informações do Atleta */}
                <View style={styles.cardBody}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {walletData.user_name.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    </View>

                    <Text style={styles.userName}>{walletData.user_name}</Text>
                    <Text style={styles.userId}>ID: {walletData.user_id}</Text>

                    <View style={styles.infoRow}>
                        <Ionicons name="business" size={20} color="#6b7280" />
                        <Text style={styles.infoText}>{walletData.club_name}</Text>
                    </View>

                    <View style={styles.statusContainer}>
                        <View style={[styles.statusBadge, styles.statusActive]}>
                            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                            <Text style={styles.statusText}>{walletData.status}</Text>
                        </View>
                    </View>

                    {/* QR Code */}
                    <View style={styles.qrContainer}>
                        <QRCode
                            value={walletData.qr_code_content}
                            size={200}
                            backgroundColor="white"
                            color="black"
                        />
                    </View>

                    <Text style={styles.qrLabel}>Apresente este QR Code na entrada</Text>

                    {/* Validade */}
                    <View style={styles.expiryContainer}>
                        <Ionicons name="calendar" size={16} color="#9ca3af" />
                        <Text style={styles.expiryText}>
                            Válido até: {walletData.expires_at}
                        </Text>
                    </View>
                </View>

                {/* Footer do Card */}
                <View style={styles.cardFooter}>
                    <Text style={styles.footerText}>
                        Mantenha esta carteirinha sempre atualizada
                    </Text>
                </View>
            </View>

            {/* Instruções */}
            <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsTitle}>Como usar:</Text>
                <View style={styles.instructionItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text style={styles.instructionText}>
                        Apresente o QR Code na entrada do clube
                    </Text>
                </View>
                <View style={styles.instructionItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text style={styles.instructionText}>
                        Use antes das partidas para check-in
                    </Text>
                </View>
                <View style={styles.instructionItem}>
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                    <Text style={styles.instructionText}>
                        Mantenha seus dados sempre atualizados
                    </Text>
                </View>
            </View>

            {/* Botão de Atualizar */}
            <TouchableOpacity style={styles.refreshButton} onPress={loadWallet}>
                <Ionicons name="refresh" size={20} color="#fff" />
                <Text style={styles.refreshButtonText}>Atualizar Carteirinha</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    content: {
        padding: 16,
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
        padding: 32,
    },
    errorText: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 24,
        paddingHorizontal: 24,
        paddingVertical: 12,
        backgroundColor: '#3b82f6',
        borderRadius: 8,
    },
    retryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#3b82f6',
        gap: 12,
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
    },
    cardBody: {
        padding: 24,
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#3b82f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: '700',
        color: '#fff',
    },
    userName: {
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 4,
    },
    userId: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    infoText: {
        fontSize: 16,
        color: '#6b7280',
    },
    statusContainer: {
        marginBottom: 24,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    statusActive: {
        backgroundColor: '#d1fae5',
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#10b981',
    },
    qrContainer: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        marginBottom: 12,
    },
    qrLabel: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 16,
    },
    expiryContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    expiryText: {
        fontSize: 12,
        color: '#9ca3af',
    },
    cardFooter: {
        padding: 16,
        backgroundColor: '#f9fafb',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
    },
    footerText: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
    },
    instructionsContainer: {
        marginTop: 24,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    instructionsTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1f2937',
        marginBottom: 16,
    },
    instructionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 12,
    },
    instructionText: {
        flex: 1,
        fontSize: 14,
        color: '#6b7280',
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 24,
        padding: 16,
        backgroundColor: '#3b82f6',
        borderRadius: 12,
    },
    refreshButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

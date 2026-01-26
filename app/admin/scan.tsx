import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Vibration,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { api } from '../../src/services/api';

export default function ScanQRCode() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [validating, setValidating] = useState(false);

    if (!permission) {
        return (
            <View style={styles.container}>
                <Text>Solicitando permissão da câmera...</Text>
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Ionicons name="camera-outline" size={64} color="#9ca3af" />
                <Text style={styles.permissionTitle}>Permissão de Câmera</Text>
                <Text style={styles.permissionText}>
                    Precisamos de acesso à câmera para escanear QR Codes
                </Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
                    <Text style={styles.permissionButtonText}>Permitir Câmera</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (scanned || validating) return;

        setScanned(true);
        setValidating(true);
        Vibration.vibrate(100);

        try {
            // Parse QR Code data
            const qrData = JSON.parse(data);

            // Validate with backend
            const response = await api.post('/admin/qr/validate-wallet', {
                qr_data: qrData,
            });

            const player = response.data;

            // Show success
            Alert.alert(
                '✅ Jogador Válido',
                `Nome: ${player.name}\nID: ${player.id}\nStatus: ${player.status}`,
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            setScanned(false);
                            setValidating(false);
                        },
                    },
                ]
            );
        } catch (error: any) {
            console.error('Erro ao validar QR Code:', error);

            Alert.alert(
                '❌ QR Code Inválido',
                error.response?.data?.message || 'Não foi possível validar este QR Code.',
                [
                    {
                        text: 'Tentar Novamente',
                        onPress: () => {
                            setScanned(false);
                            setValidating(false);
                        },
                    },
                ]
            );
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Scanner QR Code</Text>
                <View style={{ width: 40 }} />
            </View>

            {/* Camera */}
            <CameraView
                style={styles.camera}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
            >
                <View style={styles.overlay}>
                    {/* Top Overlay */}
                    <View style={styles.overlayTop} />

                    {/* Middle with Frame */}
                    <View style={styles.overlayMiddle}>
                        <View style={styles.overlaySide} />
                        <View style={styles.scanFrame}>
                            <View style={[styles.corner, styles.cornerTopLeft]} />
                            <View style={[styles.corner, styles.cornerTopRight]} />
                            <View style={[styles.corner, styles.cornerBottomLeft]} />
                            <View style={[styles.corner, styles.cornerBottomRight]} />

                            {validating && (
                                <View style={styles.validatingOverlay}>
                                    <Text style={styles.validatingText}>Validando...</Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.overlaySide} />
                    </View>

                    {/* Bottom Overlay */}
                    <View style={styles.overlayBottom}>
                        <Text style={styles.instructionText}>
                            Posicione o QR Code dentro do quadrado
                        </Text>
                    </View>
                </View>
            </CameraView>

            {/* Manual Input Button */}
            <TouchableOpacity
                style={styles.manualButton}
                onPress={() => {
                    Alert.alert('Em Desenvolvimento', 'Validação manual em breve!');
                }}
            >
                <Ionicons name="create-outline" size={20} color="#3b82f6" />
                <Text style={styles.manualButtonText}>Validar Manualmente</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
        backgroundColor: '#fff',
    },
    permissionTitle: {
        marginTop: 16,
        fontSize: 24,
        fontWeight: '700',
        color: '#1f2937',
    },
    permissionText: {
        marginTop: 8,
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
    },
    permissionButton: {
        marginTop: 24,
        paddingHorizontal: 32,
        paddingVertical: 16,
        backgroundColor: '#3b82f6',
        borderRadius: 12,
    },
    permissionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 16,
        paddingTop: 48,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    camera: {
        flex: 1,
    },
    overlay: {
        flex: 1,
    },
    overlayTop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    overlayMiddle: {
        flexDirection: 'row',
    },
    overlaySide: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    scanFrame: {
        width: 250,
        height: 250,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#3b82f6',
    },
    cornerTopLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    cornerTopRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    cornerBottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    cornerBottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
    },
    validatingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    validatingText: {
        fontSize: 18,
        fontWeight: '700',
        color: '#fff',
    },
    overlayBottom: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 32,
    },
    instructionText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        textAlign: 'center',
    },
    manualButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        margin: 16,
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
    },
    manualButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3b82f6',
    },
});

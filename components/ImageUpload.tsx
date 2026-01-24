import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

interface ImageUploadProps {
    onUploadComplete: (url: string, path: string) => void;
    currentImage?: string;
    uploadType: 'team-logo' | 'player-photo' | 'award' | 'generic';
    entityId?: number;
    label?: string;
    aspectRatio?: [number, number];
}

export default function ImageUpload({
    onUploadComplete,
    currentImage,
    uploadType,
    entityId,
    label = 'Selecionar Imagem',
    aspectRatio = [1, 1],
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [imageUri, setImageUri] = useState<string | undefined>(currentImage);

    const requestPermissions = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permissão Negada', 'Precisamos de permissão para acessar suas fotos.');
            return false;
        }
        return true;
    };

    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: aspectRatio,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const uri = result.assets[0].uri;
                setImageUri(uri);
                await uploadImage(uri);
            }
        } catch (error) {
            console.error('Erro ao selecionar imagem:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
        }
    };

    const uploadImage = async (uri: string) => {
        try {
            setUploading(true);

            // Prepara o FormData
            const formData = new FormData();
            const filename = uri.split('/').pop() || 'image.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : 'image/jpeg';

            formData.append('image', {
                uri,
                name: filename,
                type,
            } as any);

            // Define o endpoint baseado no tipo
            let endpoint = '';
            switch (uploadType) {
                case 'team-logo':
                    endpoint = `/admin/upload/team/${entityId}/logo`;
                    formData.append('logo', formData.get('image') as any);
                    formData.delete('image');
                    break;
                case 'player-photo':
                    endpoint = `/admin/upload/player/${entityId}/photo`;
                    formData.append('photo', formData.get('image') as any);
                    formData.delete('image');
                    break;
                case 'award':
                    endpoint = '/admin/upload/award';
                    formData.append('photo', formData.get('image') as any);
                    formData.append('type', 'custom');
                    formData.delete('image');
                    break;
                case 'generic':
                    endpoint = '/admin/upload/generic';
                    formData.append('folder', 'uploads');
                    break;
            }

            const response = await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            const { photo_url, logo_url, url, photo_path, logo_path, path } = response.data;
            const finalUrl = photo_url || logo_url || url;
            const finalPath = photo_path || logo_path || path;

            onUploadComplete(finalUrl, finalPath);
            Alert.alert('Sucesso', 'Imagem enviada com sucesso!');
        } catch (error: any) {
            console.error('Erro ao fazer upload:', error);
            Alert.alert('Erro', error.response?.data?.message || 'Não foi possível enviar a imagem.');
            setImageUri(currentImage);
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <TouchableOpacity
                style={styles.uploadButton}
                onPress={pickImage}
                disabled={uploading}
            >
                {uploading ? (
                    <View style={styles.uploadingContainer}>
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text style={styles.uploadingText}>Enviando...</Text>
                    </View>
                ) : imageUri ? (
                    <View style={styles.imageContainer}>
                        <Image source={{ uri: imageUri }} style={styles.image} />
                        <View style={styles.changeOverlay}>
                            <Ionicons name="camera" size={24} color="#fff" />
                            <Text style={styles.changeText}>Alterar</Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.placeholderContainer}>
                        <Ionicons name="cloud-upload-outline" size={48} color="#9ca3af" />
                        <Text style={styles.placeholderText}>Toque para selecionar</Text>
                    </View>
                )}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 8,
    },
    uploadButton: {
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
        overflow: 'hidden',
        backgroundColor: '#f9fafb',
    },
    uploadingContainer: {
        padding: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    uploadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6b7280',
    },
    imageContainer: {
        position: 'relative',
        aspectRatio: 1,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    changeOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        padding: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    changeText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        marginTop: 4,
    },
    placeholderContainer: {
        padding: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderText: {
        marginTop: 12,
        fontSize: 16,
        color: '#9ca3af',
    },
});

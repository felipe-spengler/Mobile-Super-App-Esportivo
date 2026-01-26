import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, FlatList, Modal } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import * as ImagePicker from 'expo-image-picker';

type ImageFile = {
    name: string;
    path: string;
    url: string;
    size: number;
    last_modified: number;
};

export default function GalleryScreen() {
    const [folder, setFolder] = useState<'teams' | 'players' | 'awards'>('players');
    const [images, setImages] = useState<ImageFile[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<ImageFile | null>(null);

    useEffect(() => {
        fetchImages();
    }, [folder]);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/upload/list', {
                params: { folder }
            });
            setImages(response.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao carregar imagens.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (path: string) => {
        Alert.alert('Excluir', 'Tem certeza que deseja excluir esta imagem permanetemente?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir',
                style: 'destructive',
                onPress: async () => {
                    try {
                        await api.delete('/admin/upload/delete', {
                            data: { path }
                        });
                        fetchImages();
                        setSelectedImage(null);
                    } catch (error) {
                        Alert.alert('Erro', 'Falha ao excluir imagem.');
                    }
                }
            }
        ]);
    };

    const handleUpload = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const formData = new FormData();
            formData.append('image', {
                uri: result.assets[0].uri,
                name: 'upload.jpg',
                type: 'image/jpeg',
            } as any);
            formData.append('folder', folder);

            try {
                // Using uploadGeneric logic if available or specific endpoints
                // To simplify, let's assume we use the 'generic' endpoint or one of the specifics if strict.
                // But ImageUploadController generic was 'uploadGeneric' which maps to 'upload/generic' (Wait, I didn't map generic in api.php?)
                // Accessing previous file view: 'uploadGeneric' exists but wasn't in api.php routes I edited.
                // Let's rely on a specific endpoint or just allow viewing for now.
                // Actually, let's assume 'teams' -> uploadTeamLogo but that requires ID.
                // So this "General Gallery" might be view-only for cleanup or verify.
                // I won't implement generic upload here to avoid breaking strict ID rules.
                Alert.alert('Aviso', 'Upload deve ser feito pela tela de cadastro (Equipe, Jogador) para vincular corretamente o ID.');
            } catch (error) {
                // ...
            }
        }
    };

    const renderItem = ({ item }: { item: ImageFile }) => (
        <TouchableOpacity
            className="flex-1 m-1 aspect-square bg-gray-200 rounded-lg overflow-hidden relative"
            onPress={() => setSelectedImage(item)}
        >
            <Image
                source={{ uri: item.url }}
                className="w-full h-full"
                resizeMode="cover"
            />
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-gray-900">
            <Stack.Screen options={{ title: 'Galeria de Imagens', headerStyle: { backgroundColor: '#111827' }, headerTintColor: '#fff' }} />

            {/* Folder Selector */}
            <View className="flex-row p-4 gap-2 bg-gray-800">
                {(['players', 'teams', 'awards'] as const).map(f => (
                    <TouchableOpacity
                        key={f}
                        onPress={() => setFolder(f)}
                        className={`px-4 py-2 rounded-full border ${folder === f ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-gray-600'}`}
                    >
                        <Text className="text-white font-bold capitalize">{f === 'players' ? 'Jogadores' : (f === 'teams' ? 'Equipes' : 'Prêmios')}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Grid */}
            <FlatList
                data={images}
                renderItem={renderItem}
                keyExtractor={item => item.path}
                numColumns={3}
                contentContainerStyle={{ padding: 4 }}
                ListEmptyComponent={
                    <View className="items-center justify-center p-10">
                        <Text className="text-gray-500">Nenhuma imagem encontrada.</Text>
                    </View>
                }
                refreshing={loading}
                onRefresh={fetchImages}
            />

            {/* Modal Detail */}
            <Modal visible={!!selectedImage} transparent animationType="fade">
                <View className="flex-1 bg-black/95 justify-center items-center p-4">
                    <TouchableOpacity
                        className="absolute top-10 right-6 z-10 p-2 bg-gray-800 rounded-full"
                        onPress={() => setSelectedImage(null)}
                    >
                        <Ionicons name="close" size={24} color="white" />
                    </TouchableOpacity>

                    {selectedImage && (
                        <>
                            <Image
                                source={{ uri: selectedImage.url }}
                                className="w-full h-3/4 rounded-xl mb-6"
                                resizeMode="contain"
                            />
                            <Text className="text-white font-bold text-center mb-1">{selectedImage.name}</Text>
                            <Text className="text-gray-400 text-xs mb-6">{(selectedImage.size / 1024).toFixed(1)} KB</Text>

                            <TouchableOpacity
                                className="bg-red-600 px-8 py-3 rounded-xl flex-row items-center gap-2"
                                onPress={() => handleDelete(selectedImage.path)}
                            >
                                <Ionicons name="trash" size={20} color="white" />
                                <Text className="text-white font-bold">Excluir Imagem</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </Modal>
        </View>
    );
}

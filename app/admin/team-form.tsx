import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../src/services/api';
import '../../global.css';

export default function TeamFormScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [logo, setLogo] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        short_name: '',
        city: '',
        primary_color: '#0d6efd',
        secondary_color: '#ffffff',
    });

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    async function loadData() {
        try {
            const response = await api.get(`/admin/teams/${id}`);
            const data = response.data;
            setFormData({
                name: data.name,
                short_name: data.short_name || '',
                city: data.city || '',
                primary_color: data.primary_color || '#0d6efd',
                secondary_color: data.secondary_color || '#ffffff',
            });
            setLogo(data.logo_url);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Erro ao carregar dados do time.');
            router.back();
        }
    }

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            setLogo(result.assets[0].uri);
        }
    };

    async function handleSubmit() {
        if (!formData.name) return Alert.alert('Erro', 'Nome é obrigatório');
        setLoading(true);

        try {
            const endpoint = isEditing ? `/admin/teams/${id}` : '/admin/teams';
            const method = isEditing ? 'put' : 'post';

            // 1. Save Data
            // @ts-ignore
            const response = await api[method](endpoint, formData);
            const teamId = isEditing ? id : response.data.id;

            // 2. Upload Logo if changed (Local URI check)
            if (logo && !logo.startsWith('http')) {
                const uploadData = new FormData();
                // @ts-ignore
                uploadData.append('logo', {
                    uri: logo,
                    name: 'logo.jpg',
                    type: 'image/jpeg',
                });
                await api.post(`/admin/upload/team-logo/${teamId}`, uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            Alert.alert('Sucesso', 'Time salvo com sucesso!');
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível salvar.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="flex-row items-center justify-between p-4 pt-12 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <MaterialIcons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 dark:text-white">{isEditing ? 'Editar Time' : 'Novo Time'}</Text>
                <TouchableOpacity onPress={handleSubmit} disabled={loading} className="bg-indigo-600 px-4 py-2 rounded-lg">
                    {loading ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-bold">Salvar</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView className="p-4">
                <View className="items-center mb-6">
                    <TouchableOpacity onPress={pickImage} className="w-28 h-28 bg-gray-200 rounded-full items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                        {logo ? (
                            <Image source={{ uri: logo }} className="w-full h-full" />
                        ) : (
                            <FontAwesome5 name="camera" size={32} color="#9CA3AF" />
                        )}
                        <View className="absolute bottom-0 bg-black/50 w-full h-8 items-center justify-center">
                            <Text className="text-white text-[10px] uppercase font-bold">Editar Logo</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-700">
                    <Text className="text-xs text-gray-500 mb-1">Nome da Equipe</Text>
                    <TextInput
                        value={formData.name}
                        onChangeText={t => setFormData({ ...formData, name: t })}
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4 text-gray-800 dark:text-white"
                        placeholder="Ex: Barcelona F.C."
                    />

                    <Text className="text-xs text-gray-500 mb-1">Abreviação (3 letras)</Text>
                    <TextInput
                        value={formData.short_name}
                        onChangeText={t => setFormData({ ...formData, short_name: t.toUpperCase().slice(0, 3) })}
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4 text-gray-800 dark:text-white"
                        placeholder="BAR"
                        maxLength={3}
                    />

                    <Text className="text-xs text-gray-500 mb-1">Cidade / Origem</Text>
                    <TextInput
                        value={formData.city}
                        onChangeText={t => setFormData({ ...formData, city: t })}
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4 text-gray-800 dark:text-white"
                        placeholder="Ex: São Paulo"
                    />
                </View>

                <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-700">
                    <Text className="font-bold text-gray-700 dark:text-gray-300 mb-3">Identidade Visual</Text>
                    <View className="flex-row gap-4">
                        <View className="flex-1">
                            <Text className="text-xs text-gray-500 mb-1">Cor Primária (Hex)</Text>
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded mr-2 border border-gray-200" style={{ backgroundColor: formData.primary_color }} />
                                <TextInput
                                    value={formData.primary_color}
                                    onChangeText={t => setFormData({ ...formData, primary_color: t })}
                                    className="flex-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-800 dark:text-white"
                                    placeholder="#000000"
                                />
                            </View>
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs text-gray-500 mb-1">Cor Secundária (Hex)</Text>
                            <View className="flex-row items-center">
                                <View className="w-8 h-8 rounded mr-2 border border-gray-200" style={{ backgroundColor: formData.secondary_color }} />
                                <TextInput
                                    value={formData.secondary_color}
                                    onChangeText={t => setFormData({ ...formData, secondary_color: t })}
                                    className="flex-1 bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-800 dark:text-white"
                                    placeholder="#FFFFFF"
                                />
                            </View>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

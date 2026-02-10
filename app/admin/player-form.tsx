import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../src/services/api';
import '../../global.css';

export default function PlayerFormScreen() {
    const router = useRouter();
    const { id, teamId } = useLocalSearchParams();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [teams, setTeams] = useState<any[]>([]);

    const [photo, setPhoto] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        team_id: teamId ? teamId.toString() : '',
        number: '',
        position: '',
        cpf: '', // Assuming CPF is needed for registration
        email: '',
    });

    useEffect(() => {
        loadInitialData();
    }, [id]);

    async function loadInitialData() {
        try {
            // Load teams for selector
            const teamsRes = await api.get('/admin/teams');
            setTeams(teamsRes.data);

            if (isEditing) {
                const response = await api.get(`/admin/players/${id}`);
                const data = response.data;
                setFormData({
                    name: data.name,
                    team_id: data.team_id.toString(),
                    number: data.number ? data.number.toString() : '',
                    position: data.position,
                    cpf: data.cpf || '',
                    email: data.email || '',
                });
                setPhoto(data.photo_url ? (data.photo_url.startsWith('http') ? data.photo_url : `https://esportivo.techinteligente.site${data.photo_url}`) : null);
            }
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Erro ao carregar dados.');
            router.back();
        } finally {
            setFetching(false);
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
            setPhoto(result.assets[0].uri);
        }
    };

    async function handleSubmit() {
        if (!formData.name) return Alert.alert('Erro', 'Nome é obrigatório');
        if (!formData.team_id) return Alert.alert('Erro', 'Time é obrigatório');

        setLoading(true);
        try {
            const endpoint = isEditing ? `/admin/players/${id}` : '/admin/players';
            const method = isEditing ? 'put' : 'post';
            const payload = { ...formData, number: parseInt(formData.number) || null, team_id: parseInt(formData.team_id) };

            // @ts-ignore
            const response = await api[method](endpoint, payload);
            const playerId = isEditing ? id : response.data.id;

            if (photo && !photo.startsWith('http')) {
                const uploadData = new FormData();
                // @ts-ignore
                uploadData.append('photo', {
                    uri: photo,
                    name: 'photo.jpg',
                    type: 'image/jpeg',
                });
                await api.post(`/admin/upload/player-photo/${playerId}`, uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            Alert.alert('Sucesso', 'Jogador salvo!');
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao salvar jogador.');
        } finally {
            setLoading(false);
        }
    }

    if (fetching) return <View className="flex-1 justify-center items-center"><ActivityIndicator color="#4F46E5" /></View>;

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="flex-row items-center justify-between p-4 pt-12 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <MaterialIcons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-gray-800 dark:text-white">{isEditing ? 'Editar Jogador' : 'Novo Jogador'}</Text>
                <TouchableOpacity onPress={handleSubmit} disabled={loading} className="bg-indigo-600 px-4 py-2 rounded-lg">
                    {loading ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-bold">Salvar</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView className="p-4">
                <View className="items-center mb-6">
                    <TouchableOpacity onPress={pickImage} className="w-24 h-24 bg-gray-200 rounded-full items-center justify-center overflow-hidden border-4 border-white shadow-sm">
                        {photo ? (
                            <Image source={{ uri: photo }} className="w-full h-full" />
                        ) : (
                            <FontAwesome5 name="user" size={32} color="#9CA3AF" />
                        )}
                        <View className="absolute bottom-0 bg-black/50 w-full h-6 items-center justify-center">
                            <Text className="text-white text-[8px] uppercase font-bold">Foto</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-700">
                    <Text className="text-xs text-gray-500 mb-1">Nome Completo</Text>
                    <TextInput
                        value={formData.name}
                        onChangeText={t => setFormData({ ...formData, name: t })}
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4 text-gray-800 dark:text-white"
                        placeholder="Nome do Jogador"
                    />

                    <Text className="text-xs text-gray-500 mb-1">Time</Text>
                    <View className="flex-row flex-wrap gap-2 mb-4">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {teams.map(t => (
                                <TouchableOpacity
                                    key={t.id}
                                    onPress={() => setFormData({ ...formData, team_id: t.id.toString() })}
                                    className={`px-3 py-2 rounded-lg mr-2 border ${formData.team_id === t.id.toString() ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-200'}`}
                                >
                                    <Text className={formData.team_id === t.id.toString() ? 'text-indigo-700 font-bold' : 'text-gray-600'}>{t.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View className="flex-row gap-4 mb-4">
                        <View className="flex-1">
                            <Text className="text-xs text-gray-500 mb-1">Número</Text>
                            <TextInput
                                value={formData.number}
                                onChangeText={t => setFormData({ ...formData, number: t })}
                                className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-800 dark:text-white"
                                placeholder="10"
                                keyboardType="numeric"
                            />
                        </View>
                        <View className="flex-1">
                            <Text className="text-xs text-gray-500 mb-1">Posição</Text>
                            <TextInput
                                value={formData.position}
                                onChangeText={t => setFormData({ ...formData, position: t })}
                                className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-800 dark:text-white"
                                placeholder="Atacante"
                            />
                        </View>
                    </View>

                    <Text className="text-xs text-gray-500 mb-1">CPF (Opcional)</Text>
                    <TextInput
                        value={formData.cpf}
                        onChangeText={t => setFormData({ ...formData, cpf: t })}
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4 text-gray-800 dark:text-white"
                        placeholder="000.000.000-00"
                        keyboardType="numeric"
                    />

                    <Text className="text-xs text-gray-500 mb-1">Email (Opcional)</Text>
                    <TextInput
                        value={formData.email}
                        onChangeText={t => setFormData({ ...formData, email: t })}
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg mb-4 text-gray-800 dark:text-white"
                        placeholder="email@exemplo.com"
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>
            </ScrollView>
        </View>
    );
}

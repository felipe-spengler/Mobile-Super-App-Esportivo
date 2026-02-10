import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert, Switch } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import '../../global.css';

export default function SuperAdminClubForm() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditing);

    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        city: '',
        active: true,
        admin_email: '', // For creating initial admin
        admin_password: '',
    });

    useEffect(() => {
        if (id) loadData();
    }, [id]);

    async function loadData() {
        try {
            const response = await api.get(`/superadmin/clubs/${id}`);
            const data = response.data;
            setFormData({
                name: data.name,
                slug: data.slug || '',
                city: data.city || '',
                active: data.active,
                admin_email: '', // Sensitive info usually not retrievable
                admin_password: '',
            });
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Erro ao carregar clube.');
            router.back();
        } finally {
            setFetching(false);
        }
    }

    async function handleSubmit() {
        if (!formData.name) return Alert.alert('Erro', 'Nome é obrigatório');
        if (!isEditing && !formData.admin_email) return Alert.alert('Erro', 'Email do admin é obrigatório');

        setLoading(true);
        try {
            const endpoint = isEditing ? `/superadmin/clubs/${id}` : '/superadmin/clubs';
            const method = isEditing ? 'put' : 'post';

            await api[method as 'post' | 'put'](endpoint, formData);

            Alert.alert('Sucesso', 'Clube salvo com sucesso!');
            router.back();
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Não foi possível salvar.');
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
                <Text className="text-xl font-bold text-gray-800 dark:text-white">{isEditing ? 'Editar Clube' : 'Novo Clube'}</Text>
                <TouchableOpacity onPress={handleSubmit} disabled={loading} className="bg-indigo-600 px-4 py-2 rounded-lg">
                    {loading ? <ActivityIndicator color="white" size="small" /> : <Text className="text-white font-bold">Salvar</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView className="p-4">
                <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-700">
                    <Text className="text-xs text-gray-500 mb-1 font-bold uppercase">Dados do Clube</Text>

                    <Text className="text-xs text-gray-500 mb-1 mt-2">Nome</Text>
                    <TextInput
                        value={formData.name}
                        onChangeText={t => setFormData({ ...formData, name: t })}
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600"
                        placeholder="Nome do Clube/Organização"
                    />

                    <Text className="text-xs text-gray-500 mb-1 mt-3">Slug (URL)</Text>
                    <TextInput
                        value={formData.slug}
                        onChangeText={t => setFormData({ ...formData, slug: t.toLowerCase().replace(/\s+/g, '-') })}
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600"
                        placeholder="ex: clube-exemplo"
                        autoCapitalize="none"
                    />

                    <Text className="text-xs text-gray-500 mb-1 mt-3">Cidade</Text>
                    <TextInput
                        value={formData.city}
                        onChangeText={t => setFormData({ ...formData, city: t })}
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600"
                        placeholder="Cidade Sede"
                    />

                    <View className="flex-row items-center justify-between mt-4">
                        <Text className="text-gray-700 dark:text-gray-300 font-bold">Clube Ativo</Text>
                        <Switch
                            value={formData.active}
                            onValueChange={v => setFormData({ ...formData, active: v })}
                            trackColor={{ false: "#767577", true: "#818cf8" }}
                            thumbColor={formData.active ? "#4f46e5" : "#f4f3f4"}
                        />
                    </View>
                </View>

                {!isEditing && (
                    <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-700">
                        <Text className="text-xs text-gray-500 mb-1 font-bold uppercase">Administrador Inicial</Text>

                        <Text className="text-xs text-gray-500 mb-1 mt-2">Email Admin</Text>
                        <TextInput
                            value={formData.admin_email}
                            onChangeText={t => setFormData({ ...formData, admin_email: t })}
                            className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600"
                            placeholder="admin@clube.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text className="text-xs text-gray-500 mb-1 mt-3">Senha Inicial</Text>
                        <TextInput
                            value={formData.admin_password}
                            onChangeText={t => setFormData({ ...formData, admin_password: t })}
                            className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600"
                            placeholder="Mínimo 6 caracteres"
                            secureTextEntry
                        />
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

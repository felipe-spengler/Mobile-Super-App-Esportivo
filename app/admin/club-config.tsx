import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { api } from '../../src/services/api';
import '../../global.css';

export default function ClubConfigScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [club, setClub] = useState<any>(null);
    const [form, setForm] = useState({
        name: '',
        primary_color: '',
        secondary_color: ''
    });

    useEffect(() => {
        loadClub();
    }, []);

    async function loadClub() {
        try {
            setLoading(true);
            const response = await api.get('/club');
            const data = response.data;
            setClub(data);
            setForm({
                name: data.name,
                primary_color: data.primary_color,
                secondary_color: data.secondary_color
            });
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível carregar dados do clube');
        } finally {
            setLoading(false);
        }
    }

    async function handleSave() {
        try {
            setLoading(true);
            await api.put('/admin/club', form);
            Alert.alert('Sucesso', 'Configurações atualizadas!');
            router.back();
        } catch (error) {
            Alert.alert('Erro', 'Falha ao salvar');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 border-b border-gray-100 dark:border-gray-700 flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                        <MaterialIcons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800 dark:text-white ml-2">Configurar Clube</Text>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#4F46E5" />
                </View>
            ) : (
                <ScrollView className="p-4">
                    <View className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <Text className="text-xs text-gray-500 mb-1 font-bold uppercase">Nome do Clube</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl mb-6 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600"
                            value={form.name}
                            onChangeText={t => setForm({ ...form, name: t })}
                            placeholder="Ex: Esporte Clube"
                        />

                        <Text className="text-xs text-gray-500 mb-1 font-bold uppercase">Cor Primária (Hex)</Text>
                        <View className="flex-row items-center gap-3 mb-6">
                            <View
                                style={{ backgroundColor: form.primary_color }}
                                className="w-12 h-12 rounded-xl border border-gray-200 shadow-sm"
                            />
                            <TextInput
                                className="flex-1 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600"
                                value={form.primary_color}
                                onChangeText={t => setForm({ ...form, primary_color: t })}
                                placeholder="#000000"
                            />
                        </View>

                        <Text className="text-xs text-gray-500 mb-1 font-bold uppercase">Cor Secundária (Hex)</Text>
                        <View className="flex-row items-center gap-3 mb-8">
                            <View
                                style={{ backgroundColor: form.secondary_color }}
                                className="w-12 h-12 rounded-xl border border-gray-200 shadow-sm"
                            />
                            <TextInput
                                className="flex-1 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl text-gray-800 dark:text-white border border-gray-200 dark:border-gray-600"
                                value={form.secondary_color}
                                onChangeText={t => setForm({ ...form, secondary_color: t })}
                                placeholder="#ffffff"
                            />
                        </View>

                        <TouchableOpacity
                            className="bg-indigo-600 p-4 rounded-xl items-center shadow-lg shadow-indigo-200"
                            onPress={handleSave}
                        >
                            <Text className="text-white font-bold text-lg">Salvar Alterações</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            )}
        </View>
    );
}

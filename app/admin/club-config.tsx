import { View, Text, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
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
            const response = await api.get('/club'); // Assumindo rota que retorna clube do usuário logado
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
            <View className="bg-white dark:bg-gray-800 p-4 pt-12 border-b border-gray-200 dark:border-gray-700 flex-row items-center justify-between shadow-sm">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 mr-2">
                        <MaterialIcons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800 dark:text-white">Configurar Clube</Text>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#0d6efd" className="mt-10" />
            ) : (
                <View className="p-4">
                    <View className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                        <Text className="label">Nome do Clube</Text>
                        <TextInput
                            className="input"
                            value={form.name}
                            onChangeText={t => setForm({ ...form, name: t })}
                        />

                        <Text className="label">Cor Primária (Hex)</Text>
                        <View className="flex-row items-center gap-2">
                            <View style={{ backgroundColor: form.primary_color, width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#ccc' }} />
                            <TextInput
                                className="input flex-1"
                                value={form.primary_color}
                                onChangeText={t => setForm({ ...form, primary_color: t })}
                                placeholder="#000000"
                            />
                        </View>

                        <Text className="label">Cor Secundária (Hex)</Text>
                        <View className="flex-row items-center gap-2">
                            <View style={{ backgroundColor: form.secondary_color, width: 24, height: 24, borderRadius: 12, borderWidth: 1, borderColor: '#ccc' }} />
                            <TextInput
                                className="input flex-1"
                                value={form.secondary_color}
                                onChangeText={t => setForm({ ...form, secondary_color: t })}
                                placeholder="#ffffff"
                            />
                        </View>

                        <TouchableOpacity
                            className="bg-blue-600 p-4 rounded-xl mt-6 items-center"
                            onPress={handleSave}
                        >
                            <Text className="text-white font-bold text-lg">Salvar Alterações</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
        </View>
    );
}

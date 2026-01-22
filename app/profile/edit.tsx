
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import '../../global.css';
import api from '../../src/services/api';
import { FontAwesome5 } from '@expo/vector-icons';

export default function EditProfile() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [cpf, setCpf] = useState('');
    const [birthDate, setBirthDate] = useState('');

    useEffect(() => {
        async function loadUser() {
            try {
                const response = await api.get('/me');
                const user = response.data.data;
                setName(user.name);
                setPhone(user.phone || '');
                setCpf(user.cpf || '');
                setBirthDate(user.birth_date || '');
            } catch (error) {
                console.log(error);
                Alert.alert('Erro', 'Não foi possível carregar seus dados.');
            } finally {
                setLoading(false);
            }
        }
        loadUser();
    }, []);

    async function handleSave() {
        if (!name.trim()) {
            Alert.alert('Atenção', 'Nome é obrigatório.');
            return;
        }

        try {
            setSaving(true);
            setSuccessMessage('');
            await api.put('/me', {
                name,
                phone,
                // CPF and BirthDate are not sent to prevent modification
            });

            // Visual Feedback
            setSuccessMessage('Perfil atualizado com sucesso!');
            setTimeout(() => setSuccessMessage(''), 3000);

        } catch (error) {
            console.log(error);
            Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white dark:bg-gray-900 p-4 pt-12">

            <View className="flex-row items-center mb-6">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <FontAwesome5 name="arrow-left" size={20} className="text-gray-900 dark:text-white" />
                </TouchableOpacity>
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">Editar Dados</Text>
            </View>

            {successMessage ? (
                <View className="bg-green-100 dark:bg-green-900/50 p-4 rounded-xl mb-6 border border-green-200 dark:border-green-800">
                    <Text className="text-green-700 dark:text-green-300 font-bold text-center">{successMessage}</Text>
                </View>
            ) : null}

            <View className="space-y-4">
                <View>
                    <Text className="text-gray-500 dark:text-gray-400 mb-1 ml-1">Nome Completo</Text>
                    <TextInput
                        className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-xl"
                        placeholder="Seu nome"
                        placeholderTextColor="#9CA3AF"
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                <View className="mt-4">
                    <Text className="text-gray-500 dark:text-gray-400 mb-1 ml-1">Telefone / WhatsApp</Text>
                    <TextInput
                        className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-xl"
                        placeholder="(00) 00000-0000"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />
                </View>

                <View className="mt-4">
                    <Text className="text-gray-500 dark:text-gray-400 mb-1 ml-1">RG / CPF (Não modificável)</Text>
                    <TextInput
                        className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 p-4 rounded-xl"
                        placeholder="000.000.000-00"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="numeric"
                        value={cpf}
                        editable={false}
                    />
                    <Text className="text-xs text-gray-400 mt-1 ml-1">Valide novamente para alterar.</Text>
                </View>

                <View className="mt-4">
                    <Text className="text-gray-500 dark:text-gray-400 mb-1 ml-1">Data de Nascimento (Não modificável)</Text>
                    <TextInput
                        className="bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 p-4 rounded-xl"
                        placeholder="AAAA-MM-DD"
                        placeholderTextColor="#9CA3AF"
                        value={birthDate}
                        editable={false}
                    />
                </View>
            </View>

            <View className="mt-auto mb-6">
                <TouchableOpacity
                    className={`p-4 rounded-xl items-center ${saving ? 'bg-blue-400' : 'bg-blue-600'}`}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                        <Text className="text-white font-bold">Salvar Alterações</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

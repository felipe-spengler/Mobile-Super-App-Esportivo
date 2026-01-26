import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/services/api';

export default function NotificationsScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form Stats
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [target, setTarget] = useState<'all' | 'club' | 'team'>('all');

    const handleSend = async () => {
        if (!title.trim() || !body.trim()) {
            Alert.alert('Erro', 'Preencha título e mensagem.');
            return;
        }

        try {
            setLoading(true);
            const response = await api.post('/admin/notifications/send', {
                title,
                body,
                target,
                target_id: 1, // Mock: Default Club ID = 1
            });

            Alert.alert('Sucesso', `Notificação enviada para ${response.data.count} dispositivos.`);
            setTitle('');
            setBody('');
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao enviar notificação.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <Stack.Screen options={{ title: 'Enviar Notificações' }} />

            <ScrollView className="p-4">
                <Text className="text-gray-500 mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    Use esta tela para enviar alertas em massa para torcedores e jogadores.
                </Text>

                {/* TIPO DE PÚBLICO */}
                <Text className="font-bold text-gray-700 mb-2">Público Alvo</Text>
                <View className="flex-row gap-2 mb-6">
                    <TouchableOpacity
                        onPress={() => setTarget('all')}
                        className={`flex-1 p-3 rounded-lg border ${target === 'all' ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
                    >
                        <Text className={`text-center font-bold ${target === 'all' ? 'text-white' : 'text-gray-600'}`}>Todos</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setTarget('club')}
                        className={`flex-1 p-3 rounded-lg border ${target === 'club' ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
                    >
                        <Text className={`text-center font-bold ${target === 'club' ? 'text-white' : 'text-gray-600'}`}>Clube</Text>
                    </TouchableOpacity>
                </View>

                {/* FORMULÁRIO */}
                <View className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <Text className="font-bold text-gray-700 mb-2">Título</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-4 text-base"
                        placeholder="Ex: Jogo Adiado"
                        value={title}
                        onChangeText={setTitle}
                    />

                    <Text className="font-bold text-gray-700 mb-2">Mensagem</Text>
                    <TextInput
                        className="bg-gray-50 border border-gray-200 p-4 rounded-lg mb-6 text-base h-32"
                        placeholder="Digite sua mensagem aqui..."
                        value={body}
                        onChangeText={setBody}
                        multiline
                        textAlignVertical="top"
                    />

                    <TouchableOpacity
                        onPress={handleSend}
                        disabled={loading}
                        className={`bg-blue-600 p-4 rounded-xl items-center flex-row justify-center ${loading ? 'opacity-70' : ''}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Ionicons name="paper-plane" size={20} color="white" style={{ marginRight: 8 }} />
                                <Text className="text-white font-bold text-lg">ENVIAR AGORA</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

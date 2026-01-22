import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import api from '../../src/services/api';
import '../../global.css';

export default function TeamRoster() {
    const router = useRouter();
    const [teamName, setTeamName] = useState('');
    const [players, setPlayers] = useState([{ id: 1, name: '', rg: '' }]);
    const [loading, setLoading] = useState(false);

    function addPlayer() {
        setPlayers([...players, { id: players.length + 1, name: '', rg: '' }]);
    }

    function updatePlayer(index: number, field: 'name' | 'rg', value: string) {
        const newPlayers = [...players];
        newPlayers[index] = { ...newPlayers[index], [field]: value };
        setPlayers(newPlayers);
    }

    async function handleSubmit() {
        if (!teamName) return Alert.alert('Atenção', 'Digite o nome do time.');
        if (players.some(p => !p.name)) return Alert.alert('Atenção', 'Preencha o nome de todos os atletas.');

        setLoading(true);
        try {
            // Mock de IDs de campeonato/categoria (em prod viriam de params)
            await api.post('/inscriptions/team', {
                championship_id: 1,
                category_id: 1,
                team_name: teamName,
                players: players.map(p => ({ name: p.name, rg: p.rg }))
            });

            Alert.alert('Sucesso', 'Pré-inscrição realizada!', [
                { text: 'Ir para Pagamento', onPress: () => router.push('/checkout') }
            ]);
        } catch (error) {
            Alert.alert('Erro', 'Não foi possível realizar a inscrição.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-white p-4 pt-12">
            <Text className="text-xl font-bold text-gray-900 mb-6">Cadastro da Equipe</Text>

            <ScrollView className="flex-1">
                <View className="mb-6">
                    <Text className="font-bold text-gray-700 mb-2">Nome do Time</Text>
                    <TextInput
                        className="bg-gray-100 p-3 rounded-lg border border-gray-200"
                        placeholder="Ex: Real Madruga"
                        value={teamName}
                        onChangeText={setTeamName}
                    />
                </View>

                <Text className="font-bold text-gray-700 mb-2">Elenco ({players.length} Atletas)</Text>

                {players.map((item, index) => (
                    <View key={index} className="flex-row mb-2">
                        <TextInput
                            className="flex-1 bg-gray-50 p-3 rounded-l-lg border border-gray-200"
                            placeholder={`Nome Atleta ${index + 1}`}
                            value={item.name}
                            onChangeText={(text) => updatePlayer(index, 'name', text)}
                        />
                        <TextInput
                            className="w-32 bg-gray-50 p-3 rounded-r-lg border border-gray-200 border-l-0"
                            placeholder="RG"
                            keyboardType="numeric"
                            value={item.rg}
                            onChangeText={(text) => updatePlayer(index, 'rg', text)}
                        />
                    </View>
                ))}

                <TouchableOpacity
                    className="flex-row items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg mt-2"
                    onPress={addPlayer}
                >
                    <FontAwesome5 name="plus" size={14} color="#666" />
                    <Text className="text-gray-600 font-bold ml-2">Adicionar Atleta</Text>
                </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
                className={`bg-green-600 w-full p-4 rounded-xl items-center mt-4 ${loading ? 'opacity-50' : ''}`}
                onPress={handleSubmit}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text className="text-white font-bold">Finalizar Inscrição</Text>
                )}
            </TouchableOpacity>
        </View>
    );
}

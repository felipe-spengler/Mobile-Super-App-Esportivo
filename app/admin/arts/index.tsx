import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient'; // Se falhar, usar View com fundo gradiente mockado

const TEMPLATES = [
    {
        id: 'faceoff',
        title: 'Confronto',
        description: 'Arte para divulgar partidas futuras',
        icon: 'flash',
        color: '#3b82f6',
        image: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=VERSUS'
    },
    {
        id: 'mvp',
        title: 'Craque do Jogo',
        description: 'Destaque para o melhor em campo',
        icon: 'star',
        color: '#fbbf24',
        image: 'https://via.placeholder.com/300x200/fbbf24/000000?text=MVP'
    },
    {
        id: 'lineup',
        title: 'Escalação',
        description: 'Divulgue o time titular',
        icon: 'shirt',
        color: '#10b981',
        image: 'https://via.placeholder.com/300x200/10b981/ffffff?text=TIME' // Mock
    },
    {
        id: 'result',
        title: 'Placar Final',
        description: 'Resultado pós-jogo',
        icon: 'checkbox',
        color: '#ef4444',
        image: 'https://via.placeholder.com/300x200/ef4444/ffffff?text=PLACAR'
    }
];

export default function ArtsMenu() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-slate-950">
            <Stack.Screen
                options={{
                    title: 'Estúdio de Criação',
                    headerStyle: { backgroundColor: '#0f172a' },
                    headerTintColor: '#fff',
                }}
            />

            <ScrollView className="p-4">
                <Text className="text-slate-400 text-sm mb-6 uppercase tracking-wider font-bold">
                    Selecione um Modelo
                </Text>

                <View className="flex-row flex-wrap justify-between">
                    {TEMPLATES.map((template) => (
                        <TouchableOpacity
                            key={template.id}
                            className="w-[48%] mb-4 bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 shadow-lg"
                            onPress={() => router.push(`/admin/arts/generator?type=${template.id}`)}
                            activeOpacity={0.8}
                        >
                            <View className="h-32 bg-slate-700 relative">
                                <Image source={{ uri: template.image }} className="w-full h-full opacity-80" resizeMode="cover" />
                                <View className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                    <View className="w-12 h-12 rounded-full items-center justify-center bg-white/20 backdrop-blur-md">
                                        <Ionicons name={template.icon as any} size={24} color="#fff" />
                                    </View>
                                </View>
                            </View>

                            <View className="p-4">
                                <Text className="text-white font-bold text-lg mb-1">{template.title}</Text>
                                <Text className="text-slate-400 text-xs leading-4">{template.description}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="mt-8 bg-slate-900 p-6 rounded-2xl border border-slate-800 items-center">
                    <Ionicons name="images-outline" size={48} color="#334155" />
                    <Text className="text-slate-300 font-bold text-lg mt-4">Galeria salva</Text>
                    <Text className="text-slate-500 text-center mt-2 text-sm">
                        Suas artes geradas ficam salvas na galeria do dispositivo.
                    </Text>
                    <TouchableOpacity className="mt-4 px-6 py-2 bg-slate-800 rounded-full border border-slate-700">
                        <Text className="text-slate-300">Abrir Galeria</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

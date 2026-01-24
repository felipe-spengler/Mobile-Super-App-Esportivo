import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Platform } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '../../../src/services/api';

// Cores premium
const THEME = {
    faceoff: { bg: '#1e3a8a', accent: '#3b82f6' }, // Azul
    mvp: { bg: '#854d0e', accent: '#eab308' }, // Dourado
    top_scorer: { bg: '#14532d', accent: '#22c55e' }, // Verde
    best_goalkeeper: { bg: '#991b1b', accent: '#ef4444' }, // Vermelho
};

export default function ArtGeneratorScreen() {
    const router = useRouter();
    const { type, matchId, championshipId } = useLocalSearchParams();
    const viewShotRef = useRef(null);

    const [loading, setLoading] = useState(true);
    const [artData, setArtData] = useState<any>(null);
    const [permResponse, requestPermission] = MediaLibrary.usePermissions();

    useEffect(() => {
        fetchArtData();
    }, []);

    const fetchArtData = async () => {
        try {
            setLoading(true);
            let endpoint = '';

            // Define endpoint baseado no tipo
            if (type === 'faceoff') endpoint = `/art/match/${matchId || 1}/faceoff`;
            else if (type === 'mvp') endpoint = `/art/match/${matchId || 1}/mvp`;
            else if (type === 'top_scorer') endpoint = `/art/championship/${championshipId || 1}/top-scorer`;
            else if (type === 'best_goalkeeper') endpoint = `/art/championship/${championshipId || 1}/best-goalkeeper`;
            else endpoint = `/art/match/${matchId || 1}/faceoff`; // Fallback

            const res = await api.get(endpoint);
            setArtData(res.data.data);
        } catch (error) {
            console.error(error);
            Alert.alert('Erro', 'Falha ao carregar dados da arte.');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (viewShotRef.current) {
            try {
                const uri = await viewShotRef.current.capture();
                if (Platform.OS !== 'web') {
                    if (await Sharing.isAvailableAsync()) {
                        await Sharing.shareAsync(uri);
                    } else {
                        Alert.alert('Erro', 'Compartilhamento não disponível.');
                    }
                }
            } catch (error) {
                console.error(error);
                Alert.alert('Erro', 'Falha ao gerar imagem.');
            }
        }
    };

    if (loading) {
        return (
            <View className="flex-1 bg-slate-950 items-center justify-center">
                <ActivityIndicator size="large" color="#fbbf24" />
                <Text className="text-slate-400 mt-4">Criando arte...</Text>
            </View>
        );
    }

    if (!artData) return null;

    const currentTheme = THEME[type as keyof typeof THEME] || THEME.faceoff;

    // Lógica de renderização por TIPO
    const renderTemplate = () => {
        // --- TEMPLATE: CONFRONTO (FACEOFF) ---
        if (type === 'faceoff') {
            return (
                <View className="w-full aspect-[4/5] bg-slate-900 relative overflow-hidden items-center justify-between py-10">
                    {/* Background Image / Texture */}
                    <Image
                        source={{ uri: artData.bg_image || 'https://via.placeholder.com/800x1000/1e293b/1e293b' }}
                        className="absolute inset-0 opacity-30"
                        resizeMode="cover"
                    />

                    {/* Header */}
                    <View className="items-center z-10 w-full px-6">
                        <Text className="text-slate-300 font-bold uppercase tracking-[4px] text-xs mb-2">
                            {artData.championship_name}
                        </Text>
                        <View className="h-0.5 w-20 bg-blue-500 mb-6" />
                    </View>

                    {/* Times */}
                    <View className="flex-row items-center w-full justify-center px-4 z-10">
                        {/* Home */}
                        <View className="items-center w-1/3">
                            <Image source={{ uri: artData.home_team.logo }} className="w-24 h-24 mb-4" resizeMode="contain" />
                            <Text className="text-white font-bold text-center text-lg">{artData.home_team.name}</Text>
                        </View>

                        {/* VS */}
                        <View className="items-center justify-center w-1/6">
                            <Text className="text-blue-500 font-black text-4xl italic">X</Text>
                        </View>

                        {/* Away */}
                        <View className="items-center w-1/3">
                            <Image source={{ uri: artData.away_team.logo }} className="w-24 h-24 mb-4" resizeMode="contain" />
                            <Text className="text-white font-bold text-center text-lg">{artData.away_team.name}</Text>
                        </View>
                    </View>

                    {/* Footer Info */}
                    <View className="items-center z-10">
                        <View className="bg-blue-600 px-8 py-3 rounded-full mb-3">
                            <Text className="text-white font-bold text-2xl">{artData.time}</Text>
                        </View>
                        <Text className="text-slate-300 font-medium uppercase text-sm">
                            {artData.date} • {artData.location}
                        </Text>
                    </View>
                </View>
            );
        }

        // --- TEMPLATE: MVP (CRAQUE) ---
        if (type === 'mvp') {
            return (
                <View className="w-full aspect-[4/5] bg-slate-900 relative overflow-hidden shadow-2xl">

                    {/* 1. MÁSCARA DE FUNDO (Gradiente Dourado) */}
                    <LinearGradient
                        colors={['#854d0e', '#000000']}
                        className="absolute inset-0"
                    />

                    {/* 2. PLAYER PHOTO com TRATAMENTO "FADE" */}
                    <View className="absolute inset-0 top-[0%] h-[90%] w-full">
                        <Image
                            source={{ uri: artData.player_photo }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                        {/* Esse gradiente faz o player "fundir" com a parte de baixo, escondendo o corte da foto */}
                        <LinearGradient
                            colors={['transparent', 'transparent', 'rgba(0,0,0,0.8)', '#000000']}
                            locations={[0, 0.6, 0.85, 1]}
                            className="absolute inset-0"
                        />
                    </View>

                    {/* 3. CONTEÚDO (Texto sobreposto) */}
                    <View className="flex-1 justify-end pb-12 px-6 items-center z-10">
                        <View className="bg-yellow-500 px-6 py-2 rounded-sm mb-4 shadow-lg transform -skew-x-12 border-2 border-yellow-300">
                            <Text className="text-black font-black uppercase tracking-widest text-xs transform skew-x-12">★ CRAQUE DA PARTIDA ★</Text>
                        </View>

                        <Text className="text-white font-black text-6xl uppercase text-center leading-none mb-2 shadow-black drop-shadow-md">
                            {artData.player_name.split(' ')[0]}
                        </Text>
                        <Text className="text-yellow-500 font-bold text-xl uppercase tracking-[4px] mb-6">
                            {artData.home_team.name}
                        </Text>

                        {/* Stats Card */}
                        <View className="flex-row items-center gap-6 mt-2 bg-black/40 px-8 py-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <View className="items-center">
                                <Text className="text-yellow-400 font-bold text-3xl">{artData.stats.goals}</Text>
                                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Gols</Text>
                            </View>
                            <View className="w-px h-10 bg-white/20" />
                            <View className="items-center">
                                <Text className="text-white font-bold text-3xl">{artData.match_score}</Text>
                                <Text className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Placar</Text>
                            </View>
                        </View>
                    </View>
                </View>
            );
        }

        // --- TEMPLATE: ARTILHEIRO (TOP SCORER) ---
        if (type === 'top_scorer') {
            return (
                <View className="w-full aspect-[4/5] bg-green-900 relative overflow-hidden items-center justify-center">
                    <View className="absolute inset-0 bg-black/60 z-0" />
                    <View className="absolute w-[150%] h-[50%] bg-green-600 -rotate-12 top-[-10%] z-0 opacity-20" />

                    <View className="items-center z-10 w-full px-8">
                        <Text className="text-green-400 font-black tracking-[8px] text-lg mb-2">ARTILHEIRO</Text>
                        <Text className="text-white font-black text-6xl italic mb-6 shadow-lg">{artData.goals}</Text>
                        <Text className="text-white text-xl uppercase font-light mb-8">GOLS MARCADOS</Text>

                        <Image
                            source={{ uri: 'https://via.placeholder.com/300' }} // artData.player_photo
                            className="w-48 h-48 rounded-full border-4 border-green-500 mb-6 bg-slate-800"
                        />

                        <Text className="text-white font-bold text-3xl text-center">{artData.player_name}</Text>
                        <Text className="text-green-200 mt-2">{artData.matches} Partidas</Text>
                    </View>
                </View>
            );
        }

        // --- TEMPLATE: MELHOR GOLEIRO (BEST GOALKEEPER) ---
        if (type === 'best_goalkeeper') {
            return (
                <View className="w-full aspect-[4/5] bg-red-950 relative overflow-hidden shadow-2xl">

                    {/* 1. MÁSCARA DE FUNDO (Gradiente Vermelho) */}
                    <LinearGradient
                        colors={['#7f1d1d', '#000000']}
                        className="absolute inset-0"
                    />

                    {/* 2. PLAYER PHOTO com TRATAMENTO "FADE" */}
                    <View className="absolute inset-0 top-[0%] h-[90%] w-full">
                        <Image
                            source={{ uri: artData.player_photo || 'https://via.placeholder.com/300' }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                        <LinearGradient
                            colors={['transparent', 'transparent', 'rgba(0,0,0,0.8)', '#000000']}
                            locations={[0, 0.6, 0.85, 1]}
                            className="absolute inset-0"
                        />
                    </View>

                    {/* 3. CONTEÚDO */}
                    <View className="flex-1 justify-end pb-12 px-6 items-center z-10">
                        <View className="bg-red-600 px-8 py-2 rounded-sm mb-4 shadow-lg transform -skew-x-12 border-2 border-red-400">
                            <Text className="text-white font-black uppercase tracking-[6px] text-sm transform skew-x-12">★ PAREDÃO ★</Text>
                        </View>

                        <Text className="text-white font-black text-5xl uppercase text-center leading-none mb-2 shadow-black drop-shadow-md">
                            {artData.player_name || 'GOLEIRO'}
                        </Text>
                        <Text className="text-red-500 font-bold text-xl uppercase tracking-[4px] mb-8">
                            {artData.team_name || 'EQUIPE'}
                        </Text>

                        {/* Stats Card */}
                        <View className="flex-row items-center gap-6 mt-2 bg-black/40 px-8 py-4 rounded-2xl border border-white/10 backdrop-blur-sm">
                            <View className="items-center">
                                <Text className="text-red-400 font-bold text-3xl">{artData.clean_sheets || 0}</Text>
                                <Text className="text-slate-400 text-[9px] uppercase font-bold tracking-widest">Jogos s/ Gol</Text>
                            </View>
                            <View className="w-px h-10 bg-white/20" />
                            <View className="items-center">
                                <Text className="text-white font-bold text-3xl">{artData.saves || 0}</Text>
                                <Text className="text-slate-400 text-[9px] uppercase font-bold tracking-widest">Defesas</Text>
                            </View>
                        </View>
                    </View>
                </View>
            );
        }

        return <Text className="text-white mt-10 text-center">Template {type} em desenvolvimento...</Text>;
    };

    return (
        <View className="flex-1 bg-slate-950">
            <Stack.Screen options={{ title: 'Visualizar Arte', headerStyle: { backgroundColor: '#0f172a' }, headerTintColor: '#fff' }} />

            <ScrollView contentContainerStyle={{ padding: 20 }}>
                {/* ÁREA DE CAPTURA (VIEW SHOT) */}
                <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1.0 }} >
                    <View className="rounded-xl overflow-hidden shadow-2xl border border-slate-800">
                        {renderTemplate()}
                    </View>
                </ViewShot>

                <TouchableOpacity
                    className="bg-emerald-600 rounded-full py-4 mt-8 flex-row justify-center items-center shadow-lg active:bg-emerald-700"
                    onPress={handleSave}
                >
                    <Ionicons name="share-social" size={24} color="white" style={{ marginRight: 8 }} />
                    <Text className="text-white font-bold text-lg">Compartilhar Arte</Text>
                </TouchableOpacity>

                <Text className="text-slate-500 text-center mt-4 text-xs">
                    Imagem gerada em alta definição. Pronta para Instagram/WhatsApp.
                </Text>
            </ScrollView>
        </View>
    );
}

// Componente Mock para degradê (já que não posso instalar dependências agora)
const LinearGradientMock = ({ style, colors }: any) => (
    <View style={[{ backgroundColor: 'transparent' }, style]} />
);

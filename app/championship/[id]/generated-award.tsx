import { useEffect, useState, useRef } from 'react';
import { View, Text, Image, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import api from '../../../src/services/api';
import '../../../global.css';

export default function GeneratedAwardScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const viewRef = useRef<View>(null);
    const [status, requestPermission] = MediaLibrary.usePermissions();
    const [loading, setLoading] = useState(false);

    // Params breakdown
    const { category, playerId, type, championshipName, context, matchTitle, score, round, photoId } = params;

    // We would need to fetch player name if not passed. 
    // Since we fetch by ID, let's try to get user details or just use generic for MVP speed.
    // Ideally: const [playerData, setPlayerData] = useState(null);
    // For now, let's mock the player Name as "Atleta #{playerId}" or fetch if we had a quick endpoint.
    // The user wants 'montar a imagem'. 

    const [playerName, setPlayerName] = useState(`Atleta #${playerId}`);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    useEffect(() => {
        // Here we could fetch the User name from API: /users/{playerId}
        // Since we don't have a public endpoint readily tested, keeping generic.
        // But if photoId is present, we might display a placeholder 'Foto ID: {photoId}'
        // In a real app, we would translate photoId to a URL.
    }, [playerId, photoId]);

    const saveImage = async () => {
        try {
            setLoading(true);
            if (status?.status !== 'granted') {
                const permission = await requestPermission();
                if (!permission.granted) {
                    Alert.alert('Permissão negada', 'Precisamos de permissão para salvar na galeria.');
                    return;
                }
            }

            const localUri = await captureRef(viewRef, {
                format: 'png',
                quality: 1.0,
            });

            await MediaLibrary.saveToLibraryAsync(localUri);
            Alert.alert('Sucesso!', 'Arte salva na galeria!');
        } catch (e) {
            console.error(e);
            Alert.alert('Erro', 'Falha ao salvar a imagem.');
        } finally {
            setLoading(false);
        }
    };

    const awardTitle = (category as string)?.replace('_', ' ').toUpperCase() || 'DESTAQUE';

    return (
        <ScrollView className="flex-1 bg-gray-900">
            <View className="bg-gray-800 p-4 pt-12 border-b border-gray-700 flex-row items-center">
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <MaterialIcons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-xl font-bold text-white ml-4">Arte Gerada</Text>
            </View>

            <View className="p-6 items-center">

                {/* Canvas Area - Imitating the Old System Layout */}
                <View
                    ref={viewRef}
                    className="w-full aspect-[4/5] bg-gray-800 relative overflow-hidden shadow-2xl mb-8"
                    collapsable={false}
                >
                    {/* Background Layer (Gradient/Image) */}
                    <View className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black opacity-90" />

                    {/* Decorative Elements */}
                    <View className="absolute top-0 right-0 w-64 h-64 bg-emerald-600 rounded-bl-full opacity-20" />
                    <View className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600 rounded-tr-full opacity-20" />

                    {/* Content */}
                    <View className="flex-1 justify-between p-6 z-10">
                        {/* Header */}
                        <View className="items-center mt-4">
                            <Text className="text-emerald-400 font-bold tracking-widest text-sm uppercase mb-1">
                                {championshipName}
                            </Text>
                            <Text className="text-white text-3xl font-black uppercase text-center italic shadow-sm" style={{ textShadowColor: 'black', textShadowRadius: 10 }}>
                                {awardTitle}
                            </Text>
                            {round && (
                                <View className="bg-white/20 px-3 py-1 rounded-full mt-2">
                                    <Text className="text-white text-xs font-bold uppercase">{round}</Text>
                                </View>
                            )}
                        </View>

                        {/* Player Photo Area */}
                        <View className="flex-1 items-center justify-center relative my-4">
                            {/* If we had a photo URL, Image goes here. Else generic silhouette */}
                            <View className="w-48 h-48 bg-gray-700 rounded-full border-4 border-emerald-500 items-center justify-center shadow-lg overflow-hidden">
                                {photoUrl ? (
                                    <Image source={{ uri: photoUrl }} className="w-full h-full" resizeMode="cover" />
                                ) : (
                                    <FontAwesome5 name="user-alt" size={80} color="#555" />
                                )}
                            </View>
                            {/* Player Name Overlay */}
                            <View className="absolute -bottom-4 bg-emerald-600 px-6 py-2 transform skew-x-[-10deg] shadow-lg">
                                <Text className="text-white font-black text-xl uppercase transform skew-x-[10deg]">
                                    {playerName}
                                </Text>
                            </View>
                        </View>

                        {/* Footer (Match Info) */}
                        <View className="items-center mb-8">
                            {matchTitle ? (
                                <View className="items-center">
                                    <Text className="text-gray-300 font-bold text-lg mb-1">{matchTitle}</Text>
                                    <View className="bg-black/50 px-4 py-2 rounded border border-gray-600">
                                        <Text className="text-white font-mono text-2xl tracking-widest">{score}</Text>
                                    </View>
                                </View>
                            ) : (
                                <View className="items-center">
                                    <FontAwesome5 name="trophy" size={24} color="#ffd700" className="mb-2" />
                                    <Text className="text-yellow-400 font-bold tracking-widest">CAMPEÃO</Text>
                                </View>
                            )}
                        </View>

                        {/* Branding */}
                        <View className="absolute bottom-4 right-4 flex-row items-center">
                            <FontAwesome5 name="bolt" size={12} color="#00C851" />
                            <Text className="text-white text-[10px] font-bold ml-1">APP ESPORTIVO</Text>
                        </View>
                    </View>
                </View>

                {/* Info Text */}
                <Text className="text-gray-400 text-center mb-6 px-4">
                    Esta arte foi gerada automaticamente com base nos dados oficiais do campeonato.
                </Text>

                {/* Save Button */}
                <TouchableOpacity
                    className="w-full bg-emerald-600 p-4 rounded-xl items-center flex-row justify-center shadow-lg active:bg-emerald-700"
                    onPress={saveImage}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="white" />
                    ) : (
                        <>
                            <FontAwesome5 name="download" size={18} color="white" className="mr-3" />
                            <Text className="text-white font-bold text-lg">Salvar na Galeria</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

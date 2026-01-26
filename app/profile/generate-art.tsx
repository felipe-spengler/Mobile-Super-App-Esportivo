import { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { captureRef } from 'react-native-view-shot';
import * as MediaLibrary from 'expo-media-library';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/services/api';
import '../../global.css';

export default function GenerateArtScreen() {
    const router = useRouter();
    const { user } = useAuth();

    // States
    const [step, setStep] = useState<'select_event' | 'create_art'>('select_event');
    const [inscriptions, setInscriptions] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [loadingEvents, setLoadingEvents] = useState(true);

    const [image, setImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const viewRef = useRef<View>(null);

    // Permission hooks
    const [status, requestPermission] = MediaLibrary.usePermissions();

    useEffect(() => {
        loadInscriptions();
    }, []);

    async function loadInscriptions() {
        try {
            // Mock data for confirmed events as requested.
            // In a real scenario, this would come from an endpoint like /inscriptions/me
            setInscriptions([
                { id: 11, name: 'Copa Verão 2025', category: 'Livre', status: 'confirmed' },
                { id: 12, name: 'Torneio Inicio', category: 'Sub-20', status: 'confirmed' }
            ]);
        } catch (e) {
            console.log(e);
        } finally {
            setLoadingEvents(false);
        }
    }

    const selectEvent = (event: any) => {
        setSelectedEvent(event);
        setStep('create_art');
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 5],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const saveImage = async () => {
        if (!image) return;

        try {
            setLoading(true);

            // Check permissions
            if (status?.status !== 'granted') {
                const permission = await requestPermission();
                if (!permission.granted) {
                    Alert.alert('Permissão negada', 'Precisamos de permissão para salvar na galeria.');
                    return;
                }
            }

            // Capture view
            const localUri = await captureRef(viewRef, {
                format: 'png',
                quality: 1.0,
            });

            await MediaLibrary.saveToLibraryAsync(localUri);
            Alert.alert('Sucesso!', 'Arte salva na sua galeria.');
        } catch (e) {
            console.log(e);
            Alert.alert('Erro', 'Não foi possível salvar a imagem.');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'select_event') {
        return (
            <View className="flex-1 bg-gray-50 dark:bg-gray-900">
                <View className="bg-white dark:bg-gray-800 p-4 pt-12 border-b border-gray-100 flex-row items-center shadow-sm">
                    <TouchableOpacity onPress={() => router.back()} className="p-2">
                        <MaterialIcons name="arrow-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800 dark:text-gray-100 ml-4">Selecione o Evento</Text>
                </View>

                {loadingEvents ? (
                    <ActivityIndicator size="large" className="mt-10" color="#00C851" />
                ) : (
                    <FlatList
                        data={inscriptions}
                        keyExtractor={item => String(item.id)}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => selectEvent(item)}
                                className="bg-white dark:bg-gray-800 p-4 mx-4 mt-4 rounded-xl shadow-sm border-l-4 border-l-green-500 flex-row justify-between items-center"
                            >
                                <View>
                                    <Text className="font-bold text-lg text-gray-800 dark:text-white">{item.name}</Text>
                                    <Text className="text-gray-500 dark:text-gray-400">{item.category}</Text>
                                </View>
                                <FontAwesome5 name="chevron-right" size={16} color="#ccc" />
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View className="items-center justify-center mt-20 p-6">
                                <FontAwesome5 name="ghost" size={40} color="#ccc" />
                                <Text className="text-gray-400 text-center mt-4">Nenhuma inscrição confirmada encontrada para gerar arte.</Text>
                            </View>
                        }
                    />
                )}
            </View>
        );
    }

    return (
        <ScrollView className="flex-1 bg-gray-900">
            <View className="p-4 pt-12 flex-row items-center">
                <TouchableOpacity onPress={() => setStep('select_event')} className="mr-4">
                    <MaterialIcons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-xl font-bold">Gerar Arte Oficial</Text>
            </View>

            <View className="p-4 items-center">
                <Text className="text-gray-400 mb-6 text-center">
                    Crie seu card oficial de participante do evento {selectedEvent?.name}!
                </Text>

                {/* Canvas Area */}
                <View
                    ref={viewRef}
                    className="w-full aspect-[4/5] bg-white rounded-lg overflow-hidden relative shadow-2xl mb-8"
                    collapsable={false}
                >
                    {image ? (
                        <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <View className="w-full h-full bg-gray-800 items-center justify-center">
                            <FontAwesome5 name="camera" size={40} color="#555" />
                            <Text className="text-gray-500 mt-2">Selecione uma foto</Text>
                        </View>
                    )}

                    {/* Overlay Frame */}
                    <View className="absolute inset-0 border-[10px] border-emerald-600/80 justify-between p-4">
                        <View className="flex-row justify-between items-start">
                            <View className="bg-emerald-600 px-3 py-1 rounded">
                                <Text className="text-white font-bold text-xs uppercase">CONFIRMADO</Text>
                            </View>
                            <FontAwesome5 name="running" size={24} color="#fff" style={{ opacity: 0.8 }} />
                        </View>

                        <View>
                            <View className="flex-row items-end">
                                <Text className="text-white text-4xl font-extrabold italic shadow-sm" style={{ textShadowColor: 'black', textShadowRadius: 5 }}>
                                    EU VOU!
                                </Text>
                            </View>
                            <Text className="text-white text-lg font-medium shadow-sm" style={{ textShadowColor: 'black', textShadowRadius: 2 }}>
                                {user?.name || 'ATLETA OFICIAL'}
                            </Text>
                            <Text className="text-emerald-300 text-sm font-bold shadow-sm" style={{ textShadowColor: 'black', textShadowRadius: 1 }}>
                                {selectedEvent?.name}
                            </Text>
                            <View className="h-1 w-20 bg-emerald-500 mt-2" />
                        </View>
                    </View>

                    {/* Footer Badge within image */}
                    <View className="absolute bottom-4 right-4 bg-black/60 px-2 py-1 rounded">
                        <Text className="text-white text-[10px] font-bold">APP ESPORTIVO</Text>
                    </View>
                </View>

                {/* Controls */}
                <View className="w-full flex-row gap-4 px-4 pb-20">
                    <TouchableOpacity
                        className="flex-1 bg-gray-700 p-4 rounded-xl items-center flex-row justify-center"
                        onPress={pickImage}
                    >
                        <FontAwesome5 name="image" size={16} color="white" className="mr-2" />
                        <Text className="text-white font-bold">Escolher Foto</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        className={`flex-1 bg-emerald-600 p-4 rounded-xl items-center flex-row justify-center ${!image ? 'opacity-50' : ''}`}
                        onPress={saveImage}
                        disabled={!image || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <FontAwesome5 name="download" size={16} color="white" className="mr-2" />
                                <Text className="text-white font-bold">Salvar Arte</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

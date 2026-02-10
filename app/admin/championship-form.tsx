import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { api } from '../../src/services/api';
import '../../global.css';

interface Sport {
    id: number;
    name: string;
}

export default function ChampionshipFormScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const isEditing = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [sports, setSports] = useState<Sport[]>([]);

    const [formData, setFormData] = useState({
        name: '',
        sport_id: '',
        start_date: new Date(),
        end_date: new Date(),
        registration_start_date: new Date(),
        registration_end_date: new Date(),
        registration_type: 'team',
        description: '',
        format: 'league'
    });

    const [logo, setLogo] = useState<string | null>(null);
    const [banner, setBanner] = useState<string | null>(null);

    // Date Picker State
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'date'>('date');
    const [currentDateField, setCurrentDateField] = useState<keyof typeof formData | null>(null);

    useEffect(() => {
        loadInitialData();
    }, [id]);

    async function loadInitialData() {
        try {
            const sportsResponse = await api.get('/sports');
            setSports(sportsResponse.data);

            if (id) {
                const response = await api.get(`/championships/${id}`);
                const data = response.data;
                setFormData({
                    name: data.name,
                    sport_id: data.sport_id.toString(),
                    start_date: new Date(data.start_date),
                    end_date: new Date(data.end_date),
                    registration_start_date: data.registration_start_date ? new Date(data.registration_start_date) : new Date(),
                    registration_end_date: data.registration_end_date ? new Date(data.registration_end_date) : new Date(),
                    registration_type: data.registration_type || 'team',
                    description: data.description || '',
                    format: data.format || 'league'
                });
                setLogo(data.logo_url);
                setBanner(data.cover_image_url);
            } else if (sportsResponse.data.length > 0) {
                setFormData(prev => ({ ...prev, sport_id: sportsResponse.data[0].id.toString() }));
            }
        } catch (err) {
            console.error(err);
            Alert.alert('Erro', 'Erro ao carregar dados.');
            if (id) router.back();
        } finally {
            setFetching(false);
        }
    }

    const openDatePicker = (field: keyof typeof formData) => {
        setCurrentDateField(field);
        setShowPicker(true);
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowPicker(Platform.OS === 'ios');
        if (selectedDate && currentDateField) {
            setFormData(prev => ({ ...prev, [currentDateField]: selectedDate }));
        }
    };

    const pickImage = async (type: 'logo' | 'banner') => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: type === 'logo' ? [1, 1] : [16, 9],
            quality: 0.7,
        });

        if (!result.canceled) {
            if (type === 'logo') setLogo(result.assets[0].uri);
            else setBanner(result.assets[0].uri);

            // Upload immediately if editing? Or wait for save?
            // Web implementation uploads immediately. Let's stick to save-submit for simplicity or implement upload here.
            // For now, store URI and upload on save (simpler for single endpoint if API supports it, otherwise separate calls).
            // Web separates calls. We'll handle on Save for simplicity or add specific logic later.
        }
    };

    async function handleSubmit() {
        if (!formData.name) return Alert.alert('Erro', 'Nome é obrigatório');

        setLoading(true);
        try {
            const payload = {
                ...formData,
                start_date: formData.start_date.toISOString(),
                end_date: formData.end_date.toISOString(),
                registration_start_date: formData.registration_start_date.toISOString(),
                registration_end_date: formData.registration_end_date.toISOString(),
                sport_id: parseInt(formData.sport_id),
            };

            let response;
            if (isEditing) {
                await api.put(`/admin/championships/${id}`, payload);
                // Handle image uploads if changed (TODO)
                Alert.alert('Sucesso', 'Campeonato atualizado!');
            } else {
                response = await api.post('/admin/championships', payload);
                Alert.alert('Sucesso', 'Campeonato criado!');
                // If created, might need to upload images to new ID.
            }

            router.back();
        } catch (err: any) {
            console.error(err);
            Alert.alert('Erro', 'Falha ao salvar campeonato.');
        } finally {
            setLoading(false);
        }
    }

    if (fetching) return <View className="flex-1 justify-center items-center"><ActivityIndicator size="large" color="#4F46E5" /></View>;

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="flex-row items-center justify-between p-4 pt-12 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <MaterialIcons name="arrow-back" size={24} color="#374151" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-800 dark:text-white">{isEditing ? 'Editar Campeonato' : 'Novo Campeonato'}</Text>
                <TouchableOpacity onPress={handleSubmit} disabled={loading} className="bg-indigo-600 px-4 py-2 rounded-lg">
                    {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text className="text-white font-bold">Salvar</Text>}
                </TouchableOpacity>
            </View>

            <ScrollView className="p-4">
                {/* 1. Basic Info */}
                <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-700">
                    <Text className="font-bold text-gray-700 dark:text-gray-300 mb-3">1. Informações Básicas</Text>

                    <Text className="text-xs text-gray-500 mb-1">Nome do Campeonato</Text>
                    <TextInput
                        value={formData.name}
                        onChangeText={t => setFormData({ ...formData, name: t })}
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 mb-4 text-gray-800 dark:text-white"
                        placeholder="Ex: Copa 2026"
                        placeholderTextColor="#9CA3AF"
                    />

                    <Text className="text-xs text-gray-500 mb-1">Modalidade</Text>
                    <View className="flex-row flex-wrap gap-2 mb-4">
                        {sports.map(s => (
                            <TouchableOpacity
                                key={s.id}
                                onPress={() => setFormData({ ...formData, sport_id: s.id.toString() })}
                                className={`px-3 py-2 rounded-lg border ${formData.sport_id === s.id.toString() ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={formData.sport_id === s.id.toString() ? 'text-indigo-700 font-bold' : 'text-gray-600'}>{s.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="text-xs text-gray-500 mb-1">Descrição</Text>
                    <TextInput
                        value={formData.description}
                        onChangeText={t => setFormData({ ...formData, description: t })}
                        className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 h-24 text-gray-800 dark:text-white"
                        multiline
                        textAlignVertical="top"
                    />
                </View>

                {/* 2. Dates */}
                <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-700">
                    <Text className="font-bold text-gray-700 dark:text-gray-300 mb-3">2. Calendário</Text>
                    <View className="flex-row gap-4">
                        <TouchableOpacity onPress={() => openDatePicker('start_date')} className="flex-1">
                            <Text className="text-xs text-gray-500 mb-1">Início</Text>
                            <View className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 flex-row items-center justify-between">
                                <Text className="text-gray-800 dark:text-white">{formData.start_date.toLocaleDateString()}</Text>
                                <MaterialIcons name="calendar-today" size={16} color="#6B7280" />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => openDatePicker('end_date')} className="flex-1">
                            <Text className="text-xs text-gray-500 mb-1">Fim</Text>
                            <View className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 flex-row items-center justify-between">
                                <Text className="text-gray-800 dark:text-white">{formData.end_date.toLocaleDateString()}</Text>
                                <MaterialIcons name="calendar-today" size={16} color="#6B7280" />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 3. Registration */}
                <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-700">
                    <Text className="font-bold text-gray-700 dark:text-gray-300 mb-3">3. Inscrição</Text>
                    <View className="flex-row gap-4 mb-4">
                        <TouchableOpacity
                            onPress={() => setFormData({ ...formData, registration_type: 'team' })}
                            className={`flex-1 p-3 rounded-xl border ${formData.registration_type === 'team' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-200'}`}
                        >
                            <Text className={`font-bold text-center ${formData.registration_type === 'team' ? 'text-indigo-700' : 'text-gray-600'}`}>Por Equipe</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setFormData({ ...formData, registration_type: 'individual' })}
                            className={`flex-1 p-3 rounded-xl border ${formData.registration_type === 'individual' ? 'bg-indigo-50 border-indigo-500' : 'bg-gray-50 border-gray-200'}`}
                        >
                            <Text className={`font-bold text-center ${formData.registration_type === 'individual' ? 'text-indigo-700' : 'text-gray-600'}`}>Individual</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 4. Format */}
                <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-700">
                    <Text className="font-bold text-gray-700 dark:text-gray-300 mb-3">4. Formato</Text>
                    <View className="flex-row flex-wrap gap-2">
                        {['league', 'knockout', 'group_knockout'].map(fmt => (
                            <TouchableOpacity
                                key={fmt}
                                onPress={() => setFormData({ ...formData, format: fmt })}
                                className={`px-3 py-2 rounded-lg border ${formData.format === fmt ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-gray-200'}`}
                            >
                                <Text className={formData.format === fmt ? 'text-indigo-700 font-bold capitalize' : 'text-gray-600 capitalize'}>{fmt.replace('_', ' ')}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* 5. Images */}
                <View className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-8 border border-gray-100 dark:border-gray-700">
                    <Text className="font-bold text-gray-700 dark:text-gray-300 mb-3">5. Imagens</Text>
                    <View className="flex-row gap-4">
                        <TouchableOpacity onPress={() => pickImage('logo')} className="items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 overflow-hidden">
                            {logo ? <Image source={{ uri: logo }} className="w-full h-full" /> : <MaterialIcons name="add-photo-alternate" size={24} color="#9CA3AF" />}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => pickImage('banner')} className="flex-1 h-24 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 items-center justify-center overflow-hidden">
                            {banner ? <Image source={{ uri: banner }} className="w-full h-full" resizeMode="cover" /> : <MaterialIcons name="add-photo-alternate" size={24} color="#9CA3AF" />}
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>

            {showPicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={formData[currentDateField!] instanceof Date ? formData[currentDateField!] : new Date()}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}
        </View>
    );
}

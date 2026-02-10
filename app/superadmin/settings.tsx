import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { api } from '../../src/services/api';
import '../../global.css';

export default function SuperAdminSettings() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Mock settings
    const [settings, setSettings] = useState({
        maintenanceMode: false,
        allowNewRegistrations: true,
        debugMode: false,
        pushNotificationsGlobal: true
    });

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // await api.post('/superadmin/settings', settings);
            // Simulate API
            await new Promise(r => setTimeout(r, 1000));
            Alert.alert('Sucesso', 'Configurações atualizadas');
        } catch (error) {
            Alert.alert('Erro', 'Falha ao salvar');
        } finally {
            setLoading(false);
        }
    };

    const handleClearCache = () => {
        Alert.alert('Cache', 'Cache do sistema limpo com sucesso.');
    };

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="flex-row items-center justify-between p-4 pt-12 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                        <MaterialIcons name="arrow-back" size={24} color="#374151" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-800 dark:text-white ml-2">Configurações do Sistema</Text>
                </View>
            </View>

            <ScrollView className="p-4">
                <Text className="font-bold text-gray-500 uppercase text-xs mb-3 ml-1">Geral</Text>

                <View className="bg-white dark:bg-gray-800 rounded-xl mb-6 border border-gray-100 dark:border-gray-700">
                    <SettingItem
                        icon="tools"
                        label="Modo Manutenção"
                        description="Desabilita acesso para usuários comuns"
                        value={settings.maintenanceMode}
                        onToggle={() => toggleSetting('maintenanceMode')}
                    />
                    <View className="h-px bg-gray-100 dark:bg-gray-700 mx-4" />
                    <SettingItem
                        icon="user-plus"
                        label="Novos Cadastros"
                        description="Permitir novos usuários se registrarem"
                        value={settings.allowNewRegistrations}
                        onToggle={() => toggleSetting('allowNewRegistrations')}
                    />
                    <View className="h-px bg-gray-100 dark:bg-gray-700 mx-4" />
                    <SettingItem
                        icon="bell"
                        label="Notificações Push"
                        description="Habilitar envio global de pushes"
                        value={settings.pushNotificationsGlobal}
                        onToggle={() => toggleSetting('pushNotificationsGlobal')}
                    />
                </View>

                <Text className="font-bold text-gray-500 uppercase text-xs mb-3 ml-1">Desenvolvedor</Text>
                <View className="bg-white dark:bg-gray-800 rounded-xl mb-6 border border-gray-100 dark:border-gray-700">
                    <SettingItem
                        icon="bug"
                        label="Modo Debug"
                        description="Exibe logs detalhados no App"
                        value={settings.debugMode}
                        onToggle={() => toggleSetting('debugMode')}
                    />
                </View>

                <TouchableOpacity
                    onPress={handleClearCache}
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 border border-gray-100 dark:border-gray-700 flex-row items-center"
                >
                    <View className="w-10 h-10 bg-orange-100 rounded-full items-center justify-center mr-3">
                        <FontAwesome5 name="trash" size={16} color="#f97316" />
                    </View>
                    <View className="flex-1">
                        <Text className="font-bold text-gray-800 dark:text-white">Limpar Cache</Text>
                        <Text className="text-gray-500 text-xs">Forçar recarregamento de dados</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color="#ccc" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleSave}
                    disabled={loading}
                    className={`p-4 rounded-xl items-center justify-center mt-4 ${loading ? 'bg-indigo-400' : 'bg-indigo-600'}`}
                >
                    <Text className="text-white font-bold text-lg">{loading ? 'Salvando...' : 'Salvar Alterações'}</Text>
                </TouchableOpacity>

            </ScrollView>
        </View>
    );
}

const SettingItem = ({ icon, label, description, value, onToggle }: any) => (
    <View className="flex-row items-center p-4">
        <View className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full items-center justify-center mr-3">
            <FontAwesome5 name={icon} size={16} color="#4b5563" />
        </View>
        <View className="flex-1">
            <Text className="font-bold text-gray-800 dark:text-white">{label}</Text>
            <Text className="text-gray-500 text-xs">{description}</Text>
        </View>
        <Switch
            value={value}
            onValueChange={onToggle}
            trackColor={{ false: "#767577", true: "#818cf8" }}
            thumbColor={value ? "#4f46e5" : "#f4f3f4"}
        />
    </View>
);

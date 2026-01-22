
import { View, Text, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useTheme } from '../src/context/ThemeContext';
import { registerForPushNotificationsAsync, syncPushToken } from '../src/services/notification';
import '../global.css';

export default function SettingsScreen() {
    const router = useRouter();
    const { colorScheme, toggleTheme } = useTheme();

    // Estados visuais
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [loadingNotify, setLoadingNotify] = useState(false);

    const isDark = colorScheme === 'dark';

    async function handleNotificationToggle(value: boolean) {
        setLoadingNotify(true);
        try {
            if (value) {
                const token = await registerForPushNotificationsAsync();
                if (token) {
                    await syncPushToken(token);
                    setNotificationsEnabled(true);
                    Alert.alert('Sucesso', 'Notificações ativadas!');
                } else {
                    Alert.alert('Erro', 'Não foi possível obter permissão para notificações.');
                    setNotificationsEnabled(false);
                }
            } else {
                setNotificationsEnabled(false);
                // Opcional: Chamar API para remover token se desejar
            }
        } catch (error) {
            console.log(error);
            Alert.alert('Erro', 'Falha ao ativar notificações');
        } finally {
            setLoadingNotify(false);
        }
    }

    return (
        <View className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <View className={`p-4 pt-12 shadow-sm flex-row items-center mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <TouchableOpacity onPress={() => router.back()} className="p-2">
                    <FontAwesome5 name="arrow-left" size={20} color={isDark ? '#FFF' : '#333'} />
                </TouchableOpacity>
                <Text className={`text-xl font-bold ml-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Configurações</Text>
            </View>

            <View className={`mx-4 rounded-xl overflow-hidden shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                {/* Notificações */}
                <View className={`flex-row items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <View className="flex-row items-center">
                        <View className="w-8 items-center">
                            <FontAwesome5 name="bell" size={18} color={isDark ? '#ccc' : '#666'} />
                        </View>
                        <Text className={`ml-3 font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Notificações</Text>
                    </View>
                    {loadingNotify ? (
                        <ActivityIndicator size="small" color="#10B981" />
                    ) : (
                        <Switch
                            value={notificationsEnabled}
                            onValueChange={handleNotificationToggle}
                            trackColor={{ false: "#767577", true: "#10B981" }}
                            thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
                        />
                    )}
                </View>

                {/* Dark Mode */}
                <View className={`flex-row items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <View className="flex-row items-center">
                        <View className="w-8 items-center">
                            <FontAwesome5 name="moon" size={18} color={isDark ? '#ccc' : '#666'} />
                        </View>
                        <Text className={`ml-3 font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Modo Escuro</Text>
                    </View>
                    <Switch
                        value={isDark}
                        onValueChange={toggleTheme}
                        trackColor={{ false: "#767577", true: "#10B981" }}
                        thumbColor={isDark ? "#fff" : "#f4f3f4"}
                    />
                </View>

                {/* Change Password */}
                <TouchableOpacity className="flex-row items-center justify-between p-4">
                    <View className="flex-row items-center">
                        <View className="w-8 items-center">
                            <FontAwesome5 name="lock" size={18} color={isDark ? '#ccc' : '#666'} />
                        </View>
                        <Text className={`ml-3 font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Alterar Senha</Text>
                    </View>
                    <FontAwesome5 name="chevron-right" size={14} color={isDark ? '#555' : '#ccc'} />
                </TouchableOpacity>
            </View>

            <Text className="text-center text-gray-400 text-xs mt-8">Versão 1.0.0</Text>
        </View>
    );
}

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { FontAwesome } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import '../global.css';

export default function LoginScreen() {
    const router = useRouter();
    const { signIn } = useAuth();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [login, setLogin] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    async function handleLogin() {
        setErrorMessage('');

        if (!login || !password) {
            setErrorMessage('Preencha seu login e senha.');
            return;
        }

        setIsSubmitting(true);
        try {
            await signIn(login, password);
            // Sucesso -> Redirecionar para área logada
            router.replace('/(tabs)');
        } catch (error: any) {
            // O Context já dá um Alert, mas aqui mostramos visual também
            const msg = error.response?.data?.message || 'Falha no login. Verifique suas credenciais.';
            setErrorMessage(msg);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900 justify-center px-6 relative">

            {/* Botão Voltar */}
            <TouchableOpacity
                className="absolute top-12 left-6 z-10 w-10 h-10 items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-full"
                onPress={() => {
                    if (router.canGoBack()) {
                        router.back();
                    } else {
                        router.replace('/(tabs)');
                    }
                }}
            >
                <FontAwesome name="arrow-left" size={18} color={isDark ? '#FFF' : '#333'} />
            </TouchableOpacity>

            {/* Header / Logo */}
            <View className="items-center mb-10">
                <View className="w-20 h-20 bg-indigo-600 rounded-full items-center justify-center mb-4 shadow-lg shadow-indigo-600/30">
                    <FontAwesome name="soccer-ball-o" size={40} color="white" />
                </View>
                <Text className="text-gray-900 dark:text-white text-3xl font-bold">App Esportivo</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-base mt-1">Sua vida esportiva em um só lugar</Text>
            </View>

            {/* Formulário */}
            <View className="space-y-4">
                <View>
                    <Text className="text-gray-700 dark:text-gray-300 mb-2 ml-1 font-medium">E-mail ou Telefone</Text>
                    <TextInput
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-500"
                        placeholder="E-mail ou Telefone"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={login}
                        onChangeText={setLogin}
                    />
                </View>

                <View className="mt-4">
                    <View className="flex-row justify-between items-center mb-2 ml-1">
                        <Text className="text-gray-700 dark:text-gray-300 font-medium">Senha</Text>
                        <TouchableOpacity onPress={() => router.push('/forgot-password')}>
                            <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-bold">Esqueceu?</Text>
                        </TouchableOpacity>
                    </View>
                    <TextInput
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-indigo-500 dark:focus:border-indigo-500"
                        placeholder="********"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                {/* Mensagem de Erro Visual */}
                {errorMessage ? (
                    <View className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-500/50 mt-2">
                        <Text className="text-red-600 dark:text-red-200 text-center text-sm font-medium">
                            {errorMessage}
                        </Text>
                    </View>
                ) : null}

                <TouchableOpacity
                    className={`bg-indigo-600 dark:bg-indigo-500 p-4 rounded-xl items-center mt-6 shadow-md shadow-indigo-500/20 ${isSubmitting ? 'opacity-50' : ''}`}
                    onPress={handleLogin}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Entrar</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity className="mt-4 items-center" onPress={() => router.push('/register')}>
                    <Text className="text-gray-600 dark:text-gray-400">Não tem conta? <Text className="text-indigo-600 dark:text-indigo-400 font-bold">Cadastre-se</Text></Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { api } from '../src/services/api';
import { FontAwesome5 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import '../global.css';

export default function RegisterScreen() {
    const router = useRouter();
    const { signIn } = useAuth();

    const [step, setStep] = useState<'scan' | 'photo' | 'form'>('scan');
    const [loadingOCR, setLoadingOCR] = useState(false);

    // Form Data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [cpf, setCpf] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [gender, setGender] = useState<'M' | 'F' | ''>('');
    const [rg, setRg] = useState('');
    const [motherName, setMotherName] = useState('');
    const [documentNumber, setDocumentNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Images
    const [docImage, setDocImage] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    async function pickImage(type: 'doc' | 'profile') {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
            aspect: type === 'profile' ? [1, 1] : undefined,
        });

        if (!result.canceled) {
            if (type === 'doc') {
                analyzeDocument(result.assets[0].uri);
            } else {
                setProfileImage(result.assets[0].uri);
            }
        }
    }

    async function takePhoto(type: 'doc' | 'profile') {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (permission.granted === false) {
            Alert.alert("Permissão necessária", "Precisamos de acesso à câmera.");
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
            aspect: type === 'profile' ? [1, 1] : undefined,
        });

        if (!result.canceled) {
            if (type === 'doc') {
                analyzeDocument(result.assets[0].uri);
            } else {
                setProfileImage(result.assets[0].uri);
            }
        }
    }

    async function analyzeDocument(uri: string) {
        setDocImage(uri);
        setLoadingOCR(true);

        const formData = new FormData();
        // @ts-ignore
        formData.append('document', {
            uri,
            name: 'doc.jpg',
            type: 'image/jpeg'
        });

        try {
            const response = await api.post('/ocr/analyze', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });

            const data = response.data.data;
            if (data) {
                if (data.name) setName(data.name);
                if (data.cpf) setCpf(data.cpf);
                if (data.birth_date) setBirthDate(data.birth_date);
                if (data.gender) setGender(data.gender);
                if (data.rg) setRg(data.rg);
                if (data.mother_name) setMotherName(data.mother_name);
                if (data.document_number) setDocumentNumber(data.document_number);

                Alert.alert('Sucesso', 'Dados extraídos com sucesso! Agora escolha sua foto de perfil.');
            } else {
                Alert.alert('Atenção', 'Não conseguimos ler todos os dados. Prossiga para a validação manual.');
            }
            setStep('photo');

        } catch (error) {
            console.log(error);
            Alert.alert('Erro no OCR', 'Falha ao analisar documento. Preencha manualmente.');
            setStep('photo');
        } finally {
            setLoadingOCR(false);
        }
    }

    async function handleRegister() {
        if (!name || !email || !password || !confirmPassword || !cpf || !birthDate || !gender) {
            Alert.alert('Atenção', 'Preencha todos os campos obrigatórios (incluindo Gênero).');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('password', password);
            formData.append('password_confirmation', confirmPassword);
            formData.append('phone', phone);
            formData.append('cpf', cpf);
            formData.append('birth_date', birthDate);

            formData.append('document', {
                uri: docImage,
                name: 'document.jpg',
                type: 'image/jpeg'
            } as any);
            formData.append('gender', gender);
            if (rg) formData.append('rg', rg);
            if (motherName) formData.append('mother_name', motherName);
            if (documentNumber) formData.append('document_number', documentNumber);

            if (profileImage) {
                // @ts-ignore
                formData.append('photo', {
                    uri: profileImage,
                    name: 'profile.jpg',
                    type: 'image/jpeg'
                });
            }

            await api.post('/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            await signIn(email, password);
            router.replace('/(tabs)');

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Não foi possível criar a conta.';
            Alert.alert('Erro no Cadastro', msg);
        } finally {
            setIsSubmitting(false);
        }
    }

    if (step === 'scan') {
        return (
            <View className="flex-1 bg-gray-50 dark:bg-gray-900 px-6 justify-center items-center">
                <FontAwesome5 name="id-card" size={60} color="#3B82F6" className="mb-6" />
                <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Passo 1: Validação</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center mb-8">
                    Para garantir a segurança e categorias corretas nos campeonatos, precisamos escanear seu RG ou CNH.
                </Text>

                {loadingOCR ? (
                    <View className="items-center">
                        <ActivityIndicator size="large" color="#3B82F6" />
                        <Text className="text-gray-600 dark:text-gray-300 mt-4">Analisando documento com IA...</Text>
                    </View>
                ) : (
                    <View className="w-full gap-4">
                        <TouchableOpacity className="bg-blue-600 p-4 rounded-xl flex-row justify-center items-center" onPress={() => takePhoto('doc')}>
                            <FontAwesome5 name="camera" size={20} color="white" className="mr-3" />
                            <Text className="text-white font-bold text-lg">Tirar Foto do Documento</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="bg-gray-200 dark:bg-gray-700 p-4 rounded-xl flex-row justify-center items-center" onPress={() => pickImage('doc')}>
                            <FontAwesome5 name="image" size={20} color="#666" className="mr-3" />
                            <Text className="text-gray-800 dark:text-white font-bold text-lg">Escolher Documento da Galeria</Text>
                        </TouchableOpacity>

                        <TouchableOpacity className="mt-4 p-2" onPress={() => setStep('photo')}>
                            <Text className="text-gray-400 text-center text-sm">Pular validação</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        );
    }

    if (step === 'photo') {
        return (
            <View className="flex-1 bg-gray-50 dark:bg-gray-900 px-6 justify-center items-center">
                <View className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-800 mb-6 overflow-hidden items-center justify-center border-4 border-white dark:border-gray-700 shadow-xl">
                    {profileImage ? (
                        <Image source={{ uri: profileImage }} className="w-full h-full" />
                    ) : (
                        <FontAwesome5 name="user" size={50} color="#9CA3AF" />
                    )}
                </View>

                <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Passo 2: Sua Foto</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-center mb-8">
                    Escolha uma foto de perfil. Ela será usada em suas estatísticas, crachás e certificados.
                </Text>

                <View className="w-full gap-4">
                    <TouchableOpacity className="bg-blue-600 p-4 rounded-xl flex-row justify-center items-center" onPress={() => takePhoto('profile')}>
                        <FontAwesome5 name="camera" size={20} color="white" className="mr-3" />
                        <Text className="text-white font-bold text-lg">Tirar Selfie</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="bg-gray-200 dark:bg-gray-700 p-4 rounded-xl flex-row justify-center items-center" onPress={() => pickImage('profile')}>
                        <FontAwesome5 name="image" size={20} color="#666" className="mr-3" />
                        <Text className="text-gray-800 dark:text-white font-bold text-lg">Escolher da Galeria</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className={`mt-4 p-4 rounded-xl border border-blue-600 ${!profileImage ? 'opacity-50' : 'bg-blue-50'}`}
                        onPress={() => setStep('form')}
                    >
                        <Text className="text-blue-600 font-bold text-center text-lg">{profileImage ? 'Continuar' : 'Pular foto por enquanto'}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-gray-50 dark:bg-gray-900 px-6 py-10">
            <View className="items-center mb-8">
                <Text className="text-gray-900 dark:text-white text-2xl font-bold">Passo 3: Finalizar</Text>
                <Text className="text-gray-500 dark:text-gray-400 text-sm">Confirme seus dados pessoais</Text>
            </View>

            <View className="space-y-4">
                <View>
                    <Text className="text-gray-700 dark:text-gray-300 mb-2 ml-1 font-medium">Nome Completo</Text>
                    <TextInput
                        className="bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
                        value={name}
                        onChangeText={setName}
                        editable={!docImage}
                    />
                </View>

                <View className="mt-2">
                    <Text className="text-gray-700 dark:text-gray-300 mb-2 ml-1 font-medium">CPF (Somente Números)</Text>
                    <TextInput
                        className="bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
                        value={cpf}
                        onChangeText={setCpf}
                        editable={false}
                    />
                    {!docImage && <Text className="text-xs text-yellow-600 mt-1">Preenchimento manual sujeito a auditoria.</Text>}
                </View>

                <View className="mt-2">
                    <Text className="text-gray-700 dark:text-gray-300 mb-2 ml-1 font-medium">Data de Nascimento (AAAA-MM-DD)</Text>
                    <TextInput
                        className="bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
                        placeholder="YYYY-MM-DD"
                        placeholderTextColor="#999"
                        value={birthDate}
                        onChangeText={setBirthDate}
                        editable={!docImage}
                    />
                </View>

                <View className="mt-2">
                    <Text className="text-gray-700 dark:text-gray-300 mb-2 ml-1 font-medium">Gênero (Para Categorias)</Text>
                    <View className="flex-row gap-4">
                        <TouchableOpacity
                            className={`flex-1 p-4 rounded-xl border ${gender === 'M' ? 'bg-blue-600 border-blue-600' : 'bg-gray-200 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                            onPress={() => setGender('M')}
                        >
                            <Text className={`text-center font-bold ${gender === 'M' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>Masculino</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className={`flex-1 p-4 rounded-xl border ${gender === 'F' ? 'bg-pink-600 border-pink-600' : 'bg-gray-200 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                            onPress={() => setGender('F')}
                        >
                            <Text className={`text-center font-bold ${gender === 'F' ? 'text-white' : 'text-gray-600 dark:text-gray-400'}`}>Feminino</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View className="mt-2">
                    <Text className="text-gray-700 dark:text-gray-300 mb-2 ml-1 font-medium">E-mail</Text>
                    <TextInput
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500"
                        placeholder="seu@email.com"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View className="mt-2">
                    <Text className="text-gray-700 dark:text-gray-300 mb-2 ml-1 font-medium">Telefone / WhatsApp</Text>
                    <TextInput
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500"
                        placeholder="(00) 00000-0000"
                        placeholderTextColor="#9CA3AF"
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={setPhone}
                    />
                </View>

                <View className="mt-2">
                    <Text className="text-gray-700 dark:text-gray-300 mb-2 ml-1 font-medium">Senha</Text>
                    <TextInput
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500"
                        placeholder="Mínimo 6 caracteres"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                </View>

                <View className="mt-2">
                    <Text className="text-gray-700 dark:text-gray-300 mb-2 ml-1 font-medium">Confirmar Senha</Text>
                    <TextInput
                        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-4 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-blue-500"
                        placeholder="Repita a senha"
                        placeholderTextColor="#9CA3AF"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                </View>

                <TouchableOpacity
                    className={`bg-blue-600 p-4 rounded-xl items-center mt-6 ${isSubmitting ? 'opacity-50' : ''}`}
                    onPress={handleRegister}
                    disabled={isSubmitting}
                >
                    {isSubmitting ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text className="text-white font-bold text-lg">Cadastrar</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity className="mt-4 items-center mb-6" onPress={() => router.back()}>
                    <Text className="text-gray-600 dark:text-gray-400">Já tem uma conta? <Text className="text-blue-600 dark:text-blue-400 font-bold">Faça Login</Text></Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

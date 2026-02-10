import { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Alert, ActivityIndicator, TextInput, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { api } from '../../src/services/api';
import { useAuth } from '../../src/context/AuthContext';
import '../../global.css';

// Interfaces
interface Category {
    id: number;
    name: string;
    description?: string;
    price: string;
    gender: string;
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    type: 'good' | 'service' | 'donation' | 'kit';
    variants: any;
}

interface InscriptionStepProps {
    onNext: () => void;
    onPrev: () => void;
    data: any;
    updateData: (key: string, value: any) => void;
    championship?: any;
}

// --------------------------------------------------------------------------
// STEP 1: DADOS PESSOAIS
// --------------------------------------------------------------------------
function StepPersonal({ onNext, data }: InscriptionStepProps) {
    const { user } = useAuth();
    if (!user) return <View className="p-6"><Text className="text-red-500 text-center">Login necessário.</Text></View>;

    return (
        <ScrollView className="p-6">
            <Text className="text-2xl font-bold text-indigo-900 mb-6">Confirme seus dados</Text>
            <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                <Text className="text-sm text-gray-500 mb-1">Nome Completo</Text>
                <Text className="text-lg font-bold text-gray-800">{user.name}</Text>
            </View>
            <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                <Text className="text-sm text-gray-500 mb-1">E-mail</Text>
                <Text className="text-lg font-bold text-gray-800">{user.email}</Text>
            </View>
            <TouchableOpacity onPress={onNext} className="bg-indigo-600 p-4 rounded-xl items-center shadow-lg mt-4">
                <Text className="text-white font-bold text-lg">Confirmar e Continuar</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

// --------------------------------------------------------------------------
// STEP 2: CATEGORIA
// --------------------------------------------------------------------------
function StepCategory({ onNext, onPrev, data, updateData }: InscriptionStepProps) {
    const { eventId } = useLocalSearchParams();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchCategories() {
            try {
                const response = await api.get(`/championships/${eventId}`);
                if (response.data?.categories) setCategories(response.data.categories);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        if (eventId) fetchCategories();
    }, [eventId]);

    if (loading) return <ActivityIndicator color="#4F46E5" size="large" className="mt-10" />;

    return (
        <ScrollView className="p-6">
            <Text className="text-2xl font-bold text-indigo-900 mb-2">Escolha sua Categoria</Text>
            <Text className="text-gray-500 mb-6">Selecione a modalidade.</Text>
            {categories.map(cat => (
                <TouchableOpacity
                    key={cat.id}
                    onPress={() => updateData('category', cat)}
                    className={`p-4 rounded-xl border-2 mb-4 ${data.category?.id === cat.id ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 bg-white'}`}
                >
                    <View className="flex-row justify-between items-center">
                        <View>
                            <Text className={`font-bold text-lg ${data.category?.id === cat.id ? 'text-indigo-900' : 'text-gray-800'}`}>{cat.name}</Text>
                            <Text className="text-gray-500 text-sm mt-1">{cat.description || cat.gender}</Text>
                        </View>
                        <Text className="font-bold text-xl text-indigo-600">R$ {parseFloat(cat.price || '0').toFixed(2).replace('.', ',')}</Text>
                    </View>
                </TouchableOpacity>
            ))}
            <View className="flex-row gap-4 mt-8">
                <TouchableOpacity onPress={onPrev} className="flex-1 bg-gray-200 p-4 rounded-xl items-center"><Text className="text-gray-700 font-bold">Voltar</Text></TouchableOpacity>
                <TouchableOpacity onPress={onNext} disabled={!data.category} className={`flex-1 p-4 rounded-xl items-center ${data.category ? 'bg-indigo-600 shadow-lg' : 'bg-gray-300'}`}>
                    <Text className="text-white font-bold">Próximo</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// --------------------------------------------------------------------------
// STEP 3: DADOS DA EQUIPE (Opcional - Condicional)
// --------------------------------------------------------------------------
function StepTeam({ onNext, onPrev, data, updateData, championship }: InscriptionStepProps) {
    const [teamName, setTeamName] = useState(data.teamName || '');
    const [logo, setLogo] = useState(data.teamLogo || null);

    const isTeam = championship?.registration_type === 'team' || data.category?.is_team; // Logic depends on data structure

    // Skip if not team
    if (!isTeam) {
        // Auto-skip logic would be better in parent, but here we can just render "Next" immediately or a "Prossiga" message
        // For simplicity, let's just show a specific "Individual" screen or auto-skip.
        // Let's rely on User to click "Next" confirming individual type
        return (
            <ScrollView className="p-6">
                <Text className="text-2xl font-bold text-indigo-900 mb-4">Inscrição Individual</Text>
                <View className="bg-yellow-50 p-4 rounded-xl border-l-4 border-yellow-500 mb-6">
                    <Text className="text-yellow-800">Você está se inscrevendo como atleta individual.</Text>
                </View>
                <View className="flex-row gap-4">
                    <TouchableOpacity onPress={onPrev} className="flex-1 bg-gray-200 p-4 rounded-xl items-center"><Text className="text-gray-700 font-bold">Voltar</Text></TouchableOpacity>
                    <TouchableOpacity onPress={onNext} className="flex-1 bg-indigo-600 p-4 rounded-xl items-center"><Text className="text-white font-bold">Continuar</Text></TouchableOpacity>
                </View>
            </ScrollView>
        );
    }

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });
        if (!result.canceled) {
            setLogo(result.assets[0].uri);
            updateData('teamLogo', result.assets[0].uri);
        }
    };

    return (
        <ScrollView className="p-6">
            <Text className="text-2xl font-bold text-indigo-900 mb-2">Dados da Equipe</Text>
            <Text className="text-gray-500 mb-6">Você será o capitão desta equipe.</Text>

            <View className="mb-4">
                <Text className="text-sm font-bold text-gray-700 mb-1">Nome do Time</Text>
                <TextInput
                    value={teamName}
                    onChangeText={(t) => { setTeamName(t); updateData('teamName', t); }}
                    className="bg-white border border-gray-200 rounded-xl p-4 text-lg"
                    placeholder="Ex: Galáticos FC"
                />
            </View>

            <TouchableOpacity onPress={pickImage} className="items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-xl p-6 mb-6">
                {logo ? (
                    <Image source={{ uri: logo }} className="w-24 h-24 rounded-full" />
                ) : (
                    <>
                        <FontAwesome5 name="camera" size={32} color="#9CA3AF" />
                        <Text className="text-gray-400 mt-2">Adicionar Escudo</Text>
                    </>
                )}
            </TouchableOpacity>

            <View className="flex-row gap-4 mt-4">
                <TouchableOpacity onPress={onPrev} className="flex-1 bg-gray-200 p-4 rounded-xl items-center"><Text className="text-gray-700 font-bold">Voltar</Text></TouchableOpacity>
                <TouchableOpacity onPress={onNext} disabled={!teamName} className={`flex-1 p-4 rounded-xl items-center ${teamName ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                    <Text className="text-white font-bold">Próximo</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// --------------------------------------------------------------------------
// STEP 4: PRODUTOS E VARIANTES
// --------------------------------------------------------------------------
function StepProducts({ onNext, onPrev, data, updateData }: InscriptionStepProps) {
    const [categoryProducts, setCategoryProducts] = useState<any[]>([]);
    const [productVariants, setProductVariants] = useState<Record<number, Record<string, string>>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCategoryProducts();
    }, [data.category]);

    async function loadCategoryProducts() {
        if (!data.category?.included_products || data.category.included_products.length === 0) {
            setLoading(false);
            return;
        }

        try {
            // Buscar detalhes dos produtos
            const productIds = data.category.included_products.map((p: any) => p.product_id);
            const response = await api.get('/public/products');
            const allProducts = response.data;

            const includedProducts = data.category.included_products.map((item: any) => {
                const product = allProducts.find((p: any) => p.id === item.product_id);
                return {
                    ...product,
                    quantity: item.quantity,
                    required: item.required,
                };
            });

            setCategoryProducts(includedProducts);
        } catch (error) {
            console.error('Erro ao carregar produtos:', error);
        } finally {
            setLoading(false);
        }
    }

    function setProductVariant(productId: number, variantName: string, value: string) {
        setProductVariants(prev => ({
            ...prev,
            [productId]: {
                ...(prev[productId] || {}),
                [variantName]: value,
            },
        }));
    }

    function canProceed() {
        // Verificar se todos os produtos obrigatórios têm variantes selecionadas
        return categoryProducts.every(product => {
            if (!product.required) return true;
            if (!product.variants || product.variants.length === 0) return true;

            const selected = productVariants[product.id] || {};
            return product.variants.every((v: any) => selected[v.name]);
        });
    }

    function handleNext() {
        updateData('product_variants', productVariants);
        onNext();
    }

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#4F46E5" />
            </View>
        );
    }

    if (categoryProducts.length === 0) {
        return (
            <ScrollView className="p-6">
                <Text className="text-2xl font-bold text-indigo-900 mb-4">Kits e Extras</Text>
                <View className="bg-white p-6 rounded-xl border border-gray-100 mb-6 items-center">
                    <FontAwesome5 name="store-slash" size={40} color="#CBD5E1" />
                    <Text className="text-gray-500 mt-4 text-center">Nenhum produto adicional disponível para este evento.</Text>
                </View>
                <View className="flex-row gap-4">
                    <TouchableOpacity onPress={onPrev} className="flex-1 bg-gray-200 p-4 rounded-xl items-center"><Text className="text-gray-700 font-bold">Voltar</Text></TouchableOpacity>
                    <TouchableOpacity onPress={onNext} className="flex-1 bg-indigo-600 p-4 rounded-xl items-center"><Text className="text-white font-bold">Resumo</Text></TouchableOpacity>
                </View>
            </ScrollView>
        );
    }

    return (
        <ScrollView className="p-6">
            <Text className="text-2xl font-bold text-indigo-900 mb-2">Produtos Inclusos</Text>
            <Text className="text-gray-500 mb-6">Selecione as opções dos produtos que você receberá.</Text>

            {categoryProducts.map(product => (
                <View key={product.id} className="bg-indigo-50 border-2 border-indigo-200 rounded-xl p-4 mb-4">
                    <View className="flex-row items-center justify-between mb-3">
                        <View className="flex-1">
                            <Text className="font-bold text-indigo-900 text-lg">{product.name}</Text>
                            {product.description && (
                                <Text className="text-gray-600 text-sm mt-1">{product.description}</Text>
                            )}
                        </View>
                        {product.required && (
                            <View className="bg-red-100 px-2 py-1 rounded">
                                <Text className="text-red-700 text-xs font-bold">OBRIGATÓRIO</Text>
                            </View>
                        )}
                    </View>

                    {product.variants && product.variants.length > 0 && (
                        <View className="space-y-3">
                            {product.variants.map((variant: any) => (
                                <View key={variant.name}>
                                    <Text className="text-sm font-bold text-gray-700 mb-2">{variant.name}:</Text>
                                    <View className="flex-row flex-wrap gap-2">
                                        {variant.options.map((option: string) => {
                                            const isSelected = productVariants[product.id]?.[variant.name] === option;
                                            return (
                                                <TouchableOpacity
                                                    key={option}
                                                    onPress={() => setProductVariant(product.id, variant.name, option)}
                                                    className={`px-4 py-2 rounded-lg border-2 ${isSelected
                                                            ? 'bg-indigo-600 border-indigo-600'
                                                            : 'bg-white border-gray-300'
                                                        }`}
                                                >
                                                    <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-gray-700'}`}>
                                                        {option}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}

                    <View className="mt-3 pt-3 border-t border-indigo-200">
                        <Text className="text-xs text-gray-600">
                            Quantidade: {product.quantity}x
                        </Text>
                    </View>
                </View>
            ))}

            <View className="flex-row gap-4 mt-6">
                <TouchableOpacity onPress={onPrev} className="flex-1 bg-gray-200 p-4 rounded-xl items-center">
                    <Text className="text-gray-700 font-bold">Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={handleNext}
                    disabled={!canProceed()}
                    className={`flex-1 p-4 rounded-xl items-center ${canProceed() ? 'bg-indigo-600' : 'bg-gray-300'}`}
                >
                    <Text className="text-white font-bold">Resumo</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// --------------------------------------------------------------------------
// STEP 5: RESUMO
// --------------------------------------------------------------------------
function StepSummary({ onPrev, data }: InscriptionStepProps) {
    const router = useRouter();
    const [coupon, setCoupon] = useState('');
    const catPrice = parseFloat(data.category?.price || '0');
    const total = catPrice; // + extras

    async function handlePayment() {
        // Submit logic
        const payload = {
            category_id: data.category.id,
            team_name: data.teamName,
            // ...
        };
        Alert.alert("Sucesso", "Inscrição realizada!");
        if (data.teamName) {
            router.push('/profile/teams' as any); // Redirect to teams
        } else {
            router.push('/inscription/my-inscriptions' as any);
        }
    }

    return (
        <ScrollView className="p-6">
            <Text className="text-2xl font-bold text-indigo-900 mb-6">Resumo e Pagamento</Text>

            <View className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm mb-6">
                <Text className="text-xs uppercase font-bold text-gray-500">Categoria</Text>
                <View className="flex-row justify-between mb-4">
                    <Text className="text-lg font-bold text-gray-800">{data.category?.name}</Text>
                    <Text className="text-lg font-bold text-gray-800">R$ {catPrice.toFixed(2)}</Text>
                </View>
                {data.teamName && (
                    <>
                        <Text className="text-xs uppercase font-bold text-gray-500 mt-2">Equipe</Text>
                        <Text className="text-lg font-bold text-gray-800">{data.teamName}</Text>
                    </>
                )}
                <View className="border-t border-gray-100 mt-4 pt-4 flex-row justify-between">
                    <Text className="text-xl font-bold text-gray-900">Total</Text>
                    <Text className="text-2xl font-bold text-indigo-600">R$ {total.toFixed(2)}</Text>
                </View>
            </View>

            <View className="bg-white p-4 rounded-xl border border-gray-100 mb-6 flex-row gap-2">
                <TextInput
                    placeholder="CUPOM DE DESCONTO"
                    className="flex-1 bg-gray-50 rounded-lg px-4 uppercase"
                    value={coupon}
                    onChangeText={setCoupon}
                />
                <TouchableOpacity className="bg-gray-800 px-4 py-3 rounded-lg"><Text className="text-white font-bold">Aplicar</Text></TouchableOpacity>
            </View>

            <View className="flex-row gap-4 mb-8">
                <TouchableOpacity onPress={onPrev} className="flex-1 bg-gray-200 p-4 rounded-xl items-center"><Text className="text-gray-700 font-bold">Voltar</Text></TouchableOpacity>
                <TouchableOpacity onPress={handlePayment} className="flex-1 bg-green-600 p-4 rounded-xl items-center shadow-lg">
                    <Text className="text-white font-bold">Pagar Agora</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

// --------------------------------------------------------------------------
// MAIN
// --------------------------------------------------------------------------
export default function InscriptionScreen() {
    const router = useRouter();
    const { eventId } = useLocalSearchParams();
    const [step, setStep] = useState(1);
    const [inscriptionData, setInscriptionData] = useState<any>({});
    const [championship, setChampionship] = useState<any>(null); // To store "registration_type"

    // Fetch Champ info on mount to know type
    useEffect(() => {
        api.get(`/championships/${eventId}`).then((res: any) => setChampionship(res.data)).catch(console.error);
    }, [eventId]);

    const steps = 5;
    const progress = (step / steps) * 100;

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            <View className="pt-12 pb-4 px-6 bg-white dark:bg-gray-800 shadow-sm flex-row items-center border-b border-gray-100 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()} className="mr-4">
                    <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
                <View className="flex-1">
                    <Text className="font-bold text-gray-800 dark:text-white text-lg">Inscrição</Text>
                    <View className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full mt-2 w-full overflow-hidden">
                        <View className="h-full bg-indigo-600" style={{ width: `${progress}%` }} />
                    </View>
                </View>
                <Text className="text-xs text-gray-500 ml-3">Passo {step}/{steps}</Text>
            </View>

            <View className="flex-1">
                {step === 1 && <StepPersonal onNext={() => setStep(2)} onPrev={() => router.back()} data={inscriptionData} updateData={(k, v) => setInscriptionData({ ...inscriptionData, [k]: v })} />}
                {step === 2 && <StepCategory onNext={() => setStep(3)} onPrev={() => setStep(1)} data={inscriptionData} updateData={(k, v) => setInscriptionData({ ...inscriptionData, [k]: v })} />}
                {step === 3 && <StepTeam onNext={() => setStep(4)} onPrev={() => setStep(2)} data={inscriptionData} updateData={(k, v) => setInscriptionData({ ...inscriptionData, [k]: v })} championship={championship} />}
                {step === 4 && <StepProducts onNext={() => setStep(5)} onPrev={() => setStep(3)} data={inscriptionData} updateData={(k, v) => setInscriptionData({ ...inscriptionData, [k]: v })} />}
                {step === 5 && <StepSummary onNext={() => { }} onPrev={() => setStep(4)} data={inscriptionData} updateData={(k, v) => setInscriptionData({ ...inscriptionData, [k]: v })} />}
            </View>
        </View>
    );
}

import { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Alert, ActivityIndicator } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import api from '../../src/services/api';
import '../../global.css';

// Interfaces
interface Category {
    id: number;
    name: string;
    description?: string;
    price: string;
    gender: string;
    subcategories?: Category[];
}

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    type: 'good' | 'service' | 'donation' | 'kit';
    variants: any;
    stock_quantity: number;
}

interface InscriptionStepProps {
    onNext: () => void;
    onPrev: () => void;
    data: any;
    updateData: (key: string, value: any) => void;
}

// --------------------------------------------------------------------------
// STEP 1: DADOS PESSOAIS (Confirmar dados do usuário logado)
// --------------------------------------------------------------------------
// ... imports
import { useAuth } from '../../src/context/AuthContext';


// ... (Interfaces)

// --------------------------------------------------------------------------
// STEP 1: DADOS PESSOAIS (Confirmar dados do usuário logado)
// --------------------------------------------------------------------------
function StepPersonal({ onNext, data }: InscriptionStepProps) {
    const { user } = useAuth();

    if (!user) {
        return (
            <View className="p-6">
                <Text className="text-red-500 text-center">Você precisa estar logado.</Text>
            </View>
        )
    }

    return (
        <ScrollView className="p-6">
            <Text className="text-2xl font-bold text-emerald-800 mb-6">Confirme seus dados</Text>

            <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                <Text className="text-sm text-gray-500 mb-1">Nome Completo</Text>
                <Text className="text-lg font-bold text-gray-800">{user.name}</Text>
            </View>

            <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                <Text className="text-sm text-gray-500 mb-1">CPF</Text>
                <Text className="text-lg font-bold text-gray-800">{user.cpf || 'Não informado'}</Text>
            </View>

            <View className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-4">
                <Text className="text-sm text-gray-500 mb-1">E-mail</Text>
                <Text className="text-lg font-bold text-gray-800">{user.email}</Text>
            </View>

            <View className="bg-blue-50 p-4 rounded-xl mb-8 border-l-4 border-blue-500">
                <View className="flex-row">
                    <FontAwesome5 name="info-circle" size={20} color="#1e40af" />
                    <Text className="ml-3 text-blue-800 flex-1">Dados incorretos? Atualize no seu perfil antes de continuar.</Text>
                </View>
            </View>

            <TouchableOpacity onPress={onNext} className="bg-emerald-600 p-4 rounded-xl items-center shadow-lg">
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
                // Busca detalhes do campeonato, que inclui categorias
                const response = await api.get(`/championships/${eventId}`);
                const champData = response.data;

                if (champData && champData.categories) {
                    setCategories(champData.categories);
                }
            } catch (err) {
                console.error(err);
                Alert.alert("Erro", "Não foi possível carregar as categorias.");
            } finally {
                setLoading(false);
            }
        }
        if (eventId) fetchCategories();
    }, [eventId]);

    const handleSelect = (cat: Category) => {
        updateData('category', cat);
    };

    if (loading) return <ActivityIndicator color="#059669" size="large" className="mt-10" />;

    return (
        <ScrollView className="p-6">
            <Text className="text-2xl font-bold text-emerald-800 mb-2">Escolha sua Categoria</Text>
            <Text className="text-gray-500 mb-6">Selecione a distância ou modalidade.</Text>

            {categories.length === 0 ? (
                <Text className="text-gray-500 italic text-center mt-4">Nenhuma categoria cadastrada.</Text>
            ) : (
                categories.map(cat => (
                    <TouchableOpacity
                        key={cat.id}
                        onPress={() => handleSelect(cat)}
                        className={`p-4 rounded-xl border-2 mb-4 ${data.category?.id === cat.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white'}`}
                    >
                        <View className="flex-row justify-between items-center">
                            <View>
                                <Text className={`font-bold text-lg ${data.category?.id === cat.id ? 'text-emerald-800' : 'text-gray-800'}`}>{cat.name}</Text>
                                <Text className="text-gray-500 text-sm mt-1">{cat.description || cat.gender}</Text>
                            </View>
                            <Text className="font-bold text-xl text-emerald-600">R$ {parseFloat(cat.price || '0').toFixed(2).replace('.', ',')}</Text>
                        </View>
                    </TouchableOpacity>
                ))
            )}

            <View className="flex-row gap-4 mt-8">
                <TouchableOpacity onPress={onPrev} className="flex-1 bg-gray-200 p-4 rounded-xl items-center">
                    <Text className="text-gray-700 font-bold">Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={onNext}
                    disabled={!data.category}
                    className={`flex-1 p-4 rounded-xl items-center ${data.category ? 'bg-emerald-600 shadow-lg' : 'bg-gray-300'}`}
                >
                    <Text className="text-white font-bold">Próximo</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// --------------------------------------------------------------------------
// STEP 3: KITS E PRODUTOS (Venda e Brinde)
// --------------------------------------------------------------------------
function StepProducts({ onNext, onPrev, data, updateData }: InscriptionStepProps) {
    const [products, setProducts] = useState<Product[]>([]);

    useEffect(() => {
        async function fetchProducts() {
            // TODO: Implementar endpoint real quando disponível
            // Por enquanto, mockamos para demonstração visual
            const mockProducts: Product[] = [
                { id: 10, name: 'Camisa Oficial', description: 'Tecido tecnológico', price: '0.00', type: 'kit', stock_quantity: 100, variants: [{ name: 'Tamanho', options: ['P', 'M', 'G', 'GG'] }] },
                { id: 11, name: 'Boné RunEvents', description: 'Proteção UV', price: '25.00', type: 'good', stock_quantity: 50, variants: [] },
                { id: 12, name: 'Squeeze Térmico', description: 'Mantém gelado por 4h', price: '40.00', type: 'good', stock_quantity: 50, variants: [] },
            ];
            setProducts(mockProducts);
        }
        fetchProducts();
    }, []);

    // Helper para atualizar quantidade ou variante
    const updateProductSelection = (prodId: number, type: 'variant' | 'qty', value: any) => {
        const currentSelection = data.selectedProducts || {};
        const productData = currentSelection[prodId] || { qty: 0, variant: null };

        if (type === 'qty') productData.qty = value;
        if (type === 'variant') productData.variant = value;

        updateData('selectedProducts', { ...currentSelection, [prodId]: productData });
    };

    const brindes = products.filter(p => p.type === 'kit' || p.price === '0.00');
    const venda = products.filter(p => p.type !== 'kit' && p.price !== '0.00');

    return (
        <ScrollView className="p-6">
            <Text className="text-2xl font-bold text-emerald-800 mb-2">Kits e Extras</Text>

            {/* BRINDES (INCLUSO) */}
            {brindes.length > 0 && (
                <View className="mb-8">
                    <View className="flex-row items-center mb-4">
                        <FontAwesome5 name="gift" size={20} color="#059669" />
                        <Text className="text-lg font-bold text-gray-800 ml-2">Incluso na Inscrição</Text>
                    </View>

                    {brindes.map(prod => (
                        <View key={prod.id} className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl mb-4">
                            <Text className="font-bold text-gray-800 text-lg">{prod.name}</Text>
                            <Text className="text-gray-600 text-sm mb-2">{prod.description}</Text>

                            {/* Seletor de Variante (Tamanho) */}
                            {prod.variants && prod.variants.length > 0 && (
                                <View className="flex-row flex-wrap gap-2 mt-2">
                                    {prod.variants[0].options.map((opt: string) => {
                                        const isSelected = data.selectedProducts?.[prod.id]?.variant === opt;
                                        return (
                                            <TouchableOpacity
                                                key={opt}
                                                onPress={() => updateProductSelection(prod.id, 'variant', opt)}
                                                className={`px-4 py-2 rounded-full border ${isSelected ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-gray-300'}`}
                                            >
                                                <Text className={isSelected ? 'text-white font-bold' : 'text-gray-600'}>{opt}</Text>
                                            </TouchableOpacity>
                                        )
                                    })}
                                </View>
                            )}
                            <View className="mt-2"><Text className="text-emerald-700 font-bold text-xs uppercase tracking-wide">Grátis</Text></View>
                        </View>
                    ))}
                </View>
            )}

            {/* VENDA (ADICIONAIS) */}
            {venda.length > 0 && (
                <View className="mb-8">
                    <View className="flex-row items-center mb-4">
                        <FontAwesome5 name="shopping-cart" size={18} color="#2563eb" />
                        <Text className="text-lg font-bold text-gray-800 ml-2">Produtos Adicionais</Text>
                    </View>

                    {venda.map(prod => {
                        const qty = data.selectedProducts?.[prod.id]?.qty || 0;
                        return (
                            <View key={prod.id} className="bg-white border border-gray-200 p-4 rounded-xl mb-4 flex-row justify-between items-center shadow-sm">
                                <View className="flex-1 pr-4">
                                    <Text className="font-bold text-gray-800 text-lg">{prod.name}</Text>
                                    <Text className="text-blue-600 font-bold">R$ {parseFloat(prod.price).toFixed(2).replace('.', ',')}</Text>
                                </View>

                                <View className="flex-row items-center bg-gray-100 rounded-lg">
                                    <TouchableOpacity onPress={() => updateProductSelection(prod.id, 'qty', Math.max(0, qty - 1))} className="p-3">
                                        <Text className="text-lg font-bold text-gray-600">-</Text>
                                    </TouchableOpacity>
                                    <Text className="px-2 font-bold text-lg w-8 text-center">{qty}</Text>
                                    <TouchableOpacity onPress={() => updateProductSelection(prod.id, 'qty', qty + 1)} className="p-3">
                                        <Text className="text-lg font-bold text-gray-600">+</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )
                    })}
                </View>
            )}

            <View className="flex-row gap-4 mb-8">
                <TouchableOpacity onPress={onPrev} className="flex-1 bg-gray-200 p-4 rounded-xl items-center">
                    <Text className="text-gray-700 font-bold">Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onNext} className="flex-1 bg-emerald-600 p-4 rounded-xl items-center shadow-lg">
                    <Text className="text-white font-bold">Resumo</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// --------------------------------------------------------------------------
// STEP 4: RESUMO E PAGAMENTO
// --------------------------------------------------------------------------
function StepSummary({ onPrev, data }: InscriptionStepProps) {
    // Calculo totais
    const catPrice = parseFloat(data.category?.price || '0');

    // Total produtos extras
    let extrasTotal = 0;
    // Lógica real precisaria iterar sobre products para pegar o preço. 
    // MVP: assumindo que data.selectedProducts tem o preço salvo (ideal) ou buscando de novo.
    // Simplificação: vamos assumir que o fluxo anterior salvou metadata básica

    const total = catPrice + 50.00; // Mock: assumindo R$ 50 de extras para teste de layout

    return (
        <ScrollView className="p-6">
            <Text className="text-2xl font-bold text-emerald-800 mb-6">Resumo da Inscrição</Text>

            <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
                <Text className="text-gray-500 font-bold mb-2 uppercase text-xs tracking-wider">Categoria</Text>
                <View className="flex-row justify-between mb-4 pb-4 border-b border-gray-100">
                    <Text className="text-lg font-bold text-gray-800">{data.category?.name}</Text>
                    <Text className="text-lg font-bold text-gray-800">R$ {catPrice.toFixed(2).replace('.', ',')}</Text>
                </View>

                <Text className="text-gray-500 font-bold mb-2 uppercase text-xs tracking-wider">Extras</Text>
                <View className="flex-row justify-between mb-4">
                    <Text className="text-gray-600">Boné + Squeeze (Exemplo)</Text>
                    <Text className="text-gray-800 font-bold">R$ 50,00</Text>
                </View>

                <View className="mt-4 pt-4 border-t border-gray-200 flex-row justify-between items-center">
                    <Text className="text-xl font-bold text-gray-800">TOTAL</Text>
                    <Text className="text-3xl font-bold text-emerald-600">R$ {total.toFixed(2).replace('.', ',')}</Text>
                </View>
            </View>

            <View className="flex-row gap-4">
                <TouchableOpacity onPress={onPrev} className="flex-1 bg-gray-200 p-4 rounded-xl items-center">
                    <Text className="text-gray-700 font-bold">Voltar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => Alert.alert('Sucesso', 'Inscrição realizada! Redirecionando para Pix...')} className="flex-1 bg-emerald-600 p-4 rounded-xl items-center shadow-lg">
                    <Text className="text-white font-bold">Pagar Agora</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}


// --------------------------------------------------------------------------
// MAIN SCREEN CONTROLLER
// --------------------------------------------------------------------------
export default function InscriptionScreen() {
    const router = useRouter();
    const { eventId } = useLocalSearchParams();
    const [step, setStep] = useState(1);
    const [inscriptionData, setInscriptionData] = useState({
        category: null,
        subCategory: null,
        selectedProducts: {}, // { prodId: { qty: 1, variant: 'M' } }
    });

    // Animação da barra de progresso
    const progress = useRef(new Animated.Value(0.25)).current;

    useEffect(() => {
        Animated.timing(progress, {
            toValue: step * 0.25,
            duration: 300,
            useNativeDriver: false
        }).start();
    }, [step]);

    const nextStep = () => setStep(s => Math.min(4, s + 1));
    const prevStep = () => setStep(s => Math.max(1, s - 1));

    const updateData = (key: string, value: any) => {
        setInscriptionData(prev => ({ ...prev, [key]: value }));
    };

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header com Progresso */}
            <View className="pt-12 pb-4 px-6 bg-white shadow-sm z-10">
                <View className="flex-row justify-between items-center mb-4">
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialIcons name="close" size={24} color="#666" />
                    </TouchableOpacity>
                    <Text className="font-bold text-gray-800 text-lg">Inscrição</Text>
                    <View style={{ width: 24 }} />
                </View>

                {/* Barra de Progresso */}
                <View className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <Animated.View
                        style={{
                            width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                            height: '100%',
                            backgroundColor: '#059669'
                        }}
                    />
                </View>
                <Text className="text-xs text-center text-gray-500 mt-2">Passo {step} de 4</Text>
            </View>

            {/* Steps Rendering */}
            <View className="flex-1">
                {step === 1 && <StepPersonal onNext={nextStep} onPrev={prevStep} data={inscriptionData} updateData={updateData} />}
                {step === 2 && <StepCategory onNext={nextStep} onPrev={prevStep} data={inscriptionData} updateData={updateData} />}
                {step === 3 && <StepProducts onNext={nextStep} onPrev={prevStep} data={inscriptionData} updateData={updateData} />}
                {step === 4 && <StepSummary onNext={nextStep} onPrev={prevStep} data={inscriptionData} updateData={updateData} />}
            </View>
        </View>
    );
}

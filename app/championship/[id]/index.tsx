import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import api from '../../../src/services/api';
import '../../../global.css';

const MENUS: any = {
    futebol: [
        { label: 'Jogos', icon: 'futbol', route: 'matches', color: 'orange' },
        { label: 'Classificação', icon: 'list-ol', route: 'leaderboard', color: 'blue' },
        { label: 'Artilharia', icon: 'bullseye', route: 'stats', params: { type: 'goals', title: 'Artilharia' }, color: 'gray' },
        { label: 'Assistência', icon: 'hands-helping', route: 'stats', params: { type: 'assists', title: 'Assistências' }, color: 'cyan' },
        { label: 'Cartão Amarelo', icon: 'square', iconColor: '#FBBF24', route: 'stats', params: { type: 'yellow_cards', title: 'Cartões Amarelos' }, color: 'yellow' },
        { label: 'Cartão Azul', icon: 'square', iconColor: '#3B82F6', route: 'stats', params: { type: 'blue_cards', title: 'Cartões Azuis' }, color: 'blue' },
        { label: 'Cartão Vermelho', icon: 'square', iconColor: '#EF4444', route: 'stats', params: { type: 'red_cards', title: 'Cartões Vermelhos' }, color: 'red' },
        { label: 'Gerenciar Equipe', icon: 'users-cog', route: 'manage-team', color: 'indigo' },
        { label: 'Melhor em Campo', icon: 'crown', route: 'mvp', color: 'black' },
        { label: 'Galeria', icon: 'images', route: 'gallery', color: 'pink' },
        { label: 'Gerar Arte', icon: 'image', route: 'art', color: 'green' },
        { label: 'Confronto', icon: 'handshake', route: 'h2h', color: 'teal' },
    ],
    volei: [
        { label: 'Jogos', icon: 'volleyball-ball', route: 'matches', color: 'orange' },
        { label: 'Classificação', icon: 'list-ol', route: 'leaderboard', color: 'blue' },
        { label: 'Pontuador', icon: 'bullseye', route: 'stats', params: { type: 'points', title: 'Maiores Pontuadores' }, color: 'gray' },
        { label: 'Bloqueador', icon: 'hand-paper', route: 'stats', params: { type: 'blocks', title: 'Melhores Bloqueadores' }, color: 'cyan' },
        { label: 'Acer', icon: 'star', route: 'stats', params: { type: 'aces', title: 'Melhores Sacadores' }, color: 'indigo' },
        { label: 'Melhor em Quadra', icon: 'crown', route: 'mvp', color: 'purple' },
        { label: 'Equipes', icon: 'users', route: 'teams', color: 'blue' },
        { label: 'Confrontos', icon: 'clipboard-list', route: 'h2h', color: 'teal' },
        { label: 'Galeria', icon: 'images', route: 'gallery', color: 'pink' },
        { label: 'Gerar Arte', icon: 'image', route: 'art', color: 'green' },
    ],
    corrida: [
        { label: 'Resultados', icon: 'flag-checkered', route: 'results', color: 'orange' },
        { label: 'Inscritos', icon: 'users', route: 'participants', color: 'blue' },
        { label: 'Categorias', icon: 'layer-group', route: 'categories', color: 'cyan' },
        { label: 'Galeria', icon: 'images', route: 'gallery', color: 'pink' },
        { label: 'Gerar Arte', icon: 'image', route: 'art', color: 'green' },
    ],
    natacao: [
        { label: 'Resultados', icon: 'stopwatch', route: 'results', color: 'orange' },
        { label: 'Balizamento', icon: 'list-alt', route: 'heats', color: 'blue' },
        { label: 'Inscritos', icon: 'users', route: 'participants', color: 'cyan' },
        { label: 'Recordes', icon: 'medal', route: 'stats', params: { title: 'Recordes' }, color: 'purple' },
        { label: 'Galeria', icon: 'images', route: 'gallery', color: 'pink' },
        { label: 'Gerar Arte', icon: 'image', route: 'art', color: 'green' },
    ],
    lutas: [
        { label: 'Chaves', icon: 'sitemap', route: 'brackets', color: 'orange' },
        { label: 'Combates', icon: 'fist-raised', route: 'matches', color: 'red' },
        { label: 'Pesagem', icon: 'weight', route: 'weigh-in', color: 'gray' },
        { label: 'Inscritos', icon: 'users', route: 'participants', color: 'blue' },
        { label: 'Galeria', icon: 'images', route: 'gallery', color: 'pink' },
        { label: 'Gerar Arte', icon: 'image', route: 'art', color: 'green' },
    ],
    tenis: [
        { label: 'Chaves', icon: 'sitemap', route: 'brackets', color: 'orange' },
        { label: 'Partidas', icon: 'running', route: 'matches', color: 'green' }, // running used as active play
        { label: 'Ranking', icon: 'trophy', route: 'leaderboard', color: 'yellow' },
        { label: 'Inscritos', icon: 'users', route: 'participants', color: 'blue' },
        { label: 'Galeria', icon: 'images', route: 'gallery', color: 'pink' },
    ],
    basquete: [
        { label: 'Jogos', icon: 'basketball-ball', route: 'matches', color: 'orange' },
        { label: 'Classificação', icon: 'list-ol', route: 'leaderboard', color: 'blue' },
        { label: 'Cestinhas', icon: 'bullseye', route: 'stats', params: { type: 'points', title: 'Cestinhas' }, color: 'gray' },
        { label: 'Rebotes', icon: 'hand-holding', route: 'stats', params: { type: 'rebounds', title: 'Líderes em Rebotes' }, color: 'cyan' },
        { label: 'Assistências', icon: 'hands-helping', route: 'stats', params: { type: 'assists', title: 'Líderes em Assistências' }, color: 'indigo' },
        { label: 'MVP', icon: 'crown', route: 'mvp', color: 'black' },
        { label: 'Galeria', icon: 'images', route: 'gallery', color: 'pink' },
    ],
    handebol: [
        { label: 'Jogos', icon: 'futbol', route: 'matches', color: 'orange' }, // futbol icon generic for ball game if specific missing
        { label: 'Classificação', icon: 'list-ol', route: 'leaderboard', color: 'blue' },
        { label: 'Artilharia', icon: 'bullseye', route: 'stats', params: { type: 'goals', title: 'Artilharia' }, color: 'gray' },
        { label: 'Galeria', icon: 'images', route: 'gallery', color: 'pink' },
    ],
    futsal: [
        { label: 'Jogos', icon: 'futbol', route: 'matches', color: 'orange' },
        { label: 'Classificação', icon: 'list-ol', route: 'leaderboard', color: 'blue' },
        { label: 'Artilharia', icon: 'bullseye', route: 'stats', params: { type: 'goals', title: 'Artilharia' }, color: 'gray' },
        { label: 'Cartões', icon: 'square', iconColor: '#FBBF24', route: 'stats', params: { type: 'cards', title: 'Cartões' }, color: 'yellow' },
        { label: 'Galeria', icon: 'images', route: 'gallery', color: 'pink' },
    ],
    default: [
        { label: 'Jogos', icon: 'futbol', route: 'matches', color: 'orange' },
        { label: 'Classificação', icon: 'list-ol', route: 'leaderboard', color: 'blue' },
        { label: 'Galeria', icon: 'images', route: 'gallery', color: 'pink' },
    ]
};

// ... imports
import { useAuth } from '../../../src/context/AuthContext';

// ... (keep MENUS definition - verify if 'Galeria' should be added)

export default function ChampionshipMenuScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth(); // Get real user
    const [loading, setLoading] = useState(true);
    const [champ, setChamp] = useState<any>(null);

    useEffect(() => {
        async function loadChamp() {
            try {
                const response = await api.get(`/championships/${id}`);
                setChamp(response.data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        loadChamp();
    }, [id]);

    if (loading) return <ActivityIndicator className="flex-1 mt-20" size="large" color="#00C851" />;

    // Select menu based on sport slug
    const sportSlug = champ?.sport?.slug || 'default';
    const gridItems = MENUS[sportSlug] || MENUS['default'];

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-blue-900 pt-12 pb-6 px-4 relative">
                <TouchableOpacity onPress={() => router.back()} className="absolute top-12 left-4 z-10 w-10 h-10 items-center justify-center bg-black/20 rounded-full">
                    <FontAwesome5 name="arrow-left" size={18} color="white" />
                </TouchableOpacity>

                <View className="items-center mt-4">
                    <Text className="text-white text-2xl font-bold text-center">{champ?.name}</Text>
                    <Text className="text-blue-200 text-sm mt-1 uppercase">{champ?.sport?.name}</Text>
                </View>
            </View>

            <ScrollView className="flex-1 p-4">
                {/* CTA de Inscrição */}
                <TouchableOpacity
                    className="bg-green-600 rounded-xl p-4 mb-6 flex-row items-center justify-center shadow-md shadow-green-600/30"
                    onPress={() => router.push(`/inscription/${id}`)}
                >
                    <FontAwesome5 name="pen-fancy" size={20} color="white" className="mr-3" />
                    <Text className="text-white font-bold text-lg uppercase tracking-wide">Inscrever-se Agora</Text>
                </TouchableOpacity>

                {/* Grid de Menus */}
                <View className="flex-row flex-wrap justify-between">
                    {gridItems.map((item: any, index: number) => (
                        <TouchableOpacity
                            key={index}
                            className={`w-[48%] bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 shadow-sm border-l-4`}
                            style={{ borderLeftColor: item.iconColor || getTailwindColor(item.color) }}
                            onPress={() => {
                                if (item.route) {
                                    // Navigate to specific route with params
                                    if (item.params) {
                                        router.push({ pathname: `/championship/[id]/${item.route}`, params: { id, ...item.params } } as any);
                                    } else {
                                        router.push({ pathname: `/championship/[id]/${item.route}`, params: { id } } as any);
                                    }
                                }
                            }}
                        >
                            <View className="flex-row justify-between items-center mb-2">
                                <Text className="font-bold text-gray-800 dark:text-gray-100 uppercase text-xs flex-1 mr-2">{item.label}</Text>
                                <FontAwesome5
                                    name={item.icon as any}
                                    size={20}
                                    color={item.iconColor || '#666'}
                                    solid
                                />
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

function getTailwindColor(color: string) {
    const colors: any = {
        orange: '#F97316',
        blue: '#3B82F6',
        gray: '#6B7280',
        cyan: '#06B6D4',
        yellow: '#FBBF24',
        red: '#EF4444',
        indigo: '#6366F1',
        purple: '#A855F7',
        black: '#000000',
        green: '#10B981',
        teal: '#14B8A6'
    };
    return colors[color] || '#ccc';
}

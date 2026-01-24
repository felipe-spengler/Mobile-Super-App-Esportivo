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

        { label: 'Ver Artes', icon: 'images', route: 'awards', color: 'green' },
    ],
    volei: [
        { label: 'Jogos', icon: 'volleyball-ball', route: 'matches', color: 'orange' },
        { label: 'Classificação', icon: 'list-ol', route: 'leaderboard', color: 'blue' },
        { label: 'Pontuador', icon: 'bullseye', route: 'stats', params: { type: 'points', title: 'Maiores Pontuadores' }, color: 'gray' },
        { label: 'Bloqueador', icon: 'hand-paper', route: 'stats', params: { type: 'blocks', title: 'Melhores Bloqueadores' }, color: 'cyan' },
        { label: 'Acer', icon: 'star', route: 'stats', params: { type: 'aces', title: 'Melhores Sacadores' }, color: 'indigo' },
        { label: 'Melhor em Quadra', icon: 'crown', route: 'mvp', color: 'purple' },
        { label: 'Equipes', icon: 'users', route: 'teams', color: 'blue' },

        { label: 'Ver Artes', icon: 'images', route: 'awards', color: 'green' },
    ],
    corrida: [
        { label: 'Resultados', icon: 'flag-checkered', route: 'results', color: 'orange' },
        { label: 'Inscritos', icon: 'users', route: 'participants', color: 'blue' },
        { label: 'Categorias', icon: 'layer-group', route: 'categories', color: 'cyan' },

        { label: 'Ver Artes', icon: 'images', route: 'awards', color: 'green' },
    ],
    natacao: [
        { label: 'Resultados', icon: 'stopwatch', route: 'results', color: 'orange' },
        { label: 'Balizamento', icon: 'list-alt', route: 'heats', color: 'blue' },
        { label: 'Inscritos', icon: 'users', route: 'participants', color: 'cyan' },
        { label: 'Recordes', icon: 'medal', route: 'stats', params: { title: 'Recordes' }, color: 'purple' },

        { label: 'Ver Artes', icon: 'images', route: 'awards', color: 'green' },
    ],
    lutas: [
        { label: 'Chaves', icon: 'sitemap', route: 'brackets', color: 'orange' },
        { label: 'Combates', icon: 'fist-raised', route: 'matches', color: 'red' },
        { label: 'Pesagem', icon: 'weight', route: 'weigh-in', color: 'gray' },
        { label: 'Inscritos', icon: 'users', route: 'participants', color: 'blue' },

        { label: 'Ver Artes', icon: 'images', route: 'awards', color: 'green' },
    ],
    tenis: [
        { label: 'Chaves', icon: 'sitemap', route: 'brackets', color: 'orange' },
        { label: 'Partidas', icon: 'running', route: 'matches', color: 'green' }, // running used as active play
        { label: 'Ranking', icon: 'trophy', route: 'leaderboard', color: 'yellow' },
        { label: 'Inscritos', icon: 'users', route: 'participants', color: 'blue' },

    ],
    basquete: [
        { label: 'Jogos', icon: 'basketball-ball', route: 'matches', color: 'orange' },
        { label: 'Classificação', icon: 'list-ol', route: 'leaderboard', color: 'blue' },
        { label: 'Cestinhas', icon: 'bullseye', route: 'stats', params: { type: 'points', title: 'Cestinhas' }, color: 'gray' },
        { label: 'Rebotes', icon: 'hand-holding', route: 'stats', params: { type: 'rebounds', title: 'Líderes em Rebotes' }, color: 'cyan' },
        { label: 'Assistências', icon: 'hands-helping', route: 'stats', params: { type: 'assists', title: 'Líderes em Assistências' }, color: 'indigo' },
        { label: 'MVP', icon: 'crown', route: 'mvp', color: 'black' },

    ],
    handebol: [
        { label: 'Jogos', icon: 'futbol', route: 'matches', color: 'orange' }, // futbol icon generic for ball game if specific missing
        { label: 'Classificação', icon: 'list-ol', route: 'leaderboard', color: 'blue' },
        { label: 'Artilharia', icon: 'bullseye', route: 'stats', params: { type: 'goals', title: 'Artilharia' }, color: 'gray' },

    ],
    futsal: [
        { label: 'Jogos', icon: 'futbol', route: 'matches', color: 'orange' },
        { label: 'Classificação', icon: 'list-ol', route: 'leaderboard', color: 'blue' },
        { label: 'Artilharia', icon: 'bullseye', route: 'stats', params: { type: 'goals', title: 'Artilharia' }, color: 'gray' },
        { label: 'Cartões', icon: 'square', iconColor: '#FBBF24', route: 'stats', params: { type: 'cards', title: 'Cartões' }, color: 'yellow' },

    ],
    default: [
        { label: 'Jogos', icon: 'futbol', route: 'matches', color: 'orange' },
        { label: 'Classificação', icon: 'list-ol', route: 'leaderboard', color: 'blue' },

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
    const [selectedCategory, setSelectedCategory] = useState<any>(null);

    useEffect(() => {
        async function loadChamp() {
            try {
                const response = await api.get(`/championships/${id}`);
                setChamp(response.data);
                // Auto-select first category if available
                if (response.data.categories && response.data.categories.length > 0) {
                    setSelectedCategory(response.data.categories[0]);
                }
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
            <View className="bg-blue-900 pt-12 pb-4 px-4 relative shadow-lg z-10">
                <TouchableOpacity onPress={() => router.back()} className="absolute top-12 left-4 z-10 w-10 h-10 items-center justify-center bg-black/20 rounded-full">
                    <FontAwesome5 name="arrow-left" size={18} color="white" />
                </TouchableOpacity>

                <View className="items-center mt-2 mb-4">
                    <Text className="text-white text-2xl font-bold text-center">{champ?.name}</Text>
                    <Text className="text-blue-200 text-sm mt-1 uppercase">{champ?.sport?.name}</Text>
                </View>

                {/* Category Selector */}
                {champ?.categories && champ.categories.length > 0 && (
                    <View className="mt-2">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4 }}>
                            {champ.categories.map((cat: any) => (
                                <TouchableOpacity
                                    key={cat.id}
                                    onPress={() => setSelectedCategory(cat)}
                                    className={`px-4 py-2 rounded-full mr-2 border ${selectedCategory?.id === cat.id ? 'bg-white border-white' : 'bg-blue-800/50 border-blue-700'}`}
                                >
                                    <Text className={`text-xs font-bold uppercase ${selectedCategory?.id === cat.id ? 'text-blue-900' : 'text-blue-100'}`}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                )}
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
                <View className="w-full max-w-4xl self-center p-4">
                    {/* CTA de Inscrição */}
                    <TouchableOpacity
                        className="bg-green-600 rounded-xl p-4 mb-6 flex-row items-center justify-center shadow-md shadow-green-600/30 w-full md:w-auto md:self-start md:px-8"
                        onPress={() => router.push(`/inscription/${id}`)}
                    >
                        <FontAwesome5 name="pen-fancy" size={20} color="white" className="mr-3" />
                        <Text className="text-white font-bold text-lg uppercase tracking-wide">Inscrever-se Agora</Text>
                    </TouchableOpacity>

                    {/* Grid de Menus */}
                    <View className="flex-row flex-wrap justify-between md:justify-start md:gap-4">
                        {gridItems.map((item: any, index: number) => (
                            <TouchableOpacity
                                key={index}
                                className={`w-[48%] md:w-64 bg-white dark:bg-gray-800 p-4 rounded-xl mb-4 shadow-sm border-l-4 hover:bg-gray-50 transition-all`}
                                style={{ borderLeftColor: item.iconColor || getTailwindColor(item.color) }}
                                onPress={() => {
                                    if (item.route) {
                                        const params = { id, category_id: selectedCategory?.id, ...item.params };
                                        router.push({ pathname: `/championship/[id]/${item.route}`, params } as any);
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

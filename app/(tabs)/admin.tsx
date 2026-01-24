import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../../src/context/AuthContext';
import '../../global.css';

interface AdminMenuItem {
    id: string;
    title: string;
    icon: string;
    route: string;
    color: string;
    description: string;
}

const ADMIN_MENU: AdminMenuItem[] = [
    {
        id: 'championships',
        title: 'Gerenciar Campeonatos',
        icon: 'trophy',
        route: '/admin/championships',
        color: '#0d6efd',
        description: 'Criar, editar e excluir campeonatos'
    },
    {
        id: 'teams',
        title: 'Gerenciar Equipes',
        icon: 'users',
        route: '/admin/teams',
        color: '#198754',
        description: 'Adicionar e gerenciar equipes'
    },
    {
        id: 'matches',
        title: 'Gerenciar Partidas',
        icon: 'futbol',
        route: '/admin/matches',
        color: '#dc3545',
        description: 'Criar, editar e finalizar partidas'
    },
    {
        id: 'players',
        title: 'Gerenciar Jogadores',
        icon: 'user-friends',
        route: '/admin/players',
        color: '#ffc107',
        description: 'Cadastrar e editar jogadores'
    },
    {
        id: 'awards',
        title: 'Definir Premiações',
        icon: 'medal',
        route: '/admin/awards',
        color: '#fd7e14',
        description: 'Configurar destaques e MVPs'
    },
    {
        id: 'scan',
        title: 'Scanner QR Code',
        icon: 'qrcode',
        route: '/admin/scan',
        color: '#6c757d',
        description: 'Validar ingressos e carteirinhas'
    },
];

export default function AdminTabScreen() {
    const router = useRouter();
    const { user, selectedClub } = useAuth();

    const isSuperAdmin = user?.is_admin && user?.club_id === null;

    return (
        <View className="flex-1 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <View className="bg-blue-900 pt-12 pb-6 px-4 shadow-lg">
                <View className="flex-row items-center mb-2">
                    <View className="w-12 h-12 bg-white/20 rounded-full items-center justify-center mr-3">
                        <FontAwesome5 name="shield-alt" size={24} color="white" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-white text-2xl font-bold">Painel Admin</Text>
                        <Text className="text-blue-200 text-sm">
                            {isSuperAdmin ? 'Super Administrador' : selectedClub?.name || 'Administrador'}
                        </Text>
                    </View>
                </View>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ padding: 16 }}>
                {/* Quick Stats */}
                <View className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
                    <Text className="text-gray-800 dark:text-gray-100 font-bold text-lg mb-4">Acesso Rápido</Text>
                    <View className="flex-row justify-around">
                        <TouchableOpacity
                            className="items-center"
                            onPress={() => router.push('/admin/scan')}
                        >
                            <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full items-center justify-center mb-2">
                                <FontAwesome5 name="qrcode" size={24} color="#0d6efd" />
                            </View>
                            <Text className="text-gray-700 dark:text-gray-300 text-xs font-medium">Scanner</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="items-center"
                            onPress={() => router.push('/admin/matches')}
                        >
                            <View className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full items-center justify-center mb-2">
                                <FontAwesome5 name="futbol" size={24} color="#198754" />
                            </View>
                            <Text className="text-gray-700 dark:text-gray-300 text-xs font-medium">Partidas</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            className="items-center"
                            onPress={() => router.push('/admin/awards')}
                        >
                            <View className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full items-center justify-center mb-2">
                                <FontAwesome5 name="medal" size={24} color="#ffc107" />
                            </View>
                            <Text className="text-gray-700 dark:text-gray-300 text-xs font-medium">Prêmios</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Menu Grid */}
                <Text className="text-gray-800 dark:text-gray-100 font-bold text-lg mb-4">Gerenciamento</Text>

                {ADMIN_MENU.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        className="bg-white dark:bg-gray-800 rounded-xl mb-4 shadow-sm border-l-4 overflow-hidden"
                        style={{ borderLeftColor: item.color }}
                        onPress={() => router.push(item.route as any)}
                        activeOpacity={0.7}
                    >
                        <View className="p-4 flex-row items-center">
                            <View
                                className="w-12 h-12 rounded-full items-center justify-center mr-4"
                                style={{ backgroundColor: `${item.color}20` }}
                            >
                                <FontAwesome5 name={item.icon as any} size={20} color={item.color} />
                            </View>
                            <View className="flex-1">
                                <Text className="text-gray-800 dark:text-gray-100 font-bold text-base mb-1">
                                    {item.title}
                                </Text>
                                <Text className="text-gray-500 dark:text-gray-400 text-xs">
                                    {item.description}
                                </Text>
                            </View>
                            <FontAwesome5 name="chevron-right" size={16} color="#999" />
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

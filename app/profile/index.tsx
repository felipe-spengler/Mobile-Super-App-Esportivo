import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import '../../global.css';

const MENU_ITEMS = [
    { label: 'Editar Perfil', icon: 'user-edit', route: '/profile/edit' },
    { label: 'Minhas Inscrições', icon: 'clipboard-list', route: '/inscriptions' },
    { label: 'Certificados', icon: 'certificate', route: '/certificates' },
    { label: 'Configurações', icon: 'cog', route: '/settings' },
    { label: 'Sair', icon: 'sign-out-alt', route: '/welcome', color: 'text-red-500' },
];

export default function ProfileScreen() {
    const router = useRouter();

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="bg-white p-6 pt-12 items-center border-b border-gray-100">
                <View className="w-24 h-24 bg-gray-200 rounded-full mb-4" />
                <Text className="text-xl font-bold text-gray-900">João da Silva</Text>
                <Text className="text-gray-500">joao@email.com</Text>
            </View>

            <View className="p-4 space-y-2">
                {MENU_ITEMS.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        className="bg-white p-4 rounded-xl flex-row items-center shadow-sm"
                        onPress={() => router.push(item.route as any)}
                    >
                        <View className="w-8 items-center">
                            <FontAwesome5 name={item.icon as any} size={18} color={item.color ? '#EF4444' : '#4B5563'} />
                        </View>
                        <Text className={`flex-1 ml-3 font-medium ${item.color || 'text-gray-700'}`}>
                            {item.label}
                        </Text>
                        <FontAwesome5 name="chevron-right" size={14} color="#D1D5DB" />
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

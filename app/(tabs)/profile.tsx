import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useAuth } from '../../src/context/AuthContext';
import '../../global.css';

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const menuItems = user ? [
    ...(user.is_admin ? [{ label: 'Área do Gestor', icon: 'user-tie', route: '/admin/home', color: 'text-blue-600 dark:text-blue-400' }] : []),
    { label: 'Editar Perfil', icon: 'user-edit', route: '/profile/edit' },
    { label: 'Minhas Inscrições', icon: 'clipboard-list', route: '/inscriptions' },
    { label: 'Configurações', icon: 'cog', route: '/settings' },
    { label: 'Sair', icon: 'sign-out-alt', route: 'logout', color: 'text-red-500' },
  ] : [
    { label: 'Fazer Login / Cadastro', icon: 'sign-in-alt', route: '/login' },
    { label: 'Configurações', icon: 'cog', route: '/settings' },
  ];

  async function handlePress(item: any) {
    if (item.route === 'logout') {
      await signOut();
      router.replace('/(tabs)'); // Recarrega a home como visitante
    } else {
      router.push(item.route);
    }
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="bg-white dark:bg-gray-800 p-6 pt-12 items-center border-b border-gray-100 dark:border-gray-700">
        <View className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mb-4 items-center justify-center">
          <FontAwesome5 name="user" size={40} color={isDark ? "#9CA3AF" : "#9CA3AF"} />
        </View>
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          {user ? user.name : 'Visitante'}
        </Text>
        <Text className="text-gray-500 dark:text-gray-400">
          {user ? user.email : 'Faça login para acessar suas inscrições'}
        </Text>
      </View>

      <View className="p-4">
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            className="bg-white dark:bg-gray-800 p-4 rounded-xl flex-row items-center shadow-sm mb-3"
            onPress={() => handlePress(item)}
          >
            <View className="w-8 items-center">
              <FontAwesome5
                name={item.icon as any}
                size={18}
                color={item.color && item.color.includes('text-') ? (item.color.includes('blue') ? '#2563EB' : (item.color.includes('green') ? '#10B981' : '#EF4444')) : (isDark ? '#E5E7EB' : '#4B5563')}
              />
            </View>
            <Text className={`flex-1 ml-3 font-medium ${item.color || 'text-gray-700 dark:text-gray-200'}`}>
              {item.label}
            </Text>
            <FontAwesome5 name="chevron-right" size={14} color={isDark ? '#4B5563' : '#D1D5DB'} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

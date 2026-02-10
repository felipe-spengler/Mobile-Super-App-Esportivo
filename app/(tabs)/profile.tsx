import { View, Text, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FontAwesome5, MaterialIcons, Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/context/AuthContext';
import { api } from '../../src/services/api';
import '../../global.css';

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, user, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);

  // If not logged in, show login prompt
  if (!user) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 justify-center items-center p-6">
        <FontAwesome5 name="user-circle" size={64} color="#9CA3AF" />
        <Text className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-2">Você não está logado</Text>
        <Text className="text-gray-500 dark:text-gray-400 text-center mb-6">
          Faça login para acessar suas inscrições, carteirinha e muito mais.
        </Text>
        <TouchableOpacity
          className="bg-indigo-600 w-full py-4 rounded-xl items-center"
          onPress={() => router.push('/login')}
        >
          <Text className="text-white font-bold">Fazer Login or Cadastro</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const MENU_GRID = [
    { label: 'Meus Times', icon: 'users', route: '/profile/teams', bg: 'bg-blue-100', color: 'text-blue-600', iconColor: '#2563EB' },
    { label: 'Inscrições', icon: 'trophy', route: '/inscription/my-inscriptions', bg: 'bg-yellow-100', color: 'text-yellow-600', iconColor: '#D97706' },
    { label: 'Meus Pedidos', icon: 'shopping-bag', route: '/profile/orders', bg: 'bg-purple-100', color: 'text-purple-600', iconColor: '#9333EA' },
    { label: 'Carteirinha', icon: 'id-card', route: '/wallet', bg: 'bg-indigo-100', color: 'text-indigo-600', iconColor: '#4F46E5' },
  ];

  async function handlePhotoUpdate() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;

      // Ask for BG Removal
      Alert.alert(
        "Remover Fundo com IA?",
        "Deseja remover o fundo da sua foto automaticamente para usar em artes?",
        [
          { text: "Não, Manter Original", onPress: () => uploadPhoto(uri, false) },
          { text: "Sim, Remover Fundo", onPress: () => uploadPhoto(uri, true) }, // style: 'default'
        ]
      );
    }
  }

  async function uploadPhoto(uri: string, removeBg: boolean) {
    setUploading(true);
    try {
      const formData = new FormData();

      // @ts-ignore
      formData.append('photo', {
        uri: uri,
        name: 'profile_photo.jpg',
        type: 'image/jpeg',
      });

      if (removeBg) {
        formData.append('remove_bg', '1');
      }

      const response = await api.post('/me/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update user context with new photo
      const data = response.data;
      const updatedUser = { ...user, photo_url: data.photo_nobg_url || data.photo_url };
      // @ts-ignore
      updateUser(updatedUser);

      Alert.alert("Sucesso", "Foto de perfil atualizada!");

    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao atualizar foto.");
    } finally {
      setUploading(false);
    }
  }

  async function handleLogout() {
    await signOut();
    router.replace('/(tabs)');
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="bg-white dark:bg-gray-800 p-6 pt-12 items-center border-b border-gray-100 dark:border-gray-700 shadow-sm rounded-b-[2rem]">
        <Text className="text-lg font-bold text-gray-800 dark:text-white mb-6">Meu Perfil</Text>

        <View className="relative mb-4">
          <View className="w-28 h-28 bg-gray-100 dark:bg-gray-700 rounded-full border-4 border-white dark:border-gray-600 shadow-lg items-center justify-center overflow-hidden">
            {uploading ? (
              <ActivityIndicator color="#4F46E5" />
            ) : user.photo_url ? (
              <Image source={{ uri: user.photo_url }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <FontAwesome5 name="user" size={48} color="#9CA3AF" />
            )}
          </View>
          <TouchableOpacity
            className="absolute bottom-0 right-0 bg-indigo-600 p-2.5 rounded-full shadow-md border-2 border-white dark:border-gray-800"
            onPress={handlePhotoUpdate}
            disabled={uploading}
          >
            <FontAwesome5 name="camera" size={14} color="white" />
          </TouchableOpacity>
        </View>

        <Text className="text-xl font-bold text-gray-900 dark:text-white text-center">
          {user.name}
        </Text>
        <View className="flex-row items-center mt-1 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
          <FontAwesome5 name="shield-alt" size={12} color="#4F46E5" />
          <Text className="text-indigo-600 dark:text-indigo-400 text-xs font-bold ml-2 uppercase">
            {user.role || 'Atleta'}
          </Text>
        </View>
      </View>

      <View className="p-4 space-y-6">

        {/* Admin Button */}
        {(user.is_admin || user.role === 'admin' || user.role === 'super_admin') && (
          <TouchableOpacity
            className="bg-gray-900 dark:bg-gray-700 p-4 rounded-2xl flex-row items-center justify-center shadow-lg"
            onPress={() => router.push('/admin/dashboard')} // Make sure route exists
          >
            <FontAwesome5 name="user-shield" size={20} color="white" />
            <Text className="text-white font-bold ml-3">Painel Administrativo</Text>
          </TouchableOpacity>
        )}

        {/* Grid Menu */}
        <View className="flex-row flex-wrap justify-between">
          {MENU_GRID.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="w-[48%] bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex-col items-center justify-center gap-3 mb-4 active:scale-[0.98]"
              onPress={() => router.push(item.route as any)}
            >
              <View className={`w-12 h-12 rounded-full items-center justify-center ${item.bg} dark:bg-opacity-20`}>
                <FontAwesome5 name={item.icon as any} size={20} color={item.iconColor} />
              </View>
              <Text className="font-bold text-gray-700 dark:text-gray-200 text-sm text-center">{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* List Menu */}
        <View className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <TouchableOpacity
            className="p-4 flex-row items-center border-b border-gray-50 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
            onPress={handlePhotoUpdate}
          >
            <View className="w-8 items-center"><Feather name="image" size={20} color="#6B7280" /></View>
            <Text className="flex-1 font-medium text-gray-700 dark:text-gray-200 ml-3">Alterar Foto de Perfil</Text>
            <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4 flex-row items-center border-b border-gray-50 dark:border-gray-700 active:bg-gray-50 dark:active:bg-gray-700"
            onPress={() => router.push('/settings')} // Or specific edit profile route
          >
            <View className="w-8 items-center"><Feather name="user" size={20} color="#6B7280" /></View>
            <Text className="flex-1 font-medium text-gray-700 dark:text-gray-200 ml-3">Dados Pessoais</Text>
            <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
          </TouchableOpacity>

          <TouchableOpacity
            className="p-4 flex-row items-center active:bg-red-50 dark:active:bg-red-900/10"
            onPress={handleLogout}
          >
            <View className="w-8 items-center"><Feather name="log-out" size={20} color="#EF4444" /></View>
            <Text className="flex-1 font-medium text-red-600 dark:text-red-400 ml-3">Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        <View className="h-8" />
      </View>
    </ScrollView>
  );
}

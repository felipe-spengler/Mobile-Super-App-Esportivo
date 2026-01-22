import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import api from '../../src/services/api';
import '../../global.css';
import { useAuth } from '../../src/context/AuthContext';
import ClubDashboard from '../../src/components/ClubDashboard';

type City = {
  id: number;
  name: string;
  state: string;
  slug: string;
};

type Club = {
  id: number;
  name: string;
  city_id: number;
  slug: string;
  colors: any;
};

export default function SportsHubScreen() {
  const router = useRouter();
  const { selectedClub, selectClub, loading: authLoading } = useAuth(); // Usar o contexto global

  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loadingClubs, setLoadingClubs] = useState(false);

  useEffect(() => {
    fetchCities();
  }, []);

  const fetchCities = async () => {
    try {
      const response = await api.get('/cities');
      setCities(response.data);
    } catch (error) {
      console.error('Erro ao buscar cidades', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClubs = async (citySlug: string, cityId: number) => {
    setLoadingClubs(true);
    try {
      const response = await api.get(`/cities/${citySlug}/clubs`);
      setClubs(response.data);
      setSelectedCityId(cityId);
    } catch (error) {
      console.error('Erro ao buscar clubes', error);
      alert('Erro ao buscar clubes. Verifique a conexão.');
    } finally {
      setLoadingClubs(false);
    }
  };

  const handleCityPress = (item: City) => {
    if (selectedCityId === item.id) {
      setSelectedCityId(null);
      setClubs([]);
    } else {
      fetchClubs(item.slug, item.id);
    }
  };

  const handleClubPress = (club: Club) => {
    console.log('Clube selecionado (Contexto):', club.name);
    selectClub(club); // Salva no contexto e renderiza o Dashboard automaticamente
  };

  // Se já tiver clube selecionado, mostra o Dashboard DENTRO DA TAB
  if (selectedClub) {
    return <ClubDashboard clubSlug={selectedClub.slug} onBack={() => selectClub(null)} />;
  }

  if (loading || authLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100 dark:bg-gray-900 p-4">
      <Text className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2 mt-8">Onde você quer jogar?</Text>
      <Text className="text-gray-500 dark:text-gray-400 mb-6">Selecione sua cidade e clube.</Text>

      <FlatList
        data={cities}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="mb-4">
            <TouchableOpacity
              className={`p-4 rounded-xl flex-row items-center justify-between border ${selectedCityId === item.id ? 'bg-blue-50 border-blue-500 dark:bg-blue-900/30' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}
              onPress={() => handleCityPress(item)}
            >
              <View className="flex-row items-center">
                <View className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center mr-3">
                  <MaterialIcons name="location-city" size={24} color="#555" />
                </View>
                <View>
                  <Text className="font-bold text-gray-800 dark:text-gray-100 text-lg">{item.name}</Text>
                  <Text className="text-gray-500 dark:text-gray-400">{item.state}</Text>
                </View>
              </View>
              <MaterialIcons
                name={selectedCityId === item.id ? "keyboard-arrow-up" : "keyboard-arrow-down"}
                size={24}
                color="#888"
              />
            </TouchableOpacity>

            {selectedCityId === item.id && (
              <View className="mt-2 ml-4 pl-4 border-l-2 border-gray-300 dark:border-gray-700">
                {loadingClubs ? (
                  <ActivityIndicator size="small" color="#555" className="py-2" />
                ) : (
                  clubs.map((club) => (
                    <TouchableOpacity
                      key={club.id}
                      className="bg-white dark:bg-gray-800 p-3 rounded-lg mb-2 shadow-sm flex-row items-center"
                      onPress={() => handleClubPress(club)}
                    >
                      <View className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full mr-3 items-center justify-center">
                        <FontAwesome5 name="shield-alt" size={14} color="#0044cc" />
                      </View>
                      <Text className="text-gray-700 dark:text-gray-200 font-medium">{club.name}</Text>
                    </TouchableOpacity>
                  ))
                )}
                {clubs.length === 0 && !loadingClubs && (
                  <Text className="text-gray-400 italic py-2">Nenhum clube encontrado nesta cidade.</Text>
                )}
              </View>
            )}
          </View>
        )}
      />
    </View>
  );
}

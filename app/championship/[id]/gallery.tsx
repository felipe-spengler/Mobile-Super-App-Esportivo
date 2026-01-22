
import { View, Text, FlatList, Image, TouchableOpacity, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useState } from 'react';
import '../../../global.css';

export default function GalleryScreen() {
    const router = useRouter();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // Mock Images
    const images = [
        { id: '1', uri: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=400&auto=format&fit=crop' },
        { id: '2', uri: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=400&auto=format&fit=crop' },
        { id: '3', uri: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?q=80&w=400&auto=format&fit=crop' },
        { id: '4', uri: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=400&auto=format&fit=crop' },
        { id: '5', uri: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=400&auto=format&fit=crop' },
        { id: '6', uri: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?q=80&w=400&auto=format&fit=crop' },
    ];

    return (
        <View className="flex-1 bg-black">
            <View className="pt-12 pb-4 px-4 flex-row items-center justify-between z-10 bg-black/50">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center bg-gray-800 rounded-full">
                    <MaterialIcons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text className="text-white text-lg font-bold">Galeria do Evento</Text>
                <View className="w-10" />
            </View>

            <FlatList
                data={images}
                keyExtractor={item => item.id}
                numColumns={3}
                contentContainerStyle={{ padding: 2 }}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        className="flex-1 aspect-square m-0.5 relative"
                        onPress={() => setSelectedImage(item.uri)}
                    >
                        <Image
                            source={{ uri: item.uri }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    </TouchableOpacity>
                )}
            />

            <Modal visible={!!selectedImage} transparent={true} animationType="fade">
                <View className="flex-1 bg-black justify-center items-center">
                    <TouchableOpacity
                        className="absolute top-12 right-6 z-20 p-2 bg-gray-800 rounded-full"
                        onPress={() => setSelectedImage(null)}
                    >
                        <MaterialIcons name="close" size={24} color="white" />
                    </TouchableOpacity>

                    {selectedImage && (
                        <Image
                            source={{ uri: selectedImage }}
                            className="w-full h-4/5"
                            resizeMode="contain"
                        />
                    )}
                </View>
            </Modal>
        </View>
    );
}

import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
// import { Camera, CameraView } from 'expo-camera'; // Commented out to prevent build error until installed

export default function AdminScanScreen() {
    const router = useRouter();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [mockCameraActive, setMockCameraActive] = useState(true);

    useEffect(() => {
        // Mock Permission
        setHasPermission(true);
    }, []);

    const handleBarCodeScanned = ({ type, data }: any) => {
        setScanned(true);
        Alert.alert(
            "Atleta Identificado",
            `Dados: ${data}`,
            [{ text: "OK", onPress: () => setScanned(false) }]
        );
    };

    if (hasPermission === null) {
        return <View className="flex-1 bg-black justify-center items-center"><Text className="text-white">Solicitando permissão...</Text></View>;
    }
    if (hasPermission === false) {
        return <View className="flex-1 bg-black justify-center items-center"><Text className="text-white">Sem acesso à câmera</Text></View>;
    }

    return (
        <View className="flex-1 bg-black">
            {/* Header Overlay */}
            <View className="absolute top-12 left-4 z-10">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 bg-black/50 rounded-full items-center justify-center border border-white/20">
                    <MaterialIcons name="close" size={24} color="white" />
                </TouchableOpacity>
            </View>

            <View className="flex-1 justify-center items-center overflow-hidden bg-gray-900 relative">
                {/* Simulated Camera View */}
                {mockCameraActive ? (
                    <View className="w-full h-full items-center justify-center">
                        <Text className="text-gray-500 mb-4">Câmera Simulada (Instalar expo-camera)</Text>
                        <View className="w-64 h-64 border-2 border-green-500 rounded-2xl items-center justify-center bg-white/5">
                            <View className="absolute top-0 left-0 w-4 h-4 border-l-4 border-t-4 border-green-500 rounded-tl-xl" />
                            <View className="absolute top-0 right-0 w-4 h-4 border-r-4 border-t-4 border-green-500 rounded-tr-xl" />
                            <View className="absolute bottom-0 left-0 w-4 h-4 border-l-4 border-b-4 border-green-500 rounded-bl-xl" />
                            <View className="absolute bottom-0 right-0 w-4 h-4 border-r-4 border-b-4 border-green-500 rounded-br-xl" />

                            <View className="h-[2px] w-full bg-red-500/50 absolute top-1/2" />
                        </View>

                        <TouchableOpacity
                            onPress={() => handleBarCodeScanned({ type: 'qr', data: 'Felipe Spengler - 123.456.789-00' })}
                            className="mt-8 bg-green-600 px-6 py-3 rounded-full"
                        >
                            <Text className="text-white font-bold">Simular Leitura</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // <CameraView
                    //     onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                    //     barcodeScannerSettings={{
                    //         barcodeTypes: ["qr", "pdf417"],
                    //     }}
                    //     style={StyleSheet.absoluteFillObject}
                    // />
                    <Text className="text-white">Camera Component Disabled</Text>
                )}
            </View>

            {/* Bottom Overlay */}
            <View className="absolute bottom-0 w-full p-8 items-center bg-gradient-to-t from-black to-transparent">
                <Text className="text-white font-bold text-lg mb-1">Escanear Carteirinha</Text>
                <Text className="text-gray-300 text-center text-sm">Posicione o QR Code dentro da área marcada.</Text>
            </View>
        </View>
    );
}

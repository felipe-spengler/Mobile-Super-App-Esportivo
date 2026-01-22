
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

// Configurar como as notificações aparecem quando o app está aberto
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function registerForPushNotificationsAsync() {
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            console.log('Permissão para notificações negada!');
            return;
        }

        // Obter o token
        try {
            const tokenData = await Notifications.getExpoPushTokenAsync({
                // projectId: 'seu-project-id' // Caso precise configurar no app.json
            });
            token = tokenData.data;
            console.log("Expo Push Token:", token);

            // Enviar para o backend (se logado)
            // Como essa função pode ser chamada em vários momentos, 
            // idealmente verificamos se temos token de usuário ou deixamos o componente chamar o update.
        } catch (e) {
            console.log("Erro ao pegar token push:", e);
        }
    } else {
        console.log('Must use physical device for Push Notifications');
    }

    return token;
}

export async function syncPushToken(token: string) {
    try {
        await api.put('/me', { device_token: token });
        console.log("Token sincronizado com backend");
    } catch (error) {
        console.log("Erro ao sincronizar token com backend", error);
    }
}

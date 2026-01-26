import axios from 'axios';
import { Platform } from 'react-native';

// Use seu IP da máquina se estiver testando em dispositivo físico
// Android Emulator usa 10.0.2.2
// iOS Simulator usa localhost
// URL de Produção/Teste (VPS)
const BASE_URL = 'http://w00wks0scwg08k08owg4sw4g.145.223.30.211.sslip.io/api';

// Configuração Local Anterior (comentada para referência)
// const BASE_URL = Platform.OS === 'android'
//     ? 'http://10.0.2.2:8000/api'
//     : 'http://localhost:8000/api';

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    timeout: 10000,
});

// Interceptor para logs (debug)
import AsyncStorage from '@react-native-async-storage/async-storage';

// Interceptor para logs (debug) e Token
api.interceptors.request.use(async (request) => {
    console.log('API Request:', request.method?.toUpperCase(), request.url);

    // Injetar Token se existir
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
        request.headers.Authorization = `Bearer ${token}`;
    }

    return request;
});

api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error.response?.status, error.response?.data);
        return Promise.reject(error);
    }
);

export { api };

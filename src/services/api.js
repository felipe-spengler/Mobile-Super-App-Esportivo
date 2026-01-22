import axios from 'axios';
import { Platform } from 'react-native';

// Android Emulador: 10.0.2.2
// iOS Simulator: localhost
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api' : 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor para adicionar token se existir (vamos implementar auth depois)
// api.interceptors.request.use(async config => {
//   const token = await AsyncStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export default api;

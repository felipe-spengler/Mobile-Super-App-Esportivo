import axios from 'axios';
import { Platform, Alert } from 'react-native';

// Android Emulador: 10.0.2.2
// iOS Simulator: localhost
// VPS: 145.223.30.211
// const API_URL = 'http://145.223.30.211:8000/api';
const API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:8000/api' : 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

// Interceptor de Resposta para tratamento de erros global
api.interceptors.response.use(
    response => response,
    error => {
        if (error.response) {
            // O servidor respondeu com um status code fora de 2xx
            const status = error.response.status;
            const data = error.response.data;

            if (status >= 500) {
                // Erro no Servidor
                const message = data.message || 'Erro interno do servidor';
                const exception = data.exception || '';
                Alert.alert('Erro do Sistema', `${message}\n${exception}`);
            } else if (status === 404) {
                // Não encontrado (ignorar ou avisar dependendo do caso)
                // console.warn('Recurso não encontrado:', error.config.url);
            } else {
                // Outros erros (400, 422 etc)
                // const message = data.message || 'Erro na requisição';
                // Alert.alert('Atenção', message);
            }
        } else if (error.request) {
            // A requisição foi feita mas não houve resposta
            Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor backend.');
        } else {
            // Algo aconteceu ao configurar a requisição
            Alert.alert('Erro', error.message);
        }
        return Promise.reject(error);
    }
);

export default api;

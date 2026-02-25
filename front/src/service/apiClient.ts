import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
// Aseguramos que el baseURL siempre termine en /api
const API_BASE_URL = baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor de peticiones para añadir el token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Interceptor de respuestas para manejo centralizado de errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    let message = 'Ocurrió un error inesperado';

    if (error.response) {
      // El servidor respondió con un status fuera del rango 2xx
      const data = error.response.data as any;
      message = data?.message || `Error ${error.response.status}: ${error.response.statusText}`;

      if (error.response.status === 404) {
        console.error('Recurso no encontrado (404):', error.config?.url);
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      message = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else {
      // Algo pasó al configurar la petición
      message = error.message;
    }

    // Podemos crear una propiedad personalizada 'friendlyMessage'
    error.friendlyMessage = message;
    return Promise.reject(error);
  }
);

export default apiClient;



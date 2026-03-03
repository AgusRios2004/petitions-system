import axios, { AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

if (!baseUrl && typeof window !== 'undefined') {
  console.warn('⚠️ NEXT_PUBLIC_API_URL is not defined. Falling back to http://localhost:3000');
}

let finalBaseUrl = baseUrl || 'http://localhost:3000';

// Asegurar que tenga protocolo si no es una ruta relativa
if (finalBaseUrl && !finalBaseUrl.startsWith('http') && !finalBaseUrl.startsWith('/')) {
  finalBaseUrl = `https://${finalBaseUrl}`;
}

export const API_BASE_URL = finalBaseUrl.endsWith('/api') ? finalBaseUrl : `${finalBaseUrl}/api`;

if (typeof window !== 'undefined') {
  console.log('🚀 API Base URL:', API_BASE_URL);
}

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

interface ApiErrorResponse {
  message?: string;
}

interface CustomAxiosError extends AxiosError<ApiErrorResponse> {
  friendlyMessage?: string;
}

// Interceptor de respuestas para manejo centralizado de errores
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    let message = 'Ocurrió un error inesperado';

    if (error.response) {
      // El servidor respondió con un status fuera del rango 2xx
      const data = error.response.data;
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
    (error as CustomAxiosError).friendlyMessage = message;
    return Promise.reject(error);
  }
);


export default apiClient;



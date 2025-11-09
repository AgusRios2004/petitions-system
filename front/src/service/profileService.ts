import apiClient from './apiClient';
import { ApiResponse, IProfile } from '@/types/common';

export async function getProfile():  Promise<ApiResponse<IProfile[]>>{
    try {
        const response = await apiClient.get('/profile/me');
        return {data: response.data, error: null}
    } catch (e: any) {
        const errorMessage = e.response?.data?.message || e.message || 'Ocurrió un error desconocido.'
        console.error('Eror: ', e);
        return { data: null, error: errorMessage };
    }
}
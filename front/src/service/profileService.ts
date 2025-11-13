import apiClient from './apiClient';
import { ApiResponse, IProfile, IUser } from '@/types/common';

export async function getProfile():  Promise<ApiResponse<IProfile>>{
    try {
        const response = await apiClient.get('/profile/me');
        return {data: response.data, error: null}
    } catch (e: any) {
        const errorMessage = e.response?.data?.message || e.message || 'Ocurrió un error desconocido.'
        console.error('Eror: ', e);
        return { data: null, error: errorMessage };
    }
}

export async function updateUser(userId: number, payload: Partial<IUser>): Promise<IUser> {
    try {
        const response = await apiClient.put<ApiResponse<IUser>>(`/profile/user/${userId}`, payload);
        const updatedUser = response.data.data;
        if (updatedUser) {
            return updatedUser;
        } else {
            throw new Error(response.data?.error || 'La API no retornó datos actualizados del usuario.');
        }
    } catch (e: any) {
        console.error('Error al actualizar el usuario:', e);
        const errorMessage = e.response?.data?.error || 'No se pudo actualizar el perfil del usuario.';
        throw new Error(errorMessage);
    }
}

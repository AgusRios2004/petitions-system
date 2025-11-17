import apiClient from './apiClient';
import { IUser } from '@/types/common';

interface UpdateUserPayload {
    name?: string, 
    lastname?: string,
    email?: string,
}

const updateUser = async (userId: number, payload: UpdateUserPayload): Promise<IUser> => {
    try {
        const response = await apiClient.put<{ data: IUser }>(`/profile/user/${userId}`, payload);
        return response.data.data;
    } catch (e: any) {
        console.error("Error: ", e);
        throw new Error("Error al actualizar el usuario")
    } 
}

export const userService = {
    updateUser,
}
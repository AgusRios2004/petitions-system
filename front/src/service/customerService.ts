import apiClient from "./apiClient";
import { ICustomer, ApiResponse, ProfileFormData } from "@/types/common";
import axios from "axios";

const getCustomerById = async (customerId: number): Promise<ICustomer> => {
    try {
        const response = await apiClient.get<ApiResponse<ICustomer>>(`/customer/${customerId}`);
        const customerData = response.data.data;
        if (customerData) {
            return customerData;
        } else {
            throw new Error(response.data?.error || 'La respuesta de la API no contiene los datos del cliente.');
        }
    } catch (e) {
        console.error(e);
        if (axios.isAxiosError(e)) {
            const errorMessage = e.response?.data?.error || 'No se pudo obtener el perfil del cliente.';
            throw new Error(errorMessage);
        }
        throw new Error('No se pudo obtener el perfil del cliente.');
    }
}

const updateCustomer = async (customerId: number, payload: ProfileFormData): Promise<ICustomer> => {
    try {
        const response = await apiClient.put<ApiResponse<ICustomer>>(`/customer/${customerId}`, payload);
        const updatedCustomer = response.data.data;
        if (updatedCustomer) {
            return updatedCustomer;
        } else {
            throw new Error(response.data?.error || 'La API no retornó datos actualizados del cliente.');
        }
    } catch (e) {
        console.error('Error al actualizar el cliente:', e);
        if (axios.isAxiosError(e)) {
            const errorMessage = e.response?.data?.error || 'No se pudo actualizar el perfil del cliente.';
            throw new Error(errorMessage);
        }
        throw new Error('No se pudo actualizar el perfil del cliente.');
    }
};

export const customerService = {
    getCustomerById,
    updateCustomer,
}
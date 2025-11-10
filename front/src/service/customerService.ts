import apiClient from "./apiClient";
import { ICustomer, ApiResponse } from "@/types/common";

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
        throw new Error('No se pudo obtener el perifl del cliente.');
    }
}

export const customerService = {
    getCustomerById
}
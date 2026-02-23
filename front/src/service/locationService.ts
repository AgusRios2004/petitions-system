import apiClient from "./apiClient";
import { Country, Province, City, Department } from '@/types/common';

// Devuelve los datos directamente o lanza un error, como espera useQuery.
export const locationService = {
  getCountries: async (): Promise<Country[]> => {
    try {
      const response = await apiClient.get('/countries');
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching countries:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener los países');
    }
  },
  getProvincesByCountry: async (countryId: number): Promise<Province[]> => {
    try {
      const response = await apiClient.get(`/provinces/${countryId}/countries`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching provinces by country:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener las provincias');
    }
  },
  getDepartmentsByProvince: async (provinceId: number): Promise<Department[]> => {
    try {
      const response = await apiClient.get(`/departments/${provinceId}/provinces`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching departments by province:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener los departamentos');
    }
  },
  getCitiesByDepartment: async (departmentId: number): Promise<City[]> => {
    try {
      const response = await apiClient.get(`/cities/${departmentId}/departments`);
      return response.data.data;
    } catch (error: any) {
      console.error('Error fetching cities by department:', error);
      throw new Error(error.response?.data?.error || 'Error al obtener las ciudades');
    }
  },
};

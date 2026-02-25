import apiClient from "./apiClient";
import { Country, Province, City, Department } from '@/types/common';

// Devuelve los datos directamente o lanza un error, como espera useQuery.
export const locationService = {
  getCountries: async (): Promise<Country[]> => {
    try {
      const response = await apiClient.get('/countries');
      return response.data.data;
    } catch (error: unknown) {
      const err = error as any;
      console.error('Error fetching countries:', err);
      throw new Error(err.response?.data?.error || 'Error al obtener los países');
    }
  },
  getProvincesByCountry: async (countryId: number): Promise<Province[]> => {
    try {
      const response = await apiClient.get(`/provinces/${countryId}/countries`);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as any;
      console.error('Error fetching provinces by country:', err);
      throw new Error(err.response?.data?.error || 'Error al obtener las provincias');
    }
  },
  getDepartmentsByProvince: async (provinceId: number): Promise<Department[]> => {
    try {
      const response = await apiClient.get(`/departments/${provinceId}/provinces`);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as any;
      console.error('Error fetching departments by province:', err);
      throw new Error(err.response?.data?.error || 'Error al obtener los departamentos');
    }
  },
  getCitiesByDepartment: async (departmentId: number): Promise<City[]> => {
    try {
      const response = await apiClient.get(`/cities/${departmentId}/departments`);
      return response.data.data;
    } catch (error: unknown) {
      const err = error as any;
      console.error('Error fetching cities by department:', err);
      throw new Error(err.response?.data?.error || 'Error al obtener las ciudades');
    }
  },
};

import { ApiResponse, TypePetition } from "@/WebApiResponse/api";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function getTypePetitions(): Promise<ApiResponse<TypePetition[]>> {
    try {
        const response = await fetch(`${API_BASE_URL}/type-petitions`);
        if (!response.ok) {
            throw new Error(`Error fetching type petitions: ${response.statusText}`);
        }
        const data: TypePetition[] = await response.json();
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
}

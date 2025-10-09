import { ApiResponse, Profession } from "@/WebApiResponse/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function getProfessions(): Promise<ApiResponse<Profession[]>> {
    try {
        const response = await fetch(`${API_BASE_URL}/professions`);
        if (!response.ok) {
            throw new Error(`Error fetching professions: ${response.statusText}`);
        }
        const data: Profession[] = await response.json();
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
}

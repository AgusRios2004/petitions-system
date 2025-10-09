import { ApiResponse, TypeProvider } from "@/WebApiResponse/api";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function getTypeProviders(): Promise<ApiResponse<TypeProvider[]>> {
    try {
        const response = await fetch(`${API_BASE_URL}/type-providers`);
        if (!response.ok) {
            throw new Error(`Error fetching type providers: ${response.statusText}`);
        }
        const data: TypeProvider[] = await response.json();
        return { data, error: null };
    } catch (error: any) {
        return { data: null, error: error.message };
    }
}

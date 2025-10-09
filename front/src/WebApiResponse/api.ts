export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
};

export interface Profession {
    id: number;
    name: string;
};

export interface TypePetition {
    id: number;
    name: string;
};

export interface TypeProvider {
    id: number;
    name: string;
};
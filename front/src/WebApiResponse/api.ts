export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
};

export interface Profession {
    id_profession: number;
    name: string;
};

export interface TypePetition {
    id_type_petition: number;
    name: string;
};

export interface TypeProvider {
    id_type_provider: number;
    name: string;
};
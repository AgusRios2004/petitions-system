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

export interface Country {
    id_country: number;
    name: string;
};

export interface Province {
    id_province: number;
    name: string;
};

export interface Department {
    id_department: number;
    name: string;
};

export interface City {
    id_city: number;
    name: string;
};
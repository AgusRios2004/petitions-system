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

export interface IArticle {
    id_article: number;
    name: string | null;
    id_category: number;
    id_user_create: number;
    id_user_update?: number | null;
    date_create: string; 
    date_update: string;
    // Associations
    category?: any; 
    createdBy?: any; 
    updatedBy?: any; 
    inventories?: IInventory[];
  }
  
export interface IInventory {
    id_inventory: number;
    id_article: number;
    cost: number;
    id_postulation?: number | null;
    id_user_update?: number | null;
    id_user_create?: number | null;
    date_update?: string | null;
    date_create?: string | null;
    quantity: number;
    // Associations
    article?: IArticle;
    postulation?: any; 
    userUpdate?: any; 
    userCreate?: any; 
}

export interface ICategory {
    id_category: number,
    name: string,
}
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

export interface IPostulation {
  id_postulation: number;
  proposal: string;
  cost: number;
  winner: boolean;
  date_create: string;
  date_update: string | null;
  createdBy: {
    id_user: number;
    name: string;
    lastname: string,
    provider: {
      id_provider: number;

    };
  };
  states: {
    id_state: number;
    state: string;
  };
  petition: {
    id_petition: number;
    description: string;
    id_customer: number;
    customers: {
      id_customer: number;
      user_id: number;
    };
  };
  inventories: IInventory[];
  id_provider: number;
}

export interface IWeek {
  id_week: number;
  name: string;
}

export interface IHour {
  id_hour: number;
  name: string;
}

// New IAddress interface
export interface IAddress {
  id_address: number;
  street: string;
  number: string;
  floor?: string;
  apartment?: string;
  postal_code: string;
  city: City; // Use the existing City interface
}

// Updated IAvailability interface (removed provider field)
export interface IAvailability {
  id_availability: number;
  week: IWeek;
  fromHour: IHour;
  untilHour: IHour;
};

// Updated IProvider interface
export interface IProvider {
  id_provider: number;
  user: {
    id_user: number;
    name: string;
    lastname: string;
    profile_image: string | null;
  };
  typeProvider: TypeProvider;
  profession: Profession;
  address: IAddress; // Use the new IAddress interface
  availabilities?: IAvailability[]; // Now an array of IAvailability
  grades?: {
    id_grade: number;
    score: number;
  }[]; // grades can be multiple
  portfolio?: {
    id_portfolio: number;
    description: string;
    link: string;
  }[];
  providerCategories?: {
    id_provider_category: number;
    category: {
      id_category: number;
      name: string;
    };
  }[];
}

export interface IUser {
  id_user: number;
  name: string;
  email: string;
  lastname: string;
  profile_image?: string | null;
  role_id?: number; 
}

export interface IGender {
  id_gender: number;
  gender: string;
}

export interface IInterest {
  id_interest: number;
  category: ICategory;
}

export interface ICustomer {
  id_customer: number;
  user_id: number;
  dni: string;
  phone: string;
  id_gender: number;
  gender: IGender;
  interest: IInterest;
  address: IAddress;
}

export interface IProfile extends IUser {
  customer?: ICustomer;
  provider?: IProvider;
}

export interface UserProfile {
  id_user: number; 
  name: string;
  lastname: string;
  email: string;
  address: {
    address: IAddress;
  };
  customer: ICustomer | null;
  provider: {
    id_provider: number;
  } | null;
  profile_picture_url?: string | null;
  role: 'customer' | 'provider' | 'admin' | 'unknown';
  is_staff?: boolean | number
}

export interface ProfileFormData {
  dni: string;
  phone: string;
  id_gender: number;
  address: {
    id_address: number;
    street: string;
    number: string;
    floor?: string;
    apartment?: string;
    postal_code: string;
    id_city: number;
  };
}

export interface UpdateCustomerPayload {
  dni: string;
  phone: string;
  address: {
    id_address: number | undefined;
    street: string;
    number: string;
    floor?: string;
    apartment?: string;
    postal_code: string;
    id_city: number;
  };
  id_interest?: number;
}
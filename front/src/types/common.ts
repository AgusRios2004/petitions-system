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
}

export interface IAvailability {
  id_availability: number;
  provider: {
    id_provider: number,
    user: {
      id_user: number,
      name: string,
      lastname: string,
    },
  },
  week: {
    id_week: number,
    name: string,
  },
  fromHour: {
    id_hour: number,
    name: string,
  },
  untilHour: {
    id_hour: number,
    name: string,
  },
};

export interface IWeek {
  id_week: number;
  name: string;
}

export interface IHour {
  id_hour: number;
  name: string;
}

export interface IProvider {
  id_provider: number;
  user: {
    id_user: number;
    name: string;
    lastname: string;
    profile_image: string | null;
  };
  typeProvider: {
    id_type_provider: number;
    name: string;
  };
  profession: {
    id_profession: number;
    name: string;
  };
  address: {
    id_address: number;
    street: string;
    number: string;
  };
  availabilities?: {
    id_availability: number;
    week: {
      id_week: number;
      name: string;
    };
    fromHour: {
      id_hour: number;
      name: string;
    };
    untilHour: {
      id_hour: number;
      name: string;
    };
  };
  grades?: {
    id_grade: number;
    score: number;
  }
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
  }
}
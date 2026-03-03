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
  country: Country;
};

export interface Department {
  id_department: number;
  name: string;
  province: Province;
};

export interface City {
  id_city: number;
  name: string;
  department: Department;
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
  category?: ICategory;
  createdBy?: IUser;
  updatedBy?: IUser;
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
  postulation?: IPostulation;
  userUpdate?: IUser;
  userCreate?: IUser;
}

export interface ICategory {
  id_category: number;
  name: string;
}

export interface IPostulation {
  id_postulation: number;
  proposal: string;
  cost: number;
  winner: boolean;
  date_create: string;
  date_update: string | null;
  provider: IProvider; // Objeto del proveedor que se postula
  createdBy: {
    id_user: number;
    name: string;
    lastname: string;
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
export interface ILoginPayload {
  email: string;
  password: string;
}

export interface ILoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: IUser & {
    customer?: ICustomer | null;
    provider?: IProvider | null;
    is_staff: boolean | number;
  };
}

export interface IRegisterPayload {
  name: string;
  lastname: string;
  email: string;
  password: string;
  role: string;
  address: AddressPayload;
  dni?: string;
  phone?: string;
  professionId?: string | number;
  typeProviderId?: string | number;
  description?: string;
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
  user: IUser;
  typeProvider: TypeProvider;
  profession: Profession;
  address: IAddress; // Use the new IAddress interface
  availabilities?: IAvailability[]; // Now an array of IAvailability
  // Ajustado para coincidir con la respuesta real de la API
  grades?: {
    id_grade_provider: number;
    coment: string;
    grades: { // Objeto 'Grade' anidado
      id_grade: number;
      grade_number: number;
    };
  }[];
  portfolios?: IPortfolioItem[];
  providerCategories?: IProviderCategory[];
}

export interface IUser {
  id_user: number;
  name: string;
  email: string;
  lastname: string;
  profile_image?: string | null;
  role_id?: number;
  date_create: string;
}

export interface IGender {
  id_gender: number;
  gender: string;
}

export interface IInterest {
  id_interest: number;
  category: ICategory;
}

export interface IPetition {
  id_petition: number;
  id_customer: number;
  description: string;
}

export interface ICustomer {
  id_customer: number;
  user_id: number;
  dni: string;
  phone: string;
  id_gender: number;
  gender: IGender;
  interests: IInterest[]; // Changed from singular 'interest' to plural 'interests'
  address: IAddress;
  petitions: IPetition[];
  user: IUser;
}

/**
 * Representa los datos necesarios para una tarjeta de petición (PetitionCard).
 * Contiene información resumida de la petición, el cliente y sus postulaciones.
 */
export interface IPetitionCardData {
  id_petition: number;
  description: string;
  date_create: string;
  date_since: string;
  date_until: string;
  states: {
    state: string;
  };
  typePetitions: {
    name: string;
  };
  id_customer: number;
  customers: {
    dni: string;
    phone: string;
    user: Pick<IUser, 'name' | 'lastname'>;
    average_rating: number | null;
  };
  postulations: Pick<IPostulation, 'id_provider' | 'states' | 'provider'>[];
  petitionCategories?: { category: ICategory }[];
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
  address?: {
    address: IAddress;
  };
  customer: ICustomer | null;
  provider: {
    id_provider: number;
    id_type_provider?: number;
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

export interface AddressPayload {
  id_address?: number;
  street: string;
  number: string;
  floor?: string;
  apartment?: string;
  postal_code: string;
  id_city: number;
}

export interface UpdateCustomerPayload {
  dni: string;
  phone: string;
  address: AddressPayload;
  id_interest?: number;
}

export interface UpdateProviderPayload {
  description?: string;
  id_profession?: number;
  id_type_provider: number;
  address?: AddressPayload;
}

export interface IAttachment {
  path: string; // El nombre del archivo que te devuelve multer
  name: string;
}

export interface IPortfolioItem {
  id_portfolio: number;
  name: string;
  description: string;
  date_crete: Date;
  attachments: IAttachment[];
}

export interface IProviderCategory {
  id: number;
  category: ICategory;
}

export interface IGradeForm {
  id_provider?: number;
  id_customer?: number;
  comment: string;
  grade_number: number;
  id_user_create?: number;
  id_color?: number;
};

export interface IGrade {
  id_grade: number;
  id_provider?: number;
  id_customer?: number;
  comment: string;
  grade_number: number;
  date_create: string;
  provider?: IProvider;
  customer?: ICustomer;
};

export interface Notification {
  id: number;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_petition_id?: number;
  related_postulation_id?: number;
}

/**
 * Representa un único mensaje dentro de una conversación.
 * Coincide con la respuesta de `getMessagesByConversation` y `createMessage`.
 */
export interface IMessage {
  id_message: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  created_at: string;
  read: boolean;
  sender: Pick<IUser, 'id_user' | 'name' | 'lastname' | 'profile_image'>;
}

/**
 * Representa una conversación en la bandeja de entrada.
 * Coincide con la respuesta de `getConversationsForUser`.
 */
export interface IConversationPreview {
  id_conversation: number;
  last_message_content: string | null;
  last_message_date: string | null;
  // La consulta del backend está diseñada para devolver solo al otro usuario en este array.
  users: Pick<IUser, 'id_user' | 'name' | 'lastname' | 'profile_image'>[];
}

export interface IState {
  id_state: number;
  state: string;
  code: string;
  description?: string;
}

export interface ITypeOffer {
  id_type_offer: number;
  name: string;
}

export interface IOffer {
  offer_id: number;
  id_provider: number;
  id_type_offer: number;
  name: string;
  description: string;
  date_create: string;
  date_open?: string;
  date_close?: string;
  typeOffer?: ITypeOffer;
  provider?: {
    id_provider: number;
    user: {
      name: string;
      lastname: string;
      profile_image?: string | null;
    }
  };
}

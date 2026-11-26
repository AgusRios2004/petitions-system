'use client';
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios, { AxiosError } from 'axios';
import { API_BASE_URL } from '@/service/apiClient';
import {
  ICustomer,
  IProvider,
  IUser,
  IRegisterPayload,
  ILoginResponse
} from '@/types/common';
import {
  deriveCapabilities,
  resolveMode,
  readStoredMode,
  writeStoredMode,
  clearStoredMode,
  Mode,
} from '@/lib/roles';

// --- TIPOS ---
export interface AuthUser extends IUser {
  customer?: ICustomer | null;
  provider?: IProvider | null;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isCustomer: boolean;
  isProvider: boolean;
  activeMode: Mode | null;
  setActiveMode: (mode: Mode) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: IRegisterPayload) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updatedData: Partial<AuthUser>) => void;
}

// --- CONTEXTO ---
export const AuthContext = createContext<AuthContextType | null>(null);

// --- API ---
const authApi = axios.create({ baseURL: `${API_BASE_URL}/auth` });


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [storedMode, setStoredMode] = useState<Mode | null>(null);

  // Inicializa desde localStorage (token + user)
  useEffect(() => {
    const initFromStorage = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
      const rawUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;

      if (token) {
        authApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }

      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          const customer = parsed.customer ?? null;
          const provider = parsed.provider ?? null;

          setUser({
            id_user: parsed.id_user,
            name: parsed.name,
            lastname: parsed.lastname,
            email: parsed.email,
            profile_image: parsed.profile_image ?? null,
            customer,
            provider,
            date_create: parsed.date_create ?? '',
          });
        } catch (err) {
          console.warn('No se pudo parsear user desde localStorage', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setStoredMode(readStoredMode());
      setLoading(false);
    };

    initFromStorage();
  }, []);

  const saveUserToStorage = (u: AuthUser) => {
    try {
      localStorage.setItem('user', JSON.stringify(u));
    } catch (err) {
      console.warn('Error guardando user en localStorage', err);
    }
  };

  const updateUser = (updatedData: Partial<AuthUser>) => {
    setUser(prevUser => {
      if (!prevUser) return null;

      const newUser = { ...prevUser, ...updatedData };

      // Deep merge for customer and provider objects
      if (updatedData.customer) {
        newUser.customer = { ...prevUser.customer, ...updatedData.customer } as ICustomer;
      }
      if (updatedData.provider) {
        newUser.provider = { ...prevUser.provider, ...updatedData.provider } as IProvider;
      }

      saveUserToStorage(newUser);
      return newUser;
    });
  };

  // --- AUTH ACTIONS ---
  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.post<ILoginResponse>('/login', { email, password });
      const { accessToken, refreshToken, user: basicUser } = response.data;

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      authApi.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      const u: AuthUser = {
        id_user: basicUser.id_user,
        name: basicUser.name,
        lastname: basicUser.lastname,
        email: basicUser.email,
        profile_image: basicUser.profile_image ?? null,
        customer: basicUser.customer ?? null,
        provider: basicUser.provider ?? null,
        date_create: basicUser.date_create,
      };

      setUser(u);
      saveUserToStorage(u);

      return { success: true };
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      console.error('Error en el login:', err.response?.data || err.message);
      return { success: false, message: err.response?.data?.message || 'Error al iniciar sesión' };
    }
  };

  const register = async (payload: IRegisterPayload) => {
    try {
      await authApi.post('/register', payload);
      return { success: true };
    } catch (error: unknown) {
      const err = error as AxiosError<{ message?: string }>;
      console.error('Error en el registro:', err.response?.data || err.message);
      return { success: false, message: err.response?.data?.message || 'Error al registrarse' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('pending_profile_role');
    clearStoredMode();
    delete authApi.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  };

  const { isCustomer, isProvider } = deriveCapabilities(user);
  // Siempre un modo que el usuario puede usar (o null si no tiene perfiles).
  const activeMode = resolveMode({ isCustomer, isProvider }, storedMode);

  const setActiveMode = (mode: Mode) => {
    setStoredMode(mode);
    writeStoredMode(mode);
  };

  const value: AuthContextType = {
    user,
    loading,
    isCustomer,
    isProvider,
    activeMode,
    setActiveMode,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used dentro de AuthProvider');
  }
  return context;
};

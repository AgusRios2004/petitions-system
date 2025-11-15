'use client';
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

// --- TIPOS ---
interface User {
  id_user: number;
  name: string;
  lastname: string;
  email: string;
  profile_image?: string | null;
  customer?: any | null;
  provider?: any | null;
  role: 'provider' | 'customer' | 'admin' | 'unknown';
  is_staff?: boolean | number;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (payload: any) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUser: (updatedData: Partial<User>) => void;
}

// --- CONTEXTO ---
export const AuthContext = createContext<AuthContextType | null>(null);

// --- API ---
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const authApi = axios.create({ baseURL: `${API_BASE}/api/auth` });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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
          const role =
            (parsed.is_staff === true || parsed.is_staff === 1)
              ? 'provider'
              : 'customer';

          setUser({
            id_user: parsed.id_user,
            name: parsed.name,
            lastname: parsed.lastname,
            email: parsed.email,
            profile_image: parsed.profile_image ?? null,
            customer: parsed.customer ?? null,
            provider: parsed.provider ?? null,
            role,
            is_staff: parsed.is_staff ?? false,
          });
        } catch (err) {
          console.warn('No se pudo parsear user desde localStorage', err);
          setUser(null);
        }
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    initFromStorage();
  }, []);

  const saveUserToStorage = (u: User) => {
    try {
      localStorage.setItem('user', JSON.stringify(u));
    } catch (err) {
      console.warn('Error guardando user en localStorage', err);
    }
  };

  const updateUser = (updatedData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;

      const newUser = { ...prevUser, ...updatedData };

      // Deep merge for customer and provider objects
      if (updatedData.customer) {
        newUser.customer = { ...prevUser.customer, ...updatedData.customer };
      }
      if (updatedData.provider) {
        newUser.provider = { ...prevUser.provider, ...updatedData.provider };
      }
      
      saveUserToStorage(newUser);
      return newUser;
    });
  };

  // --- AUTH ACTIONS ---
  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.post('/login', { email, password });
      const { accessToken, refreshToken, user: basicUser } = response.data;

      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      authApi.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

      const role =
        (basicUser.is_staff === true || basicUser.is_staff === 1)
          ? 'provider'
          : 'customer';

      const u: User = {
        id_user: basicUser.id_user,
        name: basicUser.name,
        lastname: basicUser.lastname,
        email: basicUser.email,
        profile_image: basicUser.profile_image ?? null,
        customer: basicUser.customer ?? null,
        provider: basicUser.provider ?? null,
        is_staff: basicUser.is_staff ?? false,
        role,
      };

      setUser(u);
      saveUserToStorage(u);

      return { success: true };
    } catch (error: any) {
      console.error('Error en el login:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'Error al iniciar sesión' };
    }
  };

  const register = async (payload: any) => {
    try {
      await authApi.post('/register', payload);
      return { success: true };
    } catch (error: any) {
      console.error('Error en el registro:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'Error al registrarse' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('pending_profile_role');
    delete authApi.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    loading,
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

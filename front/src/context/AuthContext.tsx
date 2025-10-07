"use client";
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Define the shape of the User object to match the backend response
interface User {
  id_user: number;
  name: string;
  lastname: string;
  email: string;
  profileStatus: {
    isCustomerComplete: boolean;
    isProviderComplete: boolean;
    hasCompletedProfile: boolean;
  };
}

// Define the shape of the context value
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, lastname: string, email: string, password: string, role: 'customer' | 'provider' | 'both') => Promise<{ success: boolean; message?: string }>;
  markProfileComplete: () => void;
  logout: () => void;
}

// 1. Create the Context
export const AuthContext = createContext<AuthContextType | null>(null);

// API instances
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const authApi = axios.create({ baseURL: `${API_BASE}/api/auth` });

// 2. Create the Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initFromStorage = () => {
      const token = localStorage.getItem('accessToken');
      const rawUser = localStorage.getItem('user');
      if (token && rawUser) {
        try {
          const parsed = JSON.parse(rawUser);
          const pendingRole = localStorage.getItem('pending_profile_role');
          const isCustomerComplete = pendingRole === 'provider' ? true : pendingRole === 'both' ? false : pendingRole ? false : true;
          const isProviderComplete = pendingRole === 'customer' ? true : pendingRole === 'both' ? false : pendingRole ? false : true;
          setUser({
            id_user: parsed.id_user,
            name: parsed.name,
            lastname: parsed.lastname,
            email: parsed.email,
            profileStatus: {
              isCustomerComplete,
              isProviderComplete,
              hasCompletedProfile: isCustomerComplete || isProviderComplete,
            },
          });
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };
    initFromStorage();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.post('/login', { email, password });
      const { accessToken, refreshToken, user: basicUser } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(basicUser));

      const pendingRole = localStorage.getItem('pending_profile_role');
      const isCustomerComplete = pendingRole === 'provider' ? true : pendingRole === 'both' ? false : pendingRole ? false : true;
      const isProviderComplete = pendingRole === 'customer' ? true : pendingRole === 'both' ? false : pendingRole ? false : true;

      setUser({
        id_user: basicUser.id_user,
        name: basicUser.name,
        lastname: basicUser.lastname,
        email: basicUser.email,
        profileStatus: {
          isCustomerComplete,
          isProviderComplete,
          hasCompletedProfile: isCustomerComplete || isProviderComplete,
        },
      });

      return { success: true };
    } catch (error: any) {
      console.error('Error en el login:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'Error al iniciar sesión' };
    }
  };

  const register = async (name: string, lastname: string, email: string, password: string, role: 'customer' | 'provider' | 'both') => {
    try {
      await authApi.post('/register', { name, lastname, email, password, enabled: 1 });
      try {
        localStorage.setItem('pending_profile_role', role);
      } catch {}
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
    window.location.href = '/login';
  };

  const markProfileComplete = () => {
    try {
      localStorage.removeItem('pending_profile_role');
      const rawUser = localStorage.getItem('user');
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        setUser({
          id_user: parsed.id_user,
          name: parsed.name,
          lastname: parsed.lastname,
          email: parsed.email,
          profileStatus: {
            isCustomerComplete: true,
            isProviderComplete: true,
            hasCompletedProfile: true,
          },
        });
      }
    } catch {}
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    markProfileComplete,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Create a Hook to use the Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

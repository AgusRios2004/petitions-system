"use client";
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Define the shape of the User object
interface User {
  name: string;
  lastname: string;
  email: string;
  // Add any other user properties you expect from the API
}

// Define the shape of the context value
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, lastname: string, email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

// 1. Crear el Contexto with a default value of null
const AuthContext = createContext<AuthContextType | null>(null);

// 2. Crear el Proveedor del Contexto
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: 'http://localhost:3001/api/auth',
  });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // In a real app, you'd validate the token with the backend here
      // and fetch user data.
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
      
      return { success: true };
    } catch (error: any) {
      console.error('Error en el login:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'Error al iniciar sesión' };
    }
  };

  const register = async (name: string, lastname: string, email: string, password: string) => {
    try {
      await api.post('/register', { name, lastname, email, password });
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
    window.location.href = '/login';
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Crear un Hook para usar el Contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};
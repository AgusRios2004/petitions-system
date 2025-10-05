"use client";
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Define the shape of the User object to match the backend response
interface User {
  id_user: number;
  name: string;
  lastname: string;
  email: string;
  customer: object | null; // Define more specific types if you can
  provider: object | null; // Define more specific types if you can
  // Add any other user properties you expect from the API
}

// Define the shape of the context value
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, lastname: string, email: string, password: string, role: 'customer' | 'provider') => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

// 1. Create the Context
export const AuthContext = createContext<AuthContextType | null>(null);

// API instances
const authApi = axios.create({
  baseURL: 'http://localhost:3000/api/auth',
});

const profileApi = axios.create({
  baseURL: 'http://localhost:3000/api/profile',
});

// 2. Create the Provider
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          // Set token for future requests
          profileApi.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const response = await profileApi.get('/me');
          setUser(response.data.data); // Assuming the user object is in response.data.data based on your response middleware
        } catch (error) {
          console.error("Token verification failed", error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.post('/login', { email, password });
      const { accessToken, refreshToken, user } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Set token for subsequent profile requests
      profileApi.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      
      // Fetch full profile data
      const profileResponse = await profileApi.get('/me');
      setUser(profileResponse.data.data);

      return { success: true };
    } catch (error: any) {
      console.error('Error en el login:', error.response?.data || error.message);
      return { success: false, message: error.response?.data?.message || 'Error al iniciar sesión' };
    }
  };

  const register = async (name: string, lastname: string, email: string, password: string, role: 'customer' | 'provider') => {
    try {
      await authApi.post('/register', { name, lastname, email, password, role });
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
    delete profileApi.defaults.headers.common['Authorization'];
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

// 3. Create a Hook to use the Context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

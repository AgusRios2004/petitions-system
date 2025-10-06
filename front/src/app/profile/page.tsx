'use client';

import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Importar el hook useAuth

// --- TIPOS (Para claridad del código) ---
// Este tipo debe ser compatible con el objeto User del AuthContext
// y además tener la propiedad 'role' que necesitamos.
type ProfileUser = {
  id_user: number;
  name: string;
  lastname: string;
  email: string;
  role: 'customer' | 'provider'; // Asumimos que el rol viene en el objeto user
  profile_picture_url?: string | null;
  customer: object | null;
  provider: object | null;
};

// --- COMPONENTE PARA EL PERFIL DEL PROVEEDOR ---
const ProviderProfile = ({ user }: { user: ProfileUser }) => {
  const [activeTab, setActiveTab] = useState('perfil-publico');

  const tabs = [
    { id: 'perfil-publico', label: 'Mi Perfil Público' },
    { id: 'oportunidades', label: 'Buscar Oportunidades' },
    { id: 'postulaciones', label: 'Mis Postulaciones' },
    { id: 'disponibilidad', label: 'Disponibilidad' },
    { id: 'configuracion', label: 'Configuración' },
  ];

  return (
    <div>
      <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 bg-gray-800 rounded-lg min-h-[300px]">
        {activeTab === 'perfil-publico' && (
          <div>
            <h3 className="text-2xl font-semibold mb-4">Editor del Perfil Público</h3>
            <p className="text-gray-300">Aquí podrás editar la información que verán los clientes: tu foto, descripción, categorías de servicio y tu portafolio de trabajos anteriores.</p>
          </div>
        )}
        {activeTab === 'oportunidades' && (
          <div>
            <h3 className="text-2xl font-semibold mb-4">Buscar Oportunidades</h3>
            <p className="text-gray-300">En esta sección se mostrarán las peticiones de clientes que coincidan con tus habilidades y ubicación, listas para que te postules.</p>
          </div>
        )}
        {activeTab === 'postulaciones' && (
          <div>
            <h3 className="text-2xl font-semibold mb-4">Mis Postulaciones y Trabajos</h3>
            <p className="text-gray-300">Gestiona las postulaciones que has enviado, revisa si fueron aceptadas y administra tus trabajos en curso.</p>
          </div>
        )}
        {activeTab === 'disponibilidad' && (
          <div>
            <h3 className="text-2xl font-semibold mb-4">Gestionar Disponibilidad</h3>
            <p className="text-gray-300">Usa un calendario para definir tus horarios de trabajo y los días que no estás disponible, para que los clientes conozcan tu agenda.</p>
          </div>
        )}
         {activeTab === 'configuracion' && (
          <div>
            <h3 className="text-2xl font-semibold mb-4">Configuración de la Cuenta</h3>
            <p className="text-gray-300">Actualiza tu email, cambia tu contraseña y gestiona otros ajustes de tu cuenta.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// --- COMPONENTE PARA EL PERFIL DEL CLIENTE ---
const CustomerProfile = ({ user }: { user: ProfileUser }) => {
  const [activeTab, setActiveTab] = useState('peticiones');

  const tabs = [
    { id: 'peticiones', label: 'Mis Peticiones' },
    { id: 'informacion', label: 'Información Personal' },
    { id: 'historial', label: 'Historial y Calificaciones' },
  ];

  return (
    <div>
      <div className="border-b border-gray-700 mb-6">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? 'border-blue-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-lg transition-colors`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-6 bg-gray-800 rounded-lg min-h-[300px]">
        {activeTab === 'peticiones' && (
          <div>
            <h3 className="text-2xl font-semibold mb-4">Panel de Peticiones</h3>
            <p className="text-gray-300">Aquí se mostrará una lista de todas tus peticiones, su estado (abierta, en proceso, finalizada) y cuántos proveedores se han postulado.</p>
          </div>
        )}
        {activeTab === 'informacion' && (
          <div>
            <h3 className="text-2xl font-semibold mb-4">Información Personal</h3>
            <p className="text-gray-300">Desde aquí podrás editar tu nombre, foto de perfil, direcciones y cambiar tu contraseña.</p>
          </div>
        )}
        {activeTab === 'historial' && (
          <div>
            <h3 className="text-2xl font-semibold mb-4">Historial y Calificaciones</h3>
            <p className="text-gray-300">Consulta un registro de todos los servicios que has contratado y las calificaciones que has otorgado a los proveedores.</p>
          </div>
        )}
      </div>
    </div>
  );
};


// --- COMPONENTE PRINCIPAL DE LA PÁGINA DE PERFIL ---
export default function ProfilePage() {
  const { user, loading } = useAuth(); // Usar el hook y obtener 'loading'
  const router = useRouter();

  // Efecto para proteger la ruta: si no hay usuario, redirige a /login
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Muestra un estado de carga mientras se verifica la autenticación
  if (loading || !user) { // Comprobar 'loading' en lugar de 'isLoadingAuth'
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
        <p className="text-xl">Cargando perfil...</p>
      </div>
    );
  }

  // Hacemos un casting del usuario para asegurar que tiene el rol.
  // Esto es una solución temporal. Lo ideal es que el backend devuelva el rol.
  const profileUser = user as unknown as ProfileUser;
  if (!profileUser.role) {
    // Asignar un rol basado en si tiene un perfil de customer o provider
    profileUser.role = profileUser.provider ? 'provider' : 'customer';
  }

  // Una vez cargado, muestra el perfil correspondiente al rol
  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Encabezado con Bienvenida y Foto */}
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Bienvenido, {profileUser.name}
          </h1>
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
            {profileUser.profile_picture_url ? (
              <img src={profileUser.profile_picture_url} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-sm">Foto</span>
            )}
          </div>
        </header>

        {/* Renderizado condicional del panel de control según el rol */}
        {profileUser.role === 'provider' ? (
          <ProviderProfile user={profileUser} />
        ) : (
          <CustomerProfile user={profileUser} />
        )}
      </div>
    </main>
  );
}
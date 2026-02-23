'use client';

import React from 'react';
import EditProviderForm from '@/components/profile/provider/EditProviderForm';
import { useAuth } from '@/context/AuthContext';

const EditProfilePage = () => {
  const { user } = useAuth();

  // Extraer el ID del proveedor del usuario autenticado
  const providerId = user?.provider?.id_provider;

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            Editar Perfil
          </h1>
          <p className="text-gray-400 mt-2">
            Aquí podrás actualizar tu información personal, dirección y preferencias.
          </p>
        </header>


        {!providerId && (
          <div className="bg-yellow-900/50 text-yellow-200 p-4 rounded-lg">
            <p>No se encontró un perfil de proveedor asociado a tu cuenta.</p>
          </div>
        )}

        {providerId && <EditProviderForm providerId={providerId} />}
      </div>
    </main>
  );
};

export default EditProfilePage;

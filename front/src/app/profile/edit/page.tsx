'use client';

import React from 'react';
// import EditProfileForm from '@/components/profile/EditProfileForm'; // Futuro componente

const EditProfilePage = () => {
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

        <div className="p-6 bg-gray-800 rounded-lg">
          {/* Aquí iría el futuro componente del formulario */}
          {/* <EditProfileForm /> */}
          <p className="text-center text-yellow-400">
            El componente del formulario de edición (`EditProfileForm`) aún no ha sido creado.
          </p>
        </div>
      </div>
    </main>
  );
};

export default EditProfilePage;

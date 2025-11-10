'use client';

import React from 'react';

interface ProfileSettingsProps {
  // Puedes pasar props si es necesario, por ejemplo, el ID del usuario
  userId: number;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ userId }) => {
  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold text-white mb-4">Configuración del Perfil</h3>
      <div className="space-y-4 text-gray-300">
        <p>Aquí podrás gestionar la configuración de tu cuenta y perfil.</p>
        <p>ID de Usuario: <span className="font-semibold text-blue-400">{userId}</span></p>
        {/* Aquí irían formularios para cambiar contraseña, notificaciones, etc. */}
        <p className="text-sm text-gray-500 mt-6">
          **Nota:** Este componente `ProfileSettings` es un placeholder.
          Aquí es donde deberías colocar los formularios y la lógica
          para la configuración del perfil del proveedor.
        </p>
      </div>
    </div>
  );
};

export default ProfileSettings;

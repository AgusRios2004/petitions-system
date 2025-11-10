'use client';

import React from 'react';
import { UserProfile } from '@/types/common';

interface CustomerInfoProps {
  user: UserProfile;
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ user }) => {
  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold text-white mb-4">Información Personal</h3>
      <div className="space-y-4 text-gray-300">
        <p>Aquí se mostrará la información personal del cliente.</p>
        <p>Nombre: <span className="font-semibold text-blue-400">{user.name}</span></p>
        <p>Apellido: <span className="font-semibold text-blue-400">{user.lastname}</span></p>
        <p>Email: <span className="font-semibold text-blue-400">{user.email}</span></p>
        {/* Puedes añadir más campos aquí según la interfaz UserProfile o Customer */}
        <p className="text-sm text-gray-500 mt-6">
          **Nota:** Este componente `CustomerInfo` es un placeholder.
          Aquí es donde deberías colocar la lógica y la UI para mostrar
          la información personal real del cliente y, posiblemente, un formulario para editarla.
        </p>
      </div>
    </div>
  );
};

export default CustomerInfo;

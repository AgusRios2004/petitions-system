'use client';

import React from 'react';

interface IncompleteProfileProps {
  role: 'customer' | 'provider';
}

const IncompleteProfile: React.FC<IncompleteProfileProps> = ({ role }) => {
  return (
    <div className="text-center text-gray-400 mt-10 p-6 bg-gray-800 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Perfil Incompleto</h2>
      <p>
        Hemos detectado que tu cuenta de '{role === 'customer' ? 'cliente' : 'proveedor'}' no tiene un perfil de datos asociado.
      </p>
      <p className="mt-2">
        Esto puede ocurrir si el registro no se completó correctamente o por una inconsistencia en la base de datos. Por favor, contacta a soporte para solucionarlo.
      </p>
    </div>
  );
};

export default IncompleteProfile;

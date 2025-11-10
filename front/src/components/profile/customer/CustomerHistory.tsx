'use client';

import React from 'react';
import { ICustomer } from '@/types/common'; // Import ICustomer

interface CustomerHistoryProps {
  customer: ICustomer; // Now receives the detailed ICustomer object
}

const CustomerHistory: React.FC<CustomerHistoryProps> = ({ customer }) => {
  return (
    <div className="p-4">
      <h3 className="text-2xl font-bold text-white mb-4">Historial y Calificaciones</h3>
      <div className="space-y-4 text-gray-300">
        <p>Aquí se mostrará el historial de peticiones y las calificaciones del cliente.</p>
        <p>ID de Cliente: <span className="font-semibold text-blue-400">{customer.id_customer}</span></p>
        {/* Aquí irían listas de peticiones anteriores, calificaciones recibidas, etc. */}
        <p className="text-sm text-gray-500 mt-6">
          **Nota:** Este componente `CustomerHistory` es un placeholder.
          Aquí es donde deberías colocar la lógica y la UI para mostrar
          el historial de interacciones y las calificaciones del cliente.
        </p>
      </div>
    </div>
  );
};

export default CustomerHistory;

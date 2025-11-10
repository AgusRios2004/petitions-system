'use client';

import React from 'react';
import Link from 'next/link'; // Import Link
import { UserProfile, ICustomer } from '@/types/common';
import { Button } from '@/components/ui/Button'; // Import Button

interface CustomerInfoProps {
  customer: ICustomer; // El objeto ICustomer detallado que viene de la API
  user: UserProfile;   // El objeto UserProfile básico que viene del AuthContext
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ customer, user }) => {
  // La dirección detallada ahora viene directamente del objeto 'customer'
  const address = customer.address;

  return (
    <div className="p-4 bg-gray-800 rounded-lg shadow-lg">
      <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-3">Información Personal</h3>

      <div className="space-y-4 text-gray-300">
        {/* --- Información Básica del Usuario --- */}
        <p>
          <strong className="text-blue-400">Nombre:</strong> {user.name} {user.lastname}
        </p>
        <p>
          <strong className="text-blue-400">Email:</strong> {user.email}
        </p>

        {/* --- Información Específica del Cliente --- */}
        {customer.dni && (
          <p>
            <strong className="text-blue-400">DNI:</strong> {customer.dni}
          </p>
        )}
        {customer.phone && (
          <p>
            <strong className="text-blue-400">Teléfono:</strong> {customer.phone}
          </p>
        )}
        {customer.gender?.gender && (
          <p>
            <strong className="text-blue-400">Género:</strong> {customer.gender.gender}
          </p>
        )}

        {/* --- Dirección --- */}
        {address && (
          <div className="pt-4 border-t border-gray-700">
            <h4 className="text-xl font-semibold text-white mb-3">Dirección</h4>
            <p>
              <strong className="text-blue-400">Calle:</strong> {address.street} {address.number}
            </p>
            {address.floor && <p><strong className="text-blue-400">Piso:</strong> {address.floor}</p>}
            {address.apartment && <p><strong className="text-blue-400">Depto:</strong> {address.apartment}</p>}
            <p>
              <strong className="text-blue-400">Código Postal:</strong> {address.postal_code}
            </p>
            {address.city?.name && <p><strong className="text-blue-400">Ciudad:</strong> {address.city.name}</p>}
          </div>
        )}

        {/* --- Intereses --- */}
        {customer.interest?.category?.name && (
          <div className="pt-4 border-t border-gray-700">
            <h4 className="text-xl font-semibold text-white mb-3">Intereses</h4>
            <div className="bg-gray-700 p-3 rounded-md inline-block">
              <span className="text-blue-300 font-medium">
                {customer.interest.category.name}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* --- Botón de Editar Perfil --- */}
      <div className="mt-8 pt-6 border-t border-gray-700 flex justify-end">
        <Link href="/profile/edit">
          <Button variant="primary" size="lg">
            Editar Perfil
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CustomerInfo;
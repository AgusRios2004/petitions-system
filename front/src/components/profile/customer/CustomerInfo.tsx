'use client';

import React, { useState } from 'react';
import { UserProfile, ICustomer } from '@/types/common';
import { Button } from '@/components/ui/Button';
import EditCustomerForm from './EditCustomerForm'; // Importar el formulario de edición
import { CustomerInterestsManager } from './CustomerInterestsManager'; // Importar el gestor de intereses

interface CustomerInfoProps {
  customer: ICustomer; // El objeto ICustomer detallado que viene de la API
  user: UserProfile;   // El objeto UserProfile básico que viene del AuthContext
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ customer, user }) => {
  const [isEditing, setIsEditing] = useState(false);

  // La dirección detallada ahora viene directamente del objeto 'customer'
  const address = customer.address;

  // Si estamos en modo edición, mostramos ambos componentes: el formulario y el gestor de intereses
  if (isEditing) {
    return (
      <div className="space-y-8">
        <EditCustomerForm
          customer={customer}
          user={user}
          onFinished={() => setIsEditing(false)} // Función para volver al modo vista
        />
        <CustomerInterestsManager customerId={customer.id_customer} />
      </div>
    );
  }

  // Si no, mostramos la información del perfil
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
        <Button variant="primary" size="lg" onClick={() => setIsEditing(true)}>
          Editar Perfil
        </Button>
      </div>
    </div>
  );
};

export default CustomerInfo;
'use client';

import React, { useState } from 'react';
import { UserProfile, ICustomer } from '@/types/common';
import { Button } from '@/components/ui/Button';
import EditCustomerForm from './EditCustomerForm'; // Importar el formulario de edición
import { CustomerInterestsManager } from './CustomerInterestsManager'; // Importar el gestor de intereses
import { InfoItem } from '@/components/ui/InfoItem';
import { FiMail, FiPhone, FiMapPin, FiCalendar, FiFileText, FiTag, FiUser, FiHash } from 'react-icons/fi';
import ProfileImageUpdater from '../ProfileImageUpdater';
import { useQueryClient } from '@tanstack/react-query';

interface CustomerInfoProps {
  customer: ICustomer; // El objeto ICustomer detallado que viene de la API
  user: UserProfile;   // El objeto UserProfile básico que viene del AuthContext
}

const CustomerInfo: React.FC<CustomerInfoProps> = ({ customer, user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const address = customer.address;
  const fullLocation = [
    address?.city?.name,
    address?.city?.department?.province?.name,
    address?.city?.department?.province?.country?.name,
  ].filter(Boolean).join(', ');

  const memberSince = customer.user?.date_create
    ? new Date(customer.user.date_create).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : 'No disponible';

  const handleImageUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['customerProfile', customer.id_customer] });
  };

  if (isEditing) {
    return (
      <div className="space-y-8">
        <EditCustomerForm
          customer={customer}
          user={user}
          onFinished={() => setIsEditing(false)}
        />
        <CustomerInterestsManager customerId={customer.id_customer} />
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-center mb-8">
        <ProfileImageUpdater
          imageUrl={customer.user?.profile_image}
          userId={user.id_user}
          onUpdate={handleImageUpdate}
        />
      </div>

      <h3 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-3">Información Personal</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-gray-300">
        {/* Columna Izquierda */}
        <div className="space-y-6">
          <InfoItem icon={<FiUser size={20} />} label="Nombre Completo" value={`${user.name} ${user.lastname}`} />
          <InfoItem icon={<FiMail size={20} />} label="Email" value={user.email} />
          {customer.dni && <InfoItem icon={<FiHash size={20} />} label="DNI" value={customer.dni} />}
          {customer.phone && <InfoItem icon={<FiPhone size={20} />} label="Teléfono" value={customer.phone} />}
        </div>

        {/* Columna Derecha */}
        <div className="space-y-6">
          <InfoItem icon={<FiCalendar size={20} />} label="Miembro Desde" value={memberSince} />
          <InfoItem icon={<FiFileText size={20} />} label="Peticiones Totales" value={customer.petitions?.length ?? 0} />
          {customer.gender?.gender && <InfoItem icon={<FiUser size={20} />} label="Género" value={customer.gender.gender} />}
          {address && <InfoItem icon={<FiMapPin size={20} />} label="Ubicación" value={fullLocation} />}
        </div>
      </div>

      {/* --- Intereses --- */}
      <div className="mt-8 pt-6 border-t border-gray-700">
        <h4 className="text-xl font-semibold text-white mb-3 flex items-center">
          <FiTag className="mr-3 text-blue-400" size={22} />
          Intereses
        </h4>
        <div className="flex flex-wrap gap-3">
          {customer.interests && customer.interests.length > 0 ? (
            customer.interests.map((interest) => (
              <div key={interest.id_interest} className="flex items-center bg-sky-600 text-white px-4 py-2 rounded-full text-md font-medium">
                <span>{interest.category.name}</span>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No hay intereses registrados.</p>
          )}
        </div>
      </div>

      {/* --- Botón de Editar Perfil --- */}
      <div className="mt-12 pt-8 border-t border-white/10">
        <Button
          variant="primary"
          onClick={() => setIsEditing(true)}
          className="w-full !bg-blue-600 !hover:bg-blue-700 !text-white font-black text-xs uppercase tracking-[0.2em] h-14 rounded-2xl shadow-xl shadow-blue-900/40 border-none transition-all hover:scale-[1.01]"
        >
          Editar Perfil
        </Button>
      </div>
    </div>
  );
};

export default CustomerInfo;
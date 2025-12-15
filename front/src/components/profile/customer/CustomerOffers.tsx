'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { offerService } from '@/service/offerService';
import { IOffer, ICustomer } from '@/types/common';
import { FiCalendar, FiUser, FiFilter } from 'react-icons/fi';
import { Select } from '@/components/ui/Select';

interface CustomerOffersProps {
  customer?: ICustomer;
}

const CustomerOffers: React.FC<CustomerOffersProps> = ({ customer }) => {
  const [selectedCategoryId, setSelectedCategoryId] = React.useState<number | null>(null);

  // Extraemos los IDs de las categorías de interés del cliente
  const interestIds = customer?.interests?.map(i => i.category.id_category) || [];

  // Generamos las opciones del select basándonos SOLO en los intereses del cliente
  const categoryOptions = customer?.interests?.map(i => ({
    value: i.category.id_category,
    label: i.category.name
  })) || [];

  const activeFilterIds = selectedCategoryId ? [selectedCategoryId] : (interestIds.length > 0 ? interestIds : undefined);

  const { data: offersResponse, isLoading, isError } = useQuery({
    queryKey: ['activeOffers', activeFilterIds],
    queryFn: () => offerService.getAllOffers({ 
      activeNow: true, 
      categories: activeFilterIds 
    }),
    enabled: interestIds.length > 0 || !!selectedCategoryId, // Solo buscar si hay intereses o un filtro activo
  });

  const offers = offersResponse?.data?.offers || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <p className="text-gray-400 animate-pulse">Buscando ofertas disponibles...</p>
      </div>
    );
  }

  if (isError) {
    return <p className="text-red-400">Hubo un error al cargar las ofertas.</p>;
  }

  // Si el cliente no tiene intereses configurados, mostramos un mensaje en lugar de ofertas aleatorias
  if (interestIds.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700 border-dashed">
        <FiFilter className="mx-auto h-12 w-12 text-gray-600 mb-4" />
        <h3 className="text-lg font-medium text-gray-300">Sin intereses definidos</h3>
        <p className="text-gray-500 mt-2 max-w-sm mx-auto">Agrega categorías de interés a tu perfil para ver ofertas personalizadas de los proveedores.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white">Ofertas Disponibles</h3>
          {!selectedCategoryId && interestIds.length > 0 && (
            <span className="flex items-center gap-2 text-sm text-blue-300 bg-blue-900/30 px-3 py-1 rounded-full border border-blue-800 mt-2 w-fit">
              <FiFilter /> Basado en tus intereses
            </span>
          )}
        </div>
        
        <div className="w-full md:w-72">
          <Select
            label="Filtrar por categoría"
            options={categoryOptions}
            value={selectedCategoryId || 0}
            onChange={(val) => setSelectedCategoryId(val ? Number(val) : null)}
            placeholder={interestIds.length > 0 ? "Todos mis intereses" : "Sin intereses"}
            disabled={categoryOptions.length === 0}
          />
        </div>
      </div>

      {offers.length === 0 ? (
        <div className="text-center py-10 bg-gray-800/50 rounded-lg border border-gray-700">
          <p className="text-gray-400 text-lg">No se encontraron ofertas con este criterio.</p>
          <p className="text-sm text-gray-500 mt-2">Intenta seleccionar otra categoría o ver todas.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer: IOffer) => (
          <div 
            key={offer.offer_id} 
            className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden hover:border-blue-500 transition-all hover:shadow-lg hover:shadow-blue-900/20 group"
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <span className="bg-blue-900/60 text-blue-200 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-800">
                  {offer.typeOffer?.name || 'Servicio'}
                </span>
              </div>

              <h4 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">{offer.name}</h4>
              <p className="text-gray-400 text-sm mb-4 line-clamp-3 min-h-[60px]">{offer.description}</p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-700">
                <img 
                  src={offer.provider?.user.profile_image || '/default-avatar.png'} 
                  alt="Provider" 
                  className="w-8 h-8 rounded-full object-cover border border-gray-600"
                />
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500">Ofrecido por:</span>
                  <span className="text-sm font-medium text-gray-200">{offer.provider?.user.name} {offer.provider?.user.lastname}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};

export default CustomerOffers;
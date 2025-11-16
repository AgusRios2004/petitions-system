'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiBriefcase, FiTag, FiMapPin, FiCalendar, FiClock, FiGrid, FiFolder, FiStar, FiFileText, FiLink, FiDownload } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { getProfilePublicProvider } from '@/service/providerService';
import { IProvider, IAvailability, IPortfolioItem } from '@/types/common';
import AvailabilityCard from '@/components/availability/AvailabilityCard';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import InfoRow from '@/components/ui/InfoRow';
import AddPortfolioButton from '@/components/portfolio/AddPortfolioButton';

import ProfileImageUpdater from '../ProfileImageUpdater';
import { useQueryClient } from '@tanstack/react-query';

interface PortfolioCardProps {
  item: IPortfolioItem;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ item }) => {
  return (
      <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
          <h3 className="font-bold text-white text-lg">{item.name}</h3>
          <p className="text-gray-400 mb-2">{item.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
              {item.attachments && item.attachments.length > 0 ? (
                  item.attachments.map((file, fileIndex) => (
                      <a
                          key={fileIndex}
                          href={`http://localhost:3001/uploads/${file.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-slate-700 hover:bg-slate-600 text-cyan-400 px-3 py-1 rounded text-sm flex items-center gap-2 transition-colors"
                      >
                          <FiFileText />
                          {file.name}
                          <FiDownload className="ml-2" />
                      </a>
                  ))
              ) : (
                  <span className="text-gray-500 text-xs italic">Sin archivos adjuntos</span>
              )}
          </div>
      </div>
  );
};

interface PublicProfileContentProps {
  providerId: number;
}

const PublicProfileContent: React.FC<PublicProfileContentProps> = ({ providerId }) => {
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [selectedDay, setSelectedDay] = useState<string>('');
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    if (user && user.provider) {
      setIsOwner(user.provider.id_provider.toString() === providerId.toString());
    }
  }, [user, providerId]);

  const { data: provider, isLoading, isError, error, refetch } = useQuery<IProvider, Error>({
    queryKey: ['providerPublicProfile', providerId],
    queryFn: () => getProfilePublicProvider(providerId.toString()),
    enabled: !!providerId,
  });

  if (isLoading) {
    return <div>Cargando perfil del proveedor...</div>;
  }

  if (isError) {
    return <div>Error al cargar el perfil del proveedor: {error?.message}</div>;
  }

  if (!provider) {
    return <div>No se encontró el perfil del proveedor.</div>;
  }

  const handleImageUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['providerPublicProfile', providerId] });
  };

  const filteredAvailabilities = selectedDay
    ? provider.availabilities?.filter(
        (availability) => availability.week.name.toLowerCase() === selectedDay.toLowerCase()
      )
    : provider.availabilities;

  console.log(provider)

  return (
    <div className="min-h-screen bg-gray-800 text-gray-100 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-8">
          {isOwner && user ? (
            <ProfileImageUpdater
              imageUrl={provider.user.profile_image}
              userId={user.id_user}
              onUpdate={handleImageUpdate}
            />
          ) : (
            <img
              src={provider.user.profile_image || '/default-avatar.png'}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-cyan-600 shadow-lg"
            />
          )}
        </div>

        <h1 className="text-4xl font-extrabold mb-10 text-center text-white tracking-tight">
          Perfil Público de {provider.user.name} {provider.user.lastname}
        </h1>

        <div className="flex justify-end items-center gap-4 mb-8">
          {isOwner ? (
            <>
              <AddPortfolioButton providerId={providerId} />
              <Button
                onClick={() => router.push('/profile/edit')}
                className="!bg-blue-600 !hover:bg-blue-700"
              >
                Editar Perfil
              </Button>
            </>
          ) : user?.customer ? (
            <a
              href={`/provider/${providerId}/postulations`}
              className="inline-block bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Ver Historial de Postulaciones
            </a>
          ) : null}
        </div>

        <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2 flex items-center">
            <FiUser className="mr-3 text-blue-400" size={24} />
            Información Personal
          </h2>
          <InfoRow icon={FiUser} label="Nombre">
            {provider.user.name} {provider.user.lastname}
          </InfoRow>
          <InfoRow icon={FiTag} label="Tipo de Proveedor">
            {provider.typeProvider.name}
          </InfoRow>
          <InfoRow icon={FiBriefcase} label="Profesión">
            {provider.profession.name}
          </InfoRow>
        </div>
        {provider.address && (
          <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2 flex items-center">
              <FiMapPin className="mr-3 text-blue-400" size={24} />
              Dirección
            </h2>
            <InfoRow icon={FiMapPin} label="Calle">
              {provider.address.street} {provider.address.number}
            </InfoRow>
            {provider.address.floor && (
              <InfoRow icon={FiMapPin} label="Piso">
                {provider.address.floor}
              </InfoRow>
            )}
            {provider.address.apartment && (
              <InfoRow icon={FiMapPin} label="Departamento">
                {provider.address.apartment}
              </InfoRow>
            )}
            <InfoRow icon={FiMapPin} label="Código Postal">
              {provider.address.postal_code}
            </InfoRow>
            <InfoRow icon={FiMapPin} label="Ciudad">
              {provider.address.city.name}
            </InfoRow>
          </div>
        )}

        {provider.availabilities && provider.availabilities.length > 0 && (
          <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2 flex items-center">
              <FiCalendar className="mr-3 text-blue-400" size={24} />
              Filtrar Disponibilidades
            </h2>
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="block w-full p-2 mb-4 text-gray-900 border border-gray-300 rounded-lg bg-gray-400 focus:ring-cyan-500 focus:border-cyan-500"
            >
              <option value="">Todos los días</option>
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
              <option value="Sábado">Sábado</option>
              <option value="Domingo">Domingo</option>
            </select>
          </div>
        )}

      {provider.availabilities && provider.availabilities.length > 0 && (
        <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2 flex items-center">
            <FiClock className="mr-3 text-blue-400" size={24} />
            Disponibildades
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAvailabilities?.map((availability: IAvailability) => (
              <AvailabilityCard
                key={availability.id_availability}
                availability={availability}
                showControls={false}
              />
            ))}
          </div>
        </div>
      )}

        {provider.providerCategories && provider.providerCategories.length > 0 && (
          <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2 flex items-center">
              <FiGrid className="mr-3 text-blue-400" size={24} />
              Categorías
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {provider.providerCategories.map((pc) => (
                <InfoRow key={pc.id_provider_category} icon={FiTag} label="Categoría">
                  {pc.category.name}
                </InfoRow>
              ))}
            </div>
          </div>
        )}

        {provider.portfolios && provider.portfolios.length > 0 && (
          <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:-shadow-2xl hover:shadow-black/50">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2 flex items-center">
              <FiFolder className="mr-3 text-blue-400" size={24} />
              Portafolio
            </h2>
            {provider.portfolios.map((item, index) => (
              <PortfolioCard key={index} item={item} />
            ))}
          </div>
        )}

        {provider.grades && provider.grades.length > 0 && (
          <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2 flex items-center">
              <FiStar className="mr-3 text-blue-400" size={24} />
              Calificaciones
            </h2>
            {provider.grades.map((grade, index) => (
              <InfoRow key={index} icon={FiStar} label="Puntuación">
                <span className="text-yellow-400">{grade.score}</span>
              </InfoRow>
            ))}
          </div>
        )}

        {!isOwner && (
          <div className="mt-8">
            <Button
              onClick={() => router.back()}
              variant="secondary"
              size="md"
              fullWidth={true}
              className="!bg-gray-600 !hover:bg-gray-700 !text-white !font-bold !transition-colors"
            >
              Volver
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfileContent;

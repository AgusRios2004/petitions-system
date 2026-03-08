'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { FiUser, FiBriefcase, FiTag, FiMapPin, FiCalendar, FiClock, FiGrid, FiFolder, FiStar, FiFileText, FiLink, FiDownload } from 'react-icons/fi';
import { useQuery } from '@tanstack/react-query';
import { getProfilePublicProvider } from '@/service/providerService';
import { IProvider, IAvailability, IPortfolioItem } from '@/types/common';
import AvailabilityCard from '@/components/availability/AvailabilityCard';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import InfoRow from '@/components/ui/InfoRow';
import AddPortfolioButton from '@/components/portfolio/AddPortfolioButton';
import ProfileImageUpdater from '../ProfileImageUpdater';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { portfolioService } from '@/service/portfolioService';
import PortfolioCard from '@/components/portfolio/PortfolioCard';
import { ProviderCategoriesManager } from './ProviderCategoriesManager';
import StarRatingDisplay from '@/components/ui/StarRatingDisplay';

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

  const deletePortfolioMutation = useMutation({
    mutationFn: ({ id_portfolio, id_provider }: { id_portfolio: number; id_provider: number }) =>
      portfolioService.deletePortfolio(id_portfolio, id_provider),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['providerPublicProfile', providerId] });
    },
    onError: (error: unknown) => {
      console.error('Error al eliminar el portafolio:', error);
    },
  });

  const handleDeletePortfolio = (id_portfolio: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este elemento del portafolio?')) {
      if (user?.provider?.id_provider) {
        deletePortfolioMutation.mutate({ id_portfolio, id_provider: user.provider.id_provider });
      }
    }
  };

  const averageRating = useMemo(() => {
    if (!provider?.grades || provider.grades.length === 0) {
      return 0;
    }
    const total = provider.grades.reduce((acc, grade) => acc + grade.grades.grade_number, 0);
    const avg = total / provider.grades.length;
    return Math.round(avg * 10) / 10; // Redondea a un decimal
  }, [provider?.grades]);

  const handleImageUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['providerPublicProfile', providerId] });
  };

  const filteredAvailabilities = provider?.availabilities?.filter(
    (availability) => !selectedDay || availability.week.name.toLowerCase() === selectedDay.toLowerCase()
  );

  if (isLoading) {
    return <div>Cargando perfil del proveedor...</div>;
  }

  if (isError) {
    return <div>Error al cargar el perfil del proveedor: {error?.message}</div>;
  }

  if (!provider) {
    return <div>No se encontró el perfil del proveedor.</div>;
  }

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

        <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mb-8">
          {isOwner ? (
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <AddPortfolioButton providerId={providerId} />
              <Button
                onClick={() => router.push('/profile/edit')}
                className="!bg-blue-600 !hover:bg-blue-700 w-full sm:w-auto font-bold px-6"
              >
                Editar Perfil
              </Button>
            </div>
          ) : user?.customer ? (
            <Link
              href={`/provider/${providerId}/postulations`}
              className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2.5 px-6 rounded-xl transition-all shadow-lg shadow-cyan-900/20 text-center"
            >
              Ver Historial de Postulaciones
            </Link>
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
              <option key="all" value="">Todos los días</option>
              <option key="monday" value="Lunes">Lunes</option>
              <option key="tuesday" value="Martes">Martes</option>
              <option key="wednesday" value="Miércoles">Miércoles</option>
              <option key="thursday" value="Jueves">Jueves</option>
              <option key="friday" value="Viernes">Viernes</option>
              <option key="saturday" value="Sábado">Sábado</option>
              <option key="sunday" value="Domingo">Domingo</option>
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

        <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
          <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2 flex items-center">
            <FiGrid className="mr-3 text-blue-400" size={24} />
            Categorías
          </h2>
          {isOwner ? (
            <ProviderCategoriesManager providerId={provider.id_provider} currentCategories={provider.providerCategories || []} />
          ) : (
            provider.providerCategories && provider.providerCategories.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {provider.providerCategories.map((pc) => (
                  <InfoRow key={pc.id} icon={FiTag} label="Categoría">
                    {pc.category.name}
                  </InfoRow>
                ))}
              </div>
            )
          )}
        </div>

        {provider.portfolios && provider.portfolios.length > 0 && (
          <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:-shadow-2xl hover:shadow-black/50">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2 flex items-center">
              <FiFolder className="mr-3 text-blue-400" size={24} />
              Portafolio
            </h2>
            {provider.portfolios.map((item) => (
              <PortfolioCard
                key={item.id_portfolio}
                item={item}
                isOwner={isOwner}
                onDelete={handleDeletePortfolio}
              />
            ))}
          </div>
        )}

        {provider.grades && provider.grades.length > 0 && (
          <div className="bg-gray-700/90 backdrop-blur-md shadow-lg shadow-black/40 rounded-2xl p-6 mb-8 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/50">
            <h2 className="text-2xl font-semibold mb-4 text-cyan-400 border-b border-cyan-600/40 pb-2 flex items-center">
              <FiStar className="mr-3 text-blue-400" size={24} />
              Calificaciones
            </h2>
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-800/50 rounded-lg">
              <StarRatingDisplay rating={averageRating} size={28} />
              <div>
                <p className="text-2xl font-bold text-white">{averageRating} de 5</p>
                <p className="text-sm text-gray-400">Basado en {provider.grades.length} calificación(es)</p>
              </div>
            </div>
          </div>
        )}
        <div className="space-y-4">
          {provider.grades && provider.grades.length > 0 && provider.grades.map((grade, index) => (
            <div key={index} className="bg-gray-800/50 p-4 rounded-lg border border-gray-600">
              <div className="flex justify-between mb-2">
                <div className="flex items-center gap-1 text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <FiStar key={i} size={14} fill={i < grade.grades.grade_number ? "currentColor" : "none"} />
                  ))}
                </div>
                <span className="text-xs text-gray-500">
                  {/* Si tienes fecha en el grade, úsala aquí: new Date(grade.createdAt).toLocaleDateString() */}
                  Reseña verificada
                </span>
              </div>

              {/* EL COMENTARIO (Lo más importante) */}
              <p className="text-gray-200 italic">
                &quot;{grade.coment || 'Sin comentario escrito.'}&quot;
              </p>

            </div>
          ))}
        </div>

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
      </div>
    </div>
  );
};

export default PublicProfileContent;

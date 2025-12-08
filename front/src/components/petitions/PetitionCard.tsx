'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getStatusColor } from '@/helpers/statusHelper';
import { useState, Fragment, useMemo, useEffect } from 'react';
import RatingModal from '../../components/petitions/RatingModal'; 
import StarRatingDisplay from '../ui/StarRatingDisplay';
import { IPetitionCardData } from '@/types/common';

interface PetitionCardProps {
  petition: IPetitionCardData;
}


const PetitionCard: React.FC<PetitionCardProps> = ({ petition }) => {
  console.log('PetitionCardProps:', petition)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [customerRating, setCustomerRating] = useState<number | null>(null);

  const creationDate = new Date(petition.date_create).toLocaleDateString();
  const sinceDate = new Date(petition.date_since).toLocaleDateString();
  const untilDate = new Date(petition.date_until).toLocaleDateString();

  const acceptedPostulation = useMemo(() => {
    const acceptedPostulation = petition.postulations?.find(
      p => p.states.state === 'Aceptado'
    );
    return acceptedPostulation;
  }, [petition.postulations]);

  const postulationCount = petition.postulations?.length || 0;

  useEffect(() => {
    if (petition.customers && petition.customers.average_rating !== undefined) {
      // El backend devuelve el rating como un string, lo convertimos a número.
      const rating = petition.customers.average_rating ? parseFloat(petition.customers.average_rating as any) : null;
      setCustomerRating(rating);
    }
  }, [petition.customers]);

  return (
    <Fragment>
      <div className="group relative rounded-xl border border-white/10 bg-gray-800/50 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 ease-in-out hover:-translate-y-1 flex flex-col justify-between h-full">
        {postulationCount > 0 && (
          <div className="absolute top-0 right-0 -mt-2 -mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500 text-xs font-bold text-white shadow-lg">
            {postulationCount}
          </div>
        )}

        <div>
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-white">{petition.customers?.user?.name} {petition.customers?.user?.lastname}</h3>
            {customerRating !== null && customerRating > 0 && <StarRatingDisplay rating={customerRating} size={18} />}
          </div>
          <div className="flex justify-between items-start mb-3">
            <span className="text-sm font-medium text-gray-400">
              {petition.typePetitions?.name || 'Sin Categoría'}
            </span>
            <span
              className={`px-2.5 py-1 text-xs font-semibold rounded-full whitespace-normal ${getStatusColor(petition.states?.state)}`}
            >
              {petition.states?.state || 'Sin Estado'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-4 [display:-webkit-box] [-webkit-line-clamp:3] [-webkit-box-orient:vertical] [overflow:hidden]">
            {petition.description}
          </h3>
          <div className="mt-4 border-t border-white/10 pt-4 text-xs text-gray-400">
            <p>Disponible desde el <span className="font-semibold text-gray-300">{sinceDate}</span> hasta el <span className="font-semibold text-gray-300">{untilDate}</span></p>
          </div>
        </div>
        
        {/* --- SECCIÓN DEL PROVEEDOR ASIGNADO --- */}
        {acceptedPostulation && (
          <div className="mt-4 pt-4 border-t border-white/20">
            <p className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">Proveedor Asignado</p>
            <p className="text-lg font-bold text-white">
              {acceptedPostulation.provider.user.name} {acceptedPostulation.provider.user.lastname}
            </p>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">Creada: {creationDate}</span>
          <div className="flex items-center gap-2">
            {acceptedPostulation && (
              <Button 
                fullWidth={false} 
                size="sm" 
                variant="secondary"
                onClick={() => setIsRatingModalOpen(true)}
              >
                Calificar
              </Button>
            )}
            <Link href={`/petition/${petition.id_petition}`}>
              <Button fullWidth={false} size="sm" variant="primary">Ver Detalles</Button>
            </Link>
          </div>
        </div>
      </div>
      
      {/* El modal se renderiza si hay un proveedor aceptado */}
      {acceptedPostulation && (
        <RatingModal
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          providerId={acceptedPostulation.id_provider}
          customerId={petition.id_customer}
          ratingTarget="provider"
        />
      )}
    </Fragment>
  );
};

export default PetitionCard;
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { getStatusColor } from '@/helpers/statusHelper';

// Definimos una interfaz completa para la petición
interface Petition {
  id_petition: number;
  description: string;
  date_create: string;
  date_since: string;
  date_until: string;
  states: {
    state: string;
  };
  typePetitions: {
    name: string;
  };
}

interface PetitionCardProps {
  petition: Petition;
}

const PetitionCard: React.FC<PetitionCardProps> = ({ petition }) => {
  const creationDate = new Date(petition.date_create).toLocaleDateString();
  const sinceDate = new Date(petition.date_since).toLocaleDateString();
  const untilDate = new Date(petition.date_until).toLocaleDateString();

  return (
    <div className="group relative rounded-xl border border-white/10 bg-gray-800/50 p-6 shadow-xl backdrop-blur-sm transition-all duration-300 ease-in-out hover:-translate-y-1 flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-3">
          <span className="text-sm font-medium text-gray-400">
            {petition.typePetitions?.name || 'Sin Categoría'}
          </span>
          <span
            className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusColor(petition.states?.state)}`}
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
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">Creada: {creationDate}</span>
        <Link href={`/petition/${petition.id_petition}`}>
          <Button fullWidth={false} size="sm">Ver Detalles</Button>
        </Link>
      </div>
    </div>
  );
};

export default PetitionCard;
import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';

interface Postulation {
  id_postulation: number;
  proposal: string;
  cost: number;
  winner: boolean;
  date_create: string;
  providers: {
    id_provider: number;
    users: {
      name: string;
      lastname: string;
    };
  };
  states: {
    state: string;
  };
  petition: {
    id_petition: number;
    description: string;
  };
}

interface PostulationCardProps {
  postulation: Postulation;  
}

const PostulationCard: React.FC<PostulationCardProps> = ({ postulation }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-lg font-semibold text-gray-800">
            {postulation.providers.users.name} {postulation.providers.users.lastname}
          </p>
          <p className="text-sm text-gray-500 mt-2">{postulation.petition.description.substring(0, 50)}...</p>
          <p className="text-sm text-gray-600 mt-1">Propuesta: {postulation.proposal}</p>
          <p className="text-sm font-bold text-gray-800 mt-1">Costo: ${postulation.cost}</p>
        </div>
        <div className="text-right">
          <span className={`text-sm font-semibold px-3 py-1 rounded-full ${postulation.states.state === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {postulation.states.state}
          </span>
          {postulation.winner && (
            <span className="mt-2 inline-block text-sm font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-800">
              Ganador
            </span>
          )}
        </div>
      </div>
      <div className='flex justify-end mt-4'>
        <Link href={`/postulation/${postulation.id_postulation}`}>
          <Button variant='secondary' fullWidth={false} >Ver detalles</Button>
        </Link>
      </div>
      <div className="text-right text-xs text-gray-500 mt-4">
        Postulado el: {new Date(postulation.date_create).toLocaleDateString()}
      </div>
    </div>
  );
};

export default PostulationCard;

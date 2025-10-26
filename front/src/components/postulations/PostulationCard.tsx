import React from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { getStatusColor } from '@/helpers/statusHelper';
import { IPostulation } from '@/types/common';

interface PostulationCardProps {
  postulation: IPostulation;
  role: 'provider' | 'customer';
}

const PostulationCard: React.FC<PostulationCardProps> = ({ postulation, role }) => {
  console.log(postulation)
  return (
    <div className="bg-gray-800 shadow-md rounded-lg p-4 border border-gray-700 text-gray-100">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-lg font-semibold text-white">
            {postulation.createdBy.name} {postulation.createdBy.lastname}
          </p>
          <p className="text-sm text-gray-300 mt-2">{postulation.petition.description}</p>
          <p className="text-sm text-gray-200 mt-1">Propuesta: {postulation.proposal}</p>
          <p className="text-sm font-bold text-white mt-1">Costo: ${postulation.cost}</p>
        </div>
        <div className="text-right">
          {postulation.winner ? (
            <span className={`mt-2 inline-block text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor('Aceptado')}`}>
              Ganador
            </span>
          ) : (
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${getStatusColor(postulation.states.state)}`}>
              {postulation.states.state}
            </span>
          )}
        </div>
      </div>
      <div className='flex justify-end mt-4 gap-2'>
        {role === 'provider' && (
            <Link href={`/postulation/edit/${postulation.id_postulation}`}>
                <Button variant='primary' fullWidth={false}>Editar</Button>
            </Link>
        )}
        <Link href={`/postulation/${postulation.id_postulation}`}>
          <Button variant='secondary' fullWidth={false} >Ver detalles</Button>
        </Link>
      </div>
      <div className="text-right text-xs text-gray-400 mt-4">
        Postulado el: {new Date(postulation.date_create).toLocaleDateString()}
      </div>
    </div>
  );
};

export default PostulationCard;
